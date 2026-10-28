package com.projectpulse.notificationservice.controller;

import com.projectpulse.notificationservice.consumer.ProjectEventConsumer;
import com.projectpulse.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NotificationStatusController {

    private final ProjectEventConsumer consumer;
    private final NotificationRepository notificationRepository;

    public NotificationStatusController(
            ProjectEventConsumer consumer,
            @Autowired(required = false) NotificationRepository notificationRepository) {
        this.consumer = consumer;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("service", "notification-service");
        status.put("status", "UP");
        status.put("receivedEventsCount", consumer.getReceivedEvents().size());
        if (notificationRepository != null) {
            try {
                status.put("persistedNotificationsCount", notificationRepository.count());
            } catch (Exception ignored) {
            }
        }
        return ResponseEntity.ok(status);
    }
}
