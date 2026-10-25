package com.projectpulse.domainservice.model;

public class ProjectTaskSummary {
    private int total;
    private int completed;
    private int inProgress;
    private int overdue;

    public ProjectTaskSummary() {
    }

    public ProjectTaskSummary(int total, int completed, int inProgress, int overdue) {
        this.total = total;
        this.completed = completed;
        this.inProgress = inProgress;
        this.overdue = overdue;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getCompleted() {
        return completed;
    }

    public void setCompleted(int completed) {
        this.completed = completed;
    }

    public int getInProgress() {
        return inProgress;
    }

    public void setInProgress(int inProgress) {
        this.inProgress = inProgress;
    }

    public int getOverdue() {
        return overdue;
    }

    public void setOverdue(int overdue) {
        this.overdue = overdue;
    }
}
