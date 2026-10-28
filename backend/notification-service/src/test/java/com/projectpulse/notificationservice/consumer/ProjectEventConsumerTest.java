package com.projectpulse.notificationservice.consumer;

import com.projectpulse.notificationservice.event.ProjectCreatedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class ProjectEventConsumerTest {

    private ProjectEventConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new ProjectEventConsumer();
    }

    @Test
    @DisplayName("Process and record incoming ProjectCreatedEvent")
    void shouldProcessProjectCreatedEvent() {
        ProjectCreatedEvent event = new ProjectCreatedEvent("proj-999", "AI Search Feature", "Sarah Chen", 1700000000000L);

        consumer.handleProjectCreated(event, "project-events", 0, 10L);

        List<ProjectCreatedEvent> received = consumer.getReceivedEvents();
        assertFalse(received.isEmpty());
        assertEquals(1, received.size());

        ProjectCreatedEvent first = received.get(0);
        assertEquals("proj-999", first.getProjectId());
        assertEquals("AI Search Feature", first.getName());
        assertEquals("Sarah Chen", first.getOwner());
        assertEquals(1700000000000L, first.getTimestamp());
    }

    @Test
    @DisplayName("Handle malformed or null event gracefully without exception")
    void shouldHandleExceptionGracefully() {
        // Passing null event should be caught safely by consumer try/catch
        consumer.handleProjectCreated(null, "project-events", 0, 11L);

        assertEquals(0, consumer.getReceivedEvents().size());
    }
}
