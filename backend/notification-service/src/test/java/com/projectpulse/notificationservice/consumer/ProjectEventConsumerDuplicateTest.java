package com.projectpulse.notificationservice.consumer;

import com.projectpulse.notificationservice.event.ProjectCreatedEvent;
import com.projectpulse.notificationservice.model.Notification;
import com.projectpulse.notificationservice.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectEventConsumerDuplicateTest {

    @Mock
    private NotificationRepository notificationRepository;

    private ProjectEventConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new ProjectEventConsumer(notificationRepository);
    }

    @Test
    @DisplayName("Safely skip duplicate event when eventId already exists in database")
    void shouldSkipDuplicateEventWhenAlreadyExists() {
        ProjectCreatedEvent event = new ProjectCreatedEvent(
                "evt-dup-999",
                "proj-dup",
                "Duplicate Task",
                "Alex Rivera",
                "u-alex",
                1700000000000L
        );

        // Pre-existing event
        when(notificationRepository.existsByEventId("evt-dup-999")).thenReturn(true);

        consumer.handleProjectCreated(event, "project-events", 0, 5L);

        // Verify save is NEVER invoked for duplicate event
        verify(notificationRepository, never()).save(any(Notification.class));
        assertEquals(1, consumer.getReceivedEvents().size());
    }

    @Test
    @DisplayName("Catch DuplicateKeyException on concurrent delivery without failing consumer")
    void shouldHandleDuplicateKeyExceptionGracefully() {
        ProjectCreatedEvent event = new ProjectCreatedEvent(
                "evt-race-condition",
                "proj-race",
                "Race Project",
                "Dev",
                "u-dev",
                1700000000000L
        );

        when(notificationRepository.existsByEventId("evt-race-condition")).thenReturn(false);
        when(notificationRepository.save(any(Notification.class)))
                .thenThrow(new DuplicateKeyException("E11000 duplicate key error collection: notification_db.notifications"));

        // Should not throw exception
        consumer.handleProjectCreated(event, "project-events", 0, 6L);

        verify(notificationRepository, times(1)).save(any(Notification.class));
        assertEquals(1, consumer.getReceivedEvents().size());
    }

    @Test
    @DisplayName("Fallback to deterministic composite key when eventId is absent")
    void shouldFallbackToCompositeKeyWhenEventIdMissing() {
        // Event created without eventId
        ProjectCreatedEvent event = new ProjectCreatedEvent(
                null,
                "proj-legacy-fallback",
                "Legacy",
                "Dev",
                "u-dev",
                1700000000000L
        );

        String expectedFallbackKey = "proj-legacy-fallback_1700000000000";
        when(notificationRepository.existsByEventId(expectedFallbackKey)).thenReturn(true);

        consumer.handleProjectCreated(event, "project-events", 0, 7L);

        verify(notificationRepository).existsByEventId(expectedFallbackKey);
        verify(notificationRepository, never()).save(any(Notification.class));
    }
}
