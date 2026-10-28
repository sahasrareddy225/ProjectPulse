package com.projectpulse.notificationservice.event;

import java.io.Serializable;
import java.util.UUID;

public class ProjectCreatedEvent implements Serializable {

    private String eventId;
    private String projectId;
    private String name;
    private String owner;
    private String userId;
    private long timestamp;

    public ProjectCreatedEvent() {
    }

    public ProjectCreatedEvent(String projectId, String name, String owner, long timestamp) {
        this(UUID.randomUUID().toString(), projectId, name, owner, null, timestamp);
    }

    public ProjectCreatedEvent(String eventId, String projectId, String name, String owner, String userId, long timestamp) {
        this.eventId = eventId;
        this.projectId = projectId;
        this.name = name;
        this.owner = owner;
        this.userId = userId;
        this.timestamp = timestamp;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ProjectCreatedEvent{" +
                "eventId='" + eventId + '\'' +
                ", projectId='" + projectId + '\'' +
                ", name='" + name + '\'' +
                ", owner='" + owner + '\'' +
                ", userId='" + userId + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
