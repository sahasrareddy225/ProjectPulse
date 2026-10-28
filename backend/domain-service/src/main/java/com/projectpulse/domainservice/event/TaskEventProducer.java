package com.projectpulse.domainservice.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Component
public class TaskEventProducer {

    private static final Logger log = LoggerFactory.getLogger(TaskEventProducer.class);
    public static final String TOPIC_TASK_EVENTS = "task-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final boolean kafkaEnabled;

    public TaskEventProducer(
            @Autowired(required = false) KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${kafka.enabled:true}") boolean kafkaEnabled) {
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaEnabled = kafkaEnabled;
    }

    public CompletableFuture<SendResult<String, Object>> publishTaskEvent(
            String taskId,
            String projectId,
            String taskTitle,
            String type,
            String recipientUserId,
            String assigneeName,
            String actorName) {

        TaskEvent event = new TaskEvent(
                UUID.randomUUID().toString(),
                taskId,
                projectId,
                taskTitle,
                type,
                recipientUserId,
                assigneeName,
                actorName,
                Instant.now().toEpochMilli()
        );

        if (!kafkaEnabled || kafkaTemplate == null) {
            log.info("[TaskEventProducer] Kafka publishing disabled or template unavailable. Skipped event: {} for task {}",
                    type, taskId);
            CompletableFuture<SendResult<String, Object>> disabledFuture = new CompletableFuture<>();
            disabledFuture.completeExceptionally(new IllegalStateException("Kafka publishing disabled"));
            return disabledFuture;
        }

        try {
            log.info("[TaskEventProducer] Publishing TaskEvent (type={}, taskId={}, recipient={}) to topic='{}'",
                    type, taskId, recipientUserId, TOPIC_TASK_EVENTS);
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(TOPIC_TASK_EVENTS, taskId, event);
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("[TaskEventProducer] Failed delivering TaskEvent: {}", ex.getMessage());
                } else {
                    log.info("[TaskEventProducer] Delivered TaskEvent for taskId='{}' to partition={} offset={}",
                            taskId,
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                }
            });
            return future;
        } catch (Exception ex) {
            log.error("[TaskEventProducer] Immediate exception publishing TaskEvent: {}", ex.getMessage());
            CompletableFuture<SendResult<String, Object>> failed = new CompletableFuture<>();
            failed.completeExceptionally(ex);
            return failed;
        }
    }
}
