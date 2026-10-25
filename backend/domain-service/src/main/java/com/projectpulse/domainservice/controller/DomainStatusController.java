package com.projectpulse.domainservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/domain")
@CrossOrigin(origins = "*")
public class DomainStatusController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
            "service", "domain-service",
            "status", "UP",
            "port", 8083,
            "timestamp", Instant.now().toString()
        ));
    }
}
