package com.projectpulse.domainservice.dto;

import java.util.List;
import java.util.Map;

public class DashboardAnalyticsResponse {

    private int totalProjects;
    private int activeProjects;
    private int completedProjects;
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
    private int todoTasks;
    private int blockedTasks;
    private int overdueTasks;
    private double completionRate;
    private double overdueRate;
    private Map<String, Integer> statusBreakdown;
    private Map<String, Integer> priorityBreakdown;
    private List<WorkloadItem> workloadDistribution;
    private List<ProjectHealthItem> projectHealthSummary;
    private List<TrendItem> completionTrends;
    private String timestamp;

    public DashboardAnalyticsResponse() {
    }

    public static class WorkloadItem {
        private String assigneeId;
        private String assigneeName;
        private int totalTasks;
        private int completedTasks;
        private int activeTasks;
        private int overdueTasks;

        public WorkloadItem() {}

        public WorkloadItem(String assigneeId, String assigneeName, int totalTasks, int completedTasks, int activeTasks, int overdueTasks) {
            this.assigneeId = assigneeId;
            this.assigneeName = assigneeName;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.activeTasks = activeTasks;
            this.overdueTasks = overdueTasks;
        }

        public String getAssigneeId() { return assigneeId; }
        public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
        public String getAssigneeName() { return assigneeName; }
        public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
        public int getTotalTasks() { return totalTasks; }
        public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }
        public int getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }
        public int getActiveTasks() { return activeTasks; }
        public void setActiveTasks(int activeTasks) { this.activeTasks = activeTasks; }
        public int getOverdueTasks() { return overdueTasks; }
        public void setOverdueTasks(int overdueTasks) { this.overdueTasks = overdueTasks; }
    }

    public static class ProjectHealthItem {
        private String projectId;
        private String projectName;
        private String health;
        private String status;
        private int progress;
        private int totalTasks;
        private int completedTasks;
        private int overdueTasks;

        public ProjectHealthItem() {}

        public ProjectHealthItem(String projectId, String projectName, String health, String status, int progress, int totalTasks, int completedTasks, int overdueTasks) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.health = health;
            this.status = status;
            this.progress = progress;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.overdueTasks = overdueTasks;
        }

        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getHealth() { return health; }
        public void setHealth(String health) { this.health = health; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getProgress() { return progress; }
        public void setProgress(int progress) { this.progress = progress; }
        public int getTotalTasks() { return totalTasks; }
        public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }
        public int getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }
        public int getOverdueTasks() { return overdueTasks; }
        public void setOverdueTasks(int overdueTasks) { this.overdueTasks = overdueTasks; }
    }

    public static class TrendItem {
        private String label;
        private int completed;
        private int total;

        public TrendItem() {}

        public TrendItem(String label, int completed, int total) {
            this.label = label;
            this.completed = completed;
            this.total = total;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public int getCompleted() { return completed; }
        public void setCompleted(int completed) { this.completed = completed; }
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
    }

    public int getTotalProjects() { return totalProjects; }
    public void setTotalProjects(int totalProjects) { this.totalProjects = totalProjects; }
    public int getActiveProjects() { return activeProjects; }
    public void setActiveProjects(int activeProjects) { this.activeProjects = activeProjects; }
    public int getCompletedProjects() { return completedProjects; }
    public void setCompletedProjects(int completedProjects) { this.completedProjects = completedProjects; }
    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }
    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }
    public int getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(int inProgressTasks) { this.inProgressTasks = inProgressTasks; }
    public int getTodoTasks() { return todoTasks; }
    public void setTodoTasks(int todoTasks) { this.todoTasks = todoTasks; }
    public int getBlockedTasks() { return blockedTasks; }
    public void setBlockedTasks(int blockedTasks) { this.blockedTasks = blockedTasks; }
    public int getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(int overdueTasks) { this.overdueTasks = overdueTasks; }
    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
    public double getOverdueRate() { return overdueRate; }
    public void setOverdueRate(double overdueRate) { this.overdueRate = overdueRate; }
    public Map<String, Integer> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Integer> statusBreakdown) { this.statusBreakdown = statusBreakdown; }
    public Map<String, Integer> getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(Map<String, Integer> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }
    public List<WorkloadItem> getWorkloadDistribution() { return workloadDistribution; }
    public void setWorkloadDistribution(List<WorkloadItem> workloadDistribution) { this.workloadDistribution = workloadDistribution; }
    public List<ProjectHealthItem> getProjectHealthSummary() { return projectHealthSummary; }
    public void setProjectHealthSummary(List<ProjectHealthItem> projectHealthSummary) { this.projectHealthSummary = projectHealthSummary; }
    public List<TrendItem> getCompletionTrends() { return completionTrends; }
    public void setCompletionTrends(List<TrendItem> completionTrends) { this.completionTrends = completionTrends; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
