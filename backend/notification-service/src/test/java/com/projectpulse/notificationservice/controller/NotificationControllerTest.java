package com.projectpulse.notificationservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.notificationservice.exception.AccessDeniedException;
import com.projectpulse.notificationservice.exception.GlobalExceptionHandler;
import com.projectpulse.notificationservice.exception.UnauthorizedException;
import com.projectpulse.notificationservice.model.Notification;
import com.projectpulse.notificationservice.security.AuthenticatedUser;
import com.projectpulse.notificationservice.security.TokenValidator;
import com.projectpulse.notificationservice.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private TokenValidator tokenValidator;

    @InjectMocks
    private NotificationController notificationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("GET /api/notifications - 401 Unauthorized when unauthenticated")
    void shouldReturnUnauthorizedWhenTokenMissing() throws Exception {
        when(tokenValidator.authenticate(any())).thenThrow(new UnauthorizedException("Authentication required: missing Bearer token"));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Authentication required: missing Bearer token"));
    }

    @Test
    @DisplayName("GET /api/notifications - Reject arbitrary spoofed X-User-Id header without valid JWT")
    void shouldRejectSpoofedUserIdHeader() throws Exception {
        when(tokenValidator.authenticate(any())).thenThrow(new UnauthorizedException("Authentication required: missing Bearer token"));

        mockMvc.perform(get("/api/notifications")
                        .header("X-User-Id", "attacker-999")
                        .header("X-User-Role", "ADMIN"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/notifications - 200 OK returns only the authenticated user's notifications")
    void shouldReturnNotificationsForAuthenticatedUser() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser("user-1", "user1@projectpulse.io", "User One", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(user);

        Notification notif = new Notification(
                "evt-1",
                "user-1",
                "PROJECT_CREATED",
                "Project created",
                "Project 'AI Platform' was created.",
                "proj-101",
                Instant.now()
        );
        notif.setId("notif-1");

        when(notificationService.getNotificationsForUser(user)).thenReturn(List.of(notif));

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer valid.mock.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("notif-1"))
                .andExpect(jsonPath("$[0].recipientId").value("user-1"))
                .andExpect(jsonPath("$[0].projectId").value("proj-101"))
                .andExpect(jsonPath("$[0].read").value(false));
    }

    @Test
    @DisplayName("PATCH /api/notifications/{id}/read - 403 Forbidden when user attempts to modify another user's notification")
    void shouldDenyCrossUserMarkAsRead() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser("attacker-id", "attacker@test.com", "Attacker", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(user);

        when(notificationService.markAsRead(eq("victim-notif-1"), eq(user)))
                .thenThrow(new AccessDeniedException("Access denied: You do not have permission to modify this notification"));

        mockMvc.perform(patch("/api/notifications/victim-notif-1/read")
                        .header("Authorization", "Bearer attacker.jwt.token"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Access denied: You do not have permission to modify this notification"));
    }

    @Test
    @DisplayName("PATCH /api/notifications/{id}/read - 200 OK when authorized owner marks as read")
    void shouldAllowOwnerToMarkNotificationAsRead() throws Exception {
        AuthenticatedUser owner = new AuthenticatedUser("owner-id", "owner@test.com", "Owner", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(owner);

        Notification updated = new Notification(
                "evt-2",
                "owner-id",
                "PROJECT_CREATED",
                "Project created",
                "Project 'Flagship' was created.",
                "proj-202",
                Instant.now()
        );
        updated.setId("notif-own");
        updated.setRead(true);

        when(notificationService.markAsRead("notif-own", owner)).thenReturn(updated);

        mockMvc.perform(patch("/api/notifications/notif-own/read")
                        .header("Authorization", "Bearer owner.jwt.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("notif-own"))
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    @DisplayName("PATCH /api/notifications/read-all - 200 OK marks all notifications for authenticated user")
    void shouldMarkAllNotificationsAsRead() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser("user-1", "user1@test.com", "User 1", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(user);

        when(notificationService.markAllAsRead(user)).thenReturn(3);

        mockMvc.perform(patch("/api/notifications/read-all")
                        .header("Authorization", "Bearer valid.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("All notifications marked as read"))
                .andExpect(jsonPath("$.count").value(3));
    }
}
