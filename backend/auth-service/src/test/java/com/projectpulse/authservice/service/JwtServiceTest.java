package com.projectpulse.authservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.authservice.exception.InvalidCredentialsException;
import com.projectpulse.authservice.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private JwtService jwtService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        jwtService = new JwtService(
                "test-secret-key-that-is-at-least-32-bytes-long!",
                3600L,
                objectMapper
        );
    }

    @Test
    @DisplayName("Successfully generates and validates HS256 JWT")
    void shouldGenerateAndValidateToken() {
        User user = new User("Alice", "alice@example.com", "hash123", "ADMIN");
        user.setId("u-123");

        String token = jwtService.generateToken(user);
        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);

        Map<String, Object> claims = jwtService.parseAndValidateToken(token);
        assertEquals("u-123", claims.get("sub"));
        assertEquals("alice@example.com", claims.get("email"));
        assertEquals("Alice", claims.get("name"));
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    @DisplayName("Rejects token with tampered payload or signature")
    void shouldRejectTamperedToken() {
        User user = new User("Alice", "alice@example.com", "hash123", "MEMBER");
        user.setId("u-123");

        String token = jwtService.generateToken(user);
        String[] parts = token.split("\\.");

        // Tamper with signature
        String tamperedToken = parts[0] + "." + parts[1] + ".tamperedSignature";

        assertThrows(InvalidCredentialsException.class, () ->
                jwtService.parseAndValidateToken(tamperedToken));
    }

    @Test
    @DisplayName("Rejects expired token")
    void shouldRejectExpiredToken() {
        // JwtService with negative/zero expiration
        JwtService expiredService = new JwtService(
                "test-secret-key-that-is-at-least-32-bytes-long!",
                -10L,
                objectMapper
        );

        User user = new User("Bob", "bob@example.com", "hash", "MEMBER");
        user.setId("u-expired");

        String token = expiredService.generateToken(user);

        assertThrows(InvalidCredentialsException.class, () ->
                jwtService.parseAndValidateToken(token));
    }
}
