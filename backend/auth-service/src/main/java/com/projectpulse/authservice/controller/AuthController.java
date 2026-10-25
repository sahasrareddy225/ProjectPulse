package com.projectpulse.authservice.controller;

import com.projectpulse.authservice.dto.RegisterRequest;
import com.projectpulse.authservice.dto.UserResponse;
import com.projectpulse.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final MongoTemplate mongoTemplate;

    public AuthController(AuthService authService, MongoTemplate mongoTemplate) {
        this.authService = authService;
        this.mongoTemplate = mongoTemplate;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Safe diagnostic endpoint — returns active database name, collection names, and
     * document count in 'users'. Never returns passwords or hashes.
     * Remove or restrict this endpoint before production deployment.
     */
    @GetMapping("/db-info")
    public ResponseEntity<Map<String, Object>> dbInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        try {
            String dbName = mongoTemplate.getDb().getName();
            Set<String> collections = mongoTemplate.getCollectionNames();
            long userCount = mongoTemplate.getCollection("users").countDocuments();

            info.put("timestamp", Instant.now().toString());
            info.put("activeDatabase", dbName);
            info.put("collections", collections);
            info.put("usersDocumentCount", userCount);
            info.put("status", "ok");
        } catch (Exception e) {
            info.put("timestamp", Instant.now().toString());
            info.put("status", "error");
            info.put("message", e.getMessage());
        }
        return ResponseEntity.ok(info);
    }
}
