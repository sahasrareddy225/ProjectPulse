package com.projectpulse.domainservice.controller;

import com.projectpulse.domainservice.dto.CreateTaskRequest;
import com.projectpulse.domainservice.dto.UpdateTaskRequest;
import com.projectpulse.domainservice.model.Task;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import com.projectpulse.domainservice.security.TokenValidator;
import com.projectpulse.domainservice.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class TaskController {

    private final TaskService taskService;
    private final TokenValidator tokenValidator;

    public TaskController(TaskService taskService, TokenValidator tokenValidator) {
        this.taskService = taskService;
        this.tokenValidator = tokenValidator;
    }

    @GetMapping
    public ResponseEntity<List<Task>> listTasks(
            @RequestParam(required = false) String projectId,
            HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        if (projectId != null && !projectId.isBlank()) {
            return ResponseEntity.ok(taskService.getTasksByProject(projectId, user));
        }
        return ResponseEntity.ok(taskService.getAllTasks(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable String id, HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        try {
            Task task = taskService.getTaskById(id, user);
            return ResponseEntity.ok(task);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody CreateTaskRequest body,
            HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        Task created = taskService.createTask(body, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable String id,
            @RequestBody UpdateTaskRequest body,
            HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        try {
            Task updated = taskService.updateTask(id, body, user);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id, HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        boolean deleted = taskService.deleteTask(id, user);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
