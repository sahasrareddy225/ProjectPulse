package com.projectpulse.authservice.model;

public enum Role {
    ADMIN,
    PROJECT_MANAGER,
    MEMBER;

    public static Role fromString(String val) {
        if (val == null || val.isBlank()) {
            return MEMBER;
        }
        try {
            return Role.valueOf(val.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return MEMBER;
        }
    }
}
