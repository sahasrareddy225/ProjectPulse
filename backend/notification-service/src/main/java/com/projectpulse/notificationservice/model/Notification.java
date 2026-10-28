package com.projectpulse.notificationservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String eventId;

    @Indexed
    private String recipientId;

    private String type;
    private String title;
    private String message;
    private String projectId;
    private String taskId;
    private Instant createdAt;
    private boolean read;

    public Notification() {
        this.createdAt = Instant.now();
        this.read = false;
    }

    public Notification(String eventId, String recipientId, String type, String title, String message, String projectId, Instant createdAt) {
        this.eventId = eventId;
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.projectId = projectId;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.read = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}
