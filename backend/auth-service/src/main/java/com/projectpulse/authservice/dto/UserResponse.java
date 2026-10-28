package com.projectpulse.authservice.dto;

import java.time.Instant;

/**
 * Safe user response excluding sensitive fields like passwords and password hashes.
 */
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String role;
    private Instant createdAt;

    public UserResponse() {
    }

    public UserResponse(String id, String name, String email, Instant createdAt) {
        this(id, name, email, "MEMBER", createdAt);
    }

    public UserResponse(String id, String name, String email, String role, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role != null && !role.isBlank() ? role : "MEMBER";
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role != null && !role.isBlank() ? role : "MEMBER";
    }

    public void setRole(String role) {
        this.role = role != null && !role.isBlank() ? role : "MEMBER";
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
