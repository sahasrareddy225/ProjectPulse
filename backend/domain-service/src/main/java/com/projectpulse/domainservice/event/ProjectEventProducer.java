package com.projectpulse.domainservice.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;

@Component
public class ProjectEventProducer {

    private static final Logger log = LoggerFactory.getLogger(ProjectEventProducer.class);
    public static final String TOPIC_PROJECT_EVENTS = "project-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final boolean kafkaEnabled;

    public ProjectEventProducer(
            @Autowired(required = false) KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${kafka.enabled:true}") boolean kafkaEnabled) {
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaEnabled = kafkaEnabled;
    }

    public CompletableFuture<SendResult<String, Object>> publishProjectCreated(String projectId, String name, String owner) {
        return publishProjectCreated(projectId, name, owner, null);
    }

    public CompletableFuture<SendResult<String, Object>> publishProjectCreated(String projectId, String name, String owner, String userId) {
        ProjectCreatedEvent event = new ProjectCreatedEvent(
                java.util.UUID.randomUUID().toString(),
                projectId,
                name,
                owner != null ? owner : "unknown",
                userId,
                Instant.now().toEpochMilli()
        );

        if (!kafkaEnabled || kafkaTemplate == null) {
            log.info("[ProjectEventProducer] Kafka publishing disabled (kafka.enabled={}) or KafkaTemplate unavailable. Skipped dispatch of ProjectCreatedEvent for projectId={}",
                    kafkaEnabled, projectId);
            CompletableFuture<SendResult<String, Object>> disabledFuture = new CompletableFuture<>();
            disabledFuture.completeExceptionally(new IllegalStateException("Kafka publishing is disabled or KafkaTemplate is not configured"));
            return disabledFuture;
        }

        try {
            log.info("[ProjectEventProducer] Publishing ProjectCreatedEvent for projectId='{}' to topic='{}'", projectId, TOPIC_PROJECT_EVENTS);
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(TOPIC_PROJECT_EVENTS, projectId, event);

            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("[ProjectEventProducer] Delivery FAILED for ProjectCreatedEvent for projectId='{}' to topic='{}': {}",
                            projectId, TOPIC_PROJECT_EVENTS, ex.getMessage());
                } else {
                    log.info("[ProjectEventProducer] Successfully delivered ProjectCreatedEvent for projectId='{}' to partition={} offset={}",
                            projectId,
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                }
            });

            return future;
        } catch (Exception ex) {
            log.error("[ProjectEventProducer] Immediate exception while dispatching ProjectCreatedEvent for projectId='{}': {}",
                    projectId, ex.getMessage(), ex);
            CompletableFuture<SendResult<String, Object>> failedFuture = new CompletableFuture<>();
            failedFuture.completeExceptionally(ex);
            return failedFuture;
        }
    }

    public boolean isKafkaEnabled() {
        return kafkaEnabled && kafkaTemplate != null;
    }
}
