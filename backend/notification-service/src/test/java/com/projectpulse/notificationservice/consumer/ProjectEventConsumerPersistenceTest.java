package com.projectpulse.notificationservice.consumer;

import com.projectpulse.notificationservice.event.ProjectCreatedEvent;
import com.projectpulse.notificationservice.model.Notification;
import com.projectpulse.notificationservice.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectEventConsumerPersistenceTest {

    @Mock
    private NotificationRepository notificationRepository;

    private ProjectEventConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new ProjectEventConsumer(notificationRepository);
    }

    @Test
    @DisplayName("Persist notification with established recipientId and correct fields")
    void shouldPersistNotificationWithRecipientId() {
        long timestamp = Instant.now().toEpochMilli();
        ProjectCreatedEvent event = new ProjectCreatedEvent(
                "evt-101",
                "proj-atlas-1",
                "Atlas Analytics",
                "Sarah Chen",
                "user-sarah-123",
                timestamp
        );

        when(notificationRepository.existsByEventId("evt-101")).thenReturn(false);

        consumer.handleProjectCreated(event, "project-events", 0, 1L);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertNotNull(saved);
        assertEquals("evt-101", saved.getEventId());
        assertEquals("user-sarah-123", saved.getRecipientId());
        assertEquals("PROJECT_CREATED", saved.getType());
        assertEquals("Project created", saved.getTitle());
        assertTrue(saved.getMessage().contains("Atlas Analytics"));
        assertTrue(saved.getMessage().contains("Sarah Chen"));
        assertEquals("proj-atlas-1", saved.getProjectId());
        assertFalse(saved.isRead());
        assertEquals(Instant.ofEpochMilli(timestamp), saved.getCreatedAt());
    }

    @Test
    @DisplayName("Do not invent a recipient when ownership cannot be established")
    void shouldNotInventRecipientWhenUserIdMissing() {
        long timestamp = Instant.now().toEpochMilli();
        // Event without userId/ownership
        ProjectCreatedEvent event = new ProjectCreatedEvent(
                "evt-anonymous",
                "proj-legacy",
                "Legacy Project",
                "Workspace Owner",
                null,
                timestamp
        );

        when(notificationRepository.existsByEventId("evt-anonymous")).thenReturn(false);

        consumer.handleProjectCreated(event, "project-events", 0, 2L);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertNotNull(saved);
        assertNull(saved.getRecipientId(), "Recipient ID must remain null when ownership cannot be established");
        assertEquals("proj-legacy", saved.getProjectId());
    }
}
