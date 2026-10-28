package com.projectpulse.domainservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    @Indexed
    private String projectId;

    private String title;
    private String description;
    private String status = "TODO";       // TODO, IN_PROGRESS, REVIEW, COMPLETED, BLOCKED
    private String priority = "MEDIUM";   // LOW, MEDIUM, HIGH, CRITICAL
    private TaskAssignee assignee;
    private String dueDate;
    private Integer estimatedHours;
    private Integer actualHours;
    private List<String> dependencies = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Task() {
    }

    public Task(String id, String projectId, String title, String description, String status,
                String priority, TaskAssignee assignee, String dueDate) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        if (status != null && !status.isBlank()) this.status = status;
        if (priority != null && !priority.isBlank()) this.priority = priority;
        this.assignee = assignee;
        this.dueDate = dueDate;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public TaskAssignee getAssignee() {
        return assignee;
    }

    public void setAssignee(TaskAssignee assignee) {
        this.assignee = assignee;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Integer getActualHours() {
        return actualHours;
    }

    public void setActualHours(Integer actualHours) {
        this.actualHours = actualHours;
    }

    public List<String> getDependencies() {
        return dependencies != null ? dependencies : new ArrayList<>();
    }

    public void setDependencies(List<String> dependencies) {
        this.dependencies = dependencies != null ? dependencies : new ArrayList<>();
    }

    public List<String> getTags() {
        return tags != null ? tags : new ArrayList<>();
    }

    public void setTags(List<String> tags) {
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
