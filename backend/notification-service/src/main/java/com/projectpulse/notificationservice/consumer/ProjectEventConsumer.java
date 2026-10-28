package com.projectpulse.notificationservice.consumer;

import com.projectpulse.notificationservice.event.ProjectCreatedEvent;
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
public class ProjectEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ProjectEventConsumer.class);

    private final NotificationRepository notificationRepository;
    private final List<ProjectCreatedEvent> receivedEvents = new CopyOnWriteArrayList<>();

    public ProjectEventConsumer() {
        this(null);
    }

    @Autowired
    public ProjectEventConsumer(@Autowired(required = false) NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @KafkaListener(
            topics = "project-events",
            groupId = "${spring.kafka.consumer.group-id:notification-service-group}",
            autoStartup = "${kafka.consumer.auto-startup:true}"
    )
    public void handleProjectCreated(
            @Payload ProjectCreatedEvent event,
            @Header(value = KafkaHeaders.RECEIVED_TOPIC, required = false) String topic,
            @Header(value = KafkaHeaders.RECEIVED_PARTITION, required = false) Integer partition,
            @Header(value = KafkaHeaders.OFFSET, required = false) Long offset) {
        if (event == null) {
            log.warn("[NotificationService] Received null ProjectCreatedEvent, ignoring");
            return;
        }

        try {
            log.info("[NotificationService] Received ProjectCreatedEvent from topic='{}' [partition={}, offset={}]: eventId='{}', projectId='{}', name='{}', owner='{}', userId='{}', timestamp={}",
                    topic != null ? topic : "project-events",
                    partition != null ? partition : 0,
                    offset != null ? offset : 0,
                    event.getEventId(),
                    event.getProjectId(),
                    event.getName(),
                    event.getOwner(),
                    event.getUserId(),
                    event.getTimestamp());

            // Handle duplicate event delivery safely so the same Kafka event does not create duplicate notifications.
            String eventId = (event.getEventId() != null && !event.getEventId().isBlank())
                    ? event.getEventId()
                    : (event.getProjectId() + "_" + event.getTimestamp());

            if (notificationRepository != null) {
                if (notificationRepository.existsByEventId(eventId)) {
                    log.warn("[NotificationService] Duplicate event detected for eventId='{}' (projectId='{}'), skipping persistence",
                            eventId, event.getProjectId());
                    receivedEvents.add(event);
                    return;
                }

                // Do not invent a recipient when ownership cannot be established.
                String recipientId = (event.getUserId() != null && !event.getUserId().isBlank())
                        ? event.getUserId()
                        : null;

                String projectName = event.getName() != null && !event.getName().isBlank() ? event.getName() : "Untitled";
                String ownerName = event.getOwner() != null && !event.getOwner().isBlank() ? event.getOwner() : "Workspace Owner";

                Notification notification = new Notification();
                notification.setEventId(eventId);
                notification.setRecipientId(recipientId);
                notification.setType("PROJECT_CREATED");
                notification.setTitle("Project created");
                notification.setMessage("Project '" + projectName + "' was created by " + ownerName + ".");
                notification.setProjectId(event.getProjectId());
                notification.setCreatedAt(event.getTimestamp() > 0 ? Instant.ofEpochMilli(event.getTimestamp()) : Instant.now());
                notification.setRead(false);

                try {
                    notificationRepository.save(notification);
                    log.info("[NotificationService] Persisted notification to notification_db: id='{}', eventId='{}', recipient='{}'",
                            notification.getId(), eventId, recipientId);
                } catch (DuplicateKeyException dke) {
                    log.warn("[NotificationService] Concurrent duplicate event insert for eventId='{}' caught and handled safely", eventId);
                }
            }

            receivedEvents.add(event);
        } catch (Exception ex) {
            log.error("[NotificationService] Error processing ProjectCreatedEvent: {}", ex.getMessage(), ex);
        }
    }

    public List<ProjectCreatedEvent> getReceivedEvents() {
        return Collections.unmodifiableList(receivedEvents);
    }

    public void clear() {
        receivedEvents.clear();
    }
}
