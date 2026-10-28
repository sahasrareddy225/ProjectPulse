package com.projectpulse.domainservice.event;

import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectEventProducerTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    @DisplayName("Publish ProjectCreatedEvent to Kafka when enabled")
    void shouldPublishProjectCreatedEvent() {
        ProjectEventProducer producer = new ProjectEventProducer(kafkaTemplate, true);

        RecordMetadata metadata = new RecordMetadata(new TopicPartition("project-events", 0), 0, 0, 0, 0, 0);
        SendResult<String, Object> sendResult = new SendResult<>(null, metadata);
        CompletableFuture<SendResult<String, Object>> future = CompletableFuture.completedFuture(sendResult);

        when(kafkaTemplate.send(eq("project-events"), eq("proj-123"), any())).thenReturn(future);

        CompletableFuture<SendResult<String, Object>> result = producer.publishProjectCreated("proj-123", "Mobile App Redesign", "Alex");

        assertNotNull(result);
        assertTrue(result.isDone());
        assertFalse(result.isCompletedExceptionally());

        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(kafkaTemplate).send(eq("project-events"), eq("proj-123"), eventCaptor.capture());

        ProjectCreatedEvent captured = (ProjectCreatedEvent) eventCaptor.getValue();
        assertEquals("proj-123", captured.getProjectId());
        assertEquals("Mobile App Redesign", captured.getName());
        assertEquals("Alex", captured.getOwner());
        assertTrue(captured.getTimestamp() > 0);
    }

    @Test
    @DisplayName("Skip publication gracefully when Kafka is disabled")
    void shouldSkipPublicationWhenKafkaDisabled() {
        ProjectEventProducer producer = new ProjectEventProducer(kafkaTemplate, false);

        CompletableFuture<SendResult<String, Object>> result = producer.publishProjectCreated("proj-999", "Offline Project", "Dev");

        assertNotNull(result);
        assertTrue(result.isCompletedExceptionally());
        verify(kafkaTemplate, never()).send(any(), any(), any());
    }

    @Test
    @DisplayName("Handle Kafka send failure without crashing application")
    void shouldHandleKafkaSendFailureGracefully() {
        ProjectEventProducer producer = new ProjectEventProducer(kafkaTemplate, true);

        CompletableFuture<SendResult<String, Object>> failedFuture = new CompletableFuture<>();
        failedFuture.completeExceptionally(new RuntimeException("Kafka Broker Unavailable"));

        when(kafkaTemplate.send(eq("project-events"), eq("proj-err"), any())).thenReturn(failedFuture);

        CompletableFuture<SendResult<String, Object>> result = producer.publishProjectCreated("proj-err", "Failing Project", "Dev");

        assertNotNull(result);
        assertTrue(result.isCompletedExceptionally());
        verify(kafkaTemplate).send(eq("project-events"), eq("proj-err"), any());
    }
}
