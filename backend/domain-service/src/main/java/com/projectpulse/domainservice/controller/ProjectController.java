package com.projectpulse.domainservice.controller;

import com.projectpulse.domainservice.dto.CreateProjectRequest;
import com.projectpulse.domainservice.model.Project;
import com.projectpulse.domainservice.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import com.projectpulse.domainservice.security.TokenValidator;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectService projectService;
    private final TokenValidator tokenValidator;
    private final MongoTemplate mongoTemplate;

    public ProjectController(
            ProjectService projectService,
            TokenValidator tokenValidator,
            @org.springframework.beans.factory.annotation.Autowired(required = false) MongoTemplate mongoTemplate) {
        this.projectService = projectService;
        this.tokenValidator = tokenValidator;
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Project>> listProjects(HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        return ResponseEntity.ok(projectService.getProjectsForUser(user));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            HttpServletRequest httpRequest) {
        AuthenticatedUser user = tokenValidator.authenticate(httpRequest);
        Project created = projectService.createProject(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        AuthenticatedUser user = tokenValidator.authenticate(httpRequest);
        try {
            Project project = projectService.getProjectByIdForUser(id, user);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        AuthenticatedUser user = tokenValidator.authenticate(httpRequest);
        boolean deleted = projectService.deleteProject(id, user);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Safe development diagnostic endpoint to verify database targeting and collection state.
     * Never exposes credentials, connection strings, or sensitive data.
     */
    @GetMapping("/db-info")
    public ResponseEntity<Map<String, Object>> dbInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        try {
            if (mongoTemplate == null) {
                info.put("status", "mock_mode");
                info.put("message", "MongoTemplate not loaded");
                return ResponseEntity.ok(info);
            }
            String dbName = mongoTemplate.getDb().getName();
            Set<String> collections = mongoTemplate.getCollectionNames();
            long count = mongoTemplate.getCollection("projects").countDocuments();

            info.put("timestamp", Instant.now().toString());
            info.put("service", "domain-service");
            info.put("activeDatabase", dbName);
            info.put("collections", collections);
            info.put("projectsDocumentCount", count);
            info.put("status", "ok");
        } catch (Exception e) {
            info.put("timestamp", Instant.now().toString());
            info.put("status", "error");
            info.put("message", e.getMessage());
        }
        return ResponseEntity.ok(info);
    }
}
