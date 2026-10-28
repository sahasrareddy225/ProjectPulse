package com.projectpulse.domainservice.dto;

import java.util.List;

public class AiQueryResponse {

    private String answer;
    private String intent;
    private List<ProjectRisk> risks;
    private List<AiRecommendation> recommendations;
    private List<AiCitation> sources;
    private String groundingMode;
    private boolean llmConfigured;
    private String llmProvider;
    private String timestamp;

    public AiQueryResponse() {
    }

    public static class ProjectRisk {
        private String severity; // HIGH, MEDIUM, LOW
        private String type;     // OVERDUE, BLOCKED, WORKLOAD_SKEW, UNASSIGNED
        private String title;
        private String description;
        private String entityId;
        private String entityTitle;

        public ProjectRisk() {}

        public ProjectRisk(String severity, String type, String title, String description, String entityId, String entityTitle) {
            this.severity = severity;
            this.type = type;
            this.title = title;
            this.description = description;
            this.entityId = entityId;
            this.entityTitle = entityTitle;
        }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getEntityTitle() { return entityTitle; }
        public void setEntityTitle(String entityTitle) { this.entityTitle = entityTitle; }
    }

    public static class AiRecommendation {
        private String id;
        private String title;
        private String description;
        private String priority; // CRITICAL, HIGH, MEDIUM, LOW
        private String action;
        private String entityId;

        public AiRecommendation() {}

        public AiRecommendation(String id, String title, String description, String priority, String action, String entityId) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.priority = priority;
            this.action = action;
            this.entityId = entityId;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
    }

    public static class AiCitation {
        private String type; // project, task
        private String id;
        private String name;
        private String status;
        private String detail;

        public AiCitation() {}

        public AiCitation(String type, String id, String name, String status, String detail) {
            this.type = type;
            this.id = id;
            this.name = name;
            this.status = status;
            this.detail = detail;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDetail() { return detail; }
        public void setDetail(String detail) { this.detail = detail; }
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
    public List<ProjectRisk> getRisks() { return risks; }
    public void setRisks(List<ProjectRisk> risks) { this.risks = risks; }
    public List<AiRecommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<AiRecommendation> recommendations) { this.recommendations = recommendations; }
    public List<AiCitation> getSources() { return sources; }
    public void setSources(List<AiCitation> sources) { this.sources = sources; }
    public String getGroundingMode() { return groundingMode; }
    public void setGroundingMode(String groundingMode) { this.groundingMode = groundingMode; }
    public boolean isLlmConfigured() { return llmConfigured; }
    public void setLlmConfigured(boolean llmConfigured) { this.llmConfigured = llmConfigured; }
    public String getLlmProvider() { return llmProvider; }
    public void setLlmProvider(String llmProvider) { this.llmProvider = llmProvider; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
