package com.projectpulse.authservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Baseline health and status endpoint for verifying initial service startup.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthStatusController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "service", "auth-service",
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }
}
