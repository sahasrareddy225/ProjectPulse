package com.projectpulse.domainservice.model;

public class ProjectMember {
    private String id;
    private String name;
    private String role;
    private String initials;

    public ProjectMember() {
    }

    public ProjectMember(String id, String name, String role, String initials) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.initials = initials;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }
}
