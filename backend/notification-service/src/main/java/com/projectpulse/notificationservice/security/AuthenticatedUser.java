package com.projectpulse.notificationservice.security;

public class AuthenticatedUser {

    private final String id;
    private final String email;
    private final String name;
    private final String role;

    public AuthenticatedUser(String id, String email, String name, String role) {
        this.id = id != null ? id : "anonymous";
        this.email = email != null ? email : "";
        this.name = name != null ? name : "";
        this.role = role != null && !role.isBlank() ? role.trim().toUpperCase() : "MEMBER";
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
