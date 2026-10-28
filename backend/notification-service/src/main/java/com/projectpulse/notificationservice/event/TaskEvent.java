package com.projectpulse.notificationservice.event;

public class TaskEvent {
    private String eventId;
    private String taskId;
    private String projectId;
    private String taskTitle;
    private String type;
    private String recipientUserId;
    private String assigneeName;
    private String actorName;
    private long timestamp;

    public TaskEvent() {
    }

    public TaskEvent(String eventId, String taskId, String projectId, String taskTitle,
                     String type, String recipientUserId, String assigneeName, String actorName, long timestamp) {
        this.eventId = eventId;
        this.taskId = taskId;
        this.projectId = projectId;
        this.taskTitle = taskTitle;
        this.type = type;
        this.recipientUserId = recipientUserId;
        this.assigneeName = assigneeName;
        this.actorName = actorName;
        this.timestamp = timestamp;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(String recipientUserId) {
        this.recipientUserId = recipientUserId;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
