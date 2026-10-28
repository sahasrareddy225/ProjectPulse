package com.projectpulse.notificationservice.controller;

import com.projectpulse.notificationservice.model.Notification;
import com.projectpulse.notificationservice.security.AuthenticatedUser;
import com.projectpulse.notificationservice.security.TokenValidator;
import com.projectpulse.notificationservice.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class NotificationController {

    private final NotificationService notificationService;
    private final TokenValidator tokenValidator;

    public NotificationController(NotificationService notificationService, TokenValidator tokenValidator) {
        this.notificationService = notificationService;
        this.tokenValidator = tokenValidator;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> listNotifications(HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    @RequestMapping(value = "/{id}/read", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<Notification> markAsRead(@PathVariable String id, HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        Notification updated = notificationService.markAsRead(id, user);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/read-all", method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> markAllAsRead(HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        int count = notificationService.markAllAsRead(user);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "All notifications marked as read");
        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        long count = notificationService.getUnreadCount(user);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("unreadCount", count);
        return ResponseEntity.ok(result);
    }
}
