package com.projectpulse.domainservice.dto;

import com.projectpulse.domainservice.model.TaskAssignee;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CreateTaskRequest {

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;
    private String status = "TODO";
    private String priority = "MEDIUM";
    private TaskAssignee assignee;

    @NotBlank(message = "Due date is required")
    private String dueDate;

    private Integer estimatedHours;
    private Integer actualHours;
    private List<String> dependencies;
    private List<String> tags;

    public CreateTaskRequest() {
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
        return dependencies;
    }

    public void setDependencies(List<String> dependencies) {
        this.dependencies = dependencies;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
