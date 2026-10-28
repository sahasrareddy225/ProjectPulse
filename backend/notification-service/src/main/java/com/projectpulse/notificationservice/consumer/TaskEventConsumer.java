package com.projectpulse.notificationservice.consumer;

import com.projectpulse.notificationservice.event.TaskEvent;
import com.projectpulse.notificationservice.model.Notification;
import com.projectpulse.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class TaskEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(TaskEventConsumer.class);

    private final NotificationRepository notificationRepository;
    private final List<TaskEvent> receivedEvents = new CopyOnWriteArrayList<>();

    public TaskEventConsumer() {
        this(null);
    }

    @Autowired
    public TaskEventConsumer(@Autowired(required = false) NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @KafkaListener(
            topics = "task-events",
            groupId = "${spring.kafka.consumer.group-id:notification-service-group}",
            autoStartup = "${kafka.consumer.auto-startup:true}"
    )
    public void handleTaskEvent(
            @Payload TaskEvent event,
            @Header(value = KafkaHeaders.RECEIVED_TOPIC, required = false) String topic,
            @Header(value = KafkaHeaders.RECEIVED_PARTITION, required = false) Integer partition,
            @Header(value = KafkaHeaders.OFFSET, required = false) Long offset) {

        if (event == null) {
            log.warn("[NotificationService] Received null TaskEvent, ignoring");
            return;
        }

        try {
            log.info("[NotificationService] Received TaskEvent (type='{}', taskId='{}', recipient='{}') from topic='{}'",
                    event.getType(), event.getTaskId(), event.getRecipientUserId(), topic != null ? topic : "task-events");

            String eventId = (event.getEventId() != null && !event.getEventId().isBlank())
                    ? event.getEventId()
                    : ("task_" + event.getTaskId() + "_" + event.getType() + "_" + event.getTimestamp());

            if (notificationRepository != null) {
                // Idempotency check: duplicate event handling
                if (notificationRepository.existsByEventId(eventId)) {
                    log.warn("[NotificationService] Duplicate TaskEvent detected for eventId='{}', skipping", eventId);
                    receivedEvents.add(event);
                    return;
                }

                String recipientId = (event.getRecipientUserId() != null && !event.getRecipientUserId().isBlank())
                        ? event.getRecipientUserId()
                        : "1"; // Fallback to workspace owner if unassigned

                String title;
                String message;
                String actor = event.getActorName() != null ? event.getActorName() : "A team member";
                String taskTitle = event.getTaskTitle() != null ? event.getTaskTitle() : "Untitled Task";

                String type = event.getType() != null ? event.getType() : "TASK_UPDATED";
                switch (type) {
                    case "TASK_CREATED":
                        title = "Task Created";
                        message = "New task '" + taskTitle + "' was created by " + actor + ".";
                        break;
                    case "TASK_ASSIGNED":
                        title = "Task Assigned";
                        message = "You were assigned to task '" + taskTitle + "' by " + actor + ".";
                        break;
                    case "TASK_COMPLETED":
                        title = "Task Completed";
                        message = "Task '" + taskTitle + "' was marked completed by " + actor + ".";
                        break;
                    case "TASK_STATUS_CHANGED":
                    default:
                        title = "Task Status Updated";
                        message = "Status of task '" + taskTitle + "' was updated by " + actor + ".";
                        break;
                }

                Notification notification = new Notification();
                notification.setEventId(eventId);
                notification.setRecipientId(recipientId);
                notification.setType(type);
                notification.setTitle(title);
                notification.setMessage(message);
                notification.setProjectId(event.getProjectId());
                notification.setTaskId(event.getTaskId());
                notification.setCreatedAt(event.getTimestamp() > 0 ? Instant.ofEpochMilli(event.getTimestamp()) : Instant.now());
                notification.setRead(false);

                try {
                    notificationRepository.save(notification);
                    log.info("[NotificationService] Persisted notification: id='{}', eventId='{}', recipient='{}'",
                            notification.getId(), eventId, recipientId);
                } catch (DuplicateKeyException dke) {
                    log.warn("[NotificationService] Concurrent duplicate task event insert caught for eventId='{}'", eventId);
                }
            }

            receivedEvents.add(event);
        } catch (Exception ex) {
            log.error("[NotificationService] Error processing TaskEvent: {}", ex.getMessage(), ex);
        }
    }

    public List<TaskEvent> getReceivedEvents() {
        return Collections.unmodifiableList(receivedEvents);
    }

    public void clear() {
        receivedEvents.clear();
    }
}
