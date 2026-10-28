package com.projectpulse.notificationservice.service;

import com.projectpulse.notificationservice.exception.AccessDeniedException;
import com.projectpulse.notificationservice.model.Notification;
import com.projectpulse.notificationservice.repository.NotificationRepository;
import com.projectpulse.notificationservice.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public NotificationService(
            @org.springframework.beans.factory.annotation.Autowired(required = false) NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotificationsForUser(AuthenticatedUser user) {
        if (user == null || user.getId() == null || notificationRepository == null) {
            return Collections.emptyList();
        }
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
    }

    public Notification markAsRead(String id, AuthenticatedUser user) {
        if (user == null || user.getId() == null) {
            throw new AccessDeniedException("Access denied: Unauthenticated user cannot modify notifications");
        }
        if (notificationRepository == null) {
            throw new IllegalStateException("Notification database unavailable");
        }

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));

        // Enforce user-level access; never allow a caller to read or modify another user's notifications.
        if (notification.getRecipientId() == null || !notification.getRecipientId().equals(user.getId())) {
            log.warn("[NotificationService] Unauthorized attempt by user '{}' to modify notification '{}' owned by '{}'",
                    user.getId(), id, notification.getRecipientId());
            throw new AccessDeniedException("Access denied: You do not have permission to modify this notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public int markAllAsRead(AuthenticatedUser user) {
        if (user == null || user.getId() == null) {
            throw new AccessDeniedException("Access denied: Unauthenticated user cannot modify notifications");
        }
        if (notificationRepository == null) {
            return 0;
        }

        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalse(user.getId());
        if (unread.isEmpty()) {
            return 0;
        }

        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
        log.info("[NotificationService] Marked {} notifications as read for user '{}'", unread.size(), user.getId());
        return unread.size();
    }

    public long getUnreadCount(AuthenticatedUser user) {
        if (user == null || user.getId() == null || notificationRepository == null) {
            return 0;
        }
        return notificationRepository.countByRecipientIdAndReadFalse(user.getId());
    }
}
