package com.projectpulse.domainservice.dto;

import jakarta.validation.constraints.NotBlank;

public class AiQueryRequest {

    @NotBlank(message = "Query must not be empty")
    private String query;

    private String projectId;

    public AiQueryRequest() {
    }

    public AiQueryRequest(String query, String projectId) {
        this.query = query;
        this.projectId = projectId;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}
