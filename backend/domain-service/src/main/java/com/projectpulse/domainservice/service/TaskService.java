package com.projectpulse.domainservice.service;

import com.projectpulse.domainservice.dto.CreateTaskRequest;
import com.projectpulse.domainservice.dto.UpdateTaskRequest;
import com.projectpulse.domainservice.event.TaskEventProducer;
import com.projectpulse.domainservice.exception.AccessDeniedException;
import com.projectpulse.domainservice.exception.DependencyCycleException;
import com.projectpulse.domainservice.model.Project;
import com.projectpulse.domainservice.model.ProjectTask;
import com.projectpulse.domainservice.model.ProjectTaskSummary;
import com.projectpulse.domainservice.model.Task;
import com.projectpulse.domainservice.model.TaskAssignee;
import com.projectpulse.domainservice.repository.ProjectRepository;
import com.projectpulse.domainservice.repository.TaskRepository;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final TaskEventProducer taskEventProducer;

    @Autowired
    public TaskService(
            @Autowired(required = false) TaskRepository taskRepository,
            @Autowired(required = false) ProjectRepository projectRepository,
            ProjectService projectService,
            @Autowired(required = false) TaskEventProducer taskEventProducer) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.projectService = projectService;
        this.taskEventProducer = taskEventProducer;
    }

    @PostConstruct
    public void seedInitialTasksIfEmpty() {
        if (taskRepository == null || projectRepository == null) {
            return;
        }
        try {
            if (taskRepository.count() == 0) {
                log.info("[TaskService] Initializing default tasks dataset in domain_db...");

                List<Project> projects = projectRepository.findAll();
                String defaultProjectId = projects.isEmpty() ? "projectpulse" : projects.get(0).getId();

                TaskAssignee bhavya = new TaskAssignee("1", "Bhavya Gutta", "Frontend Lead", "BG");
                TaskAssignee sahasra = new TaskAssignee("2", "Sahasra Reddy", "Backend Lead", "SR");
                TaskAssignee rakshitha = new TaskAssignee("3", "Rakshitha Momula", "Analytics & Intelligence", "RM");
                TaskAssignee alex = new TaskAssignee("4", "Alex Rivera", "Fullstack Engineer", "AR");
                TaskAssignee david = new TaskAssignee("5", "David Kim", "DevOps Engineer", "DK");

                Task t1 = new Task("task-001", defaultProjectId, "Implement JWT auth interceptor",
                        "Configure TokenValidator and claims verification across microservices", "COMPLETED", "HIGH", sahasra, "2026-10-10");
                t1.setEstimatedHours(12);
                t1.setActualHours(10);
                t1.setTags(List.of("backend", "auth"));
                t1.setDependencies(new ArrayList<>());

                Task t2 = new Task("task-002", defaultProjectId, "Connect domain service with Atlas",
                        "Wire Spring Data MongoDB with Atlas connection string and schema validation", "COMPLETED", "CRITICAL", bhavya, "2026-10-14");
                t2.setEstimatedHours(16);
                t2.setActualHours(14);
                t2.setTags(List.of("database", "mongodb"));
                t2.setDependencies(List.of("task-001"));

                Task t3 = new Task("task-003", defaultProjectId, "End-to-End Task Management Workflow",
                        "Implement CRUD task APIs with circular dependency checks and frontend modals", "IN_PROGRESS", "HIGH", alex, "2026-11-05");
                t3.setEstimatedHours(20);
                t3.setActualHours(8);
                t3.setTags(List.of("fullstack", "tasks"));
                t3.setDependencies(List.of("task-002"));

                Task t4 = new Task("task-004", defaultProjectId, "Real-time Kafka Event Consumer for Notifications",
                        "Consume project and task events and write user-scoped persistent notifications", "IN_PROGRESS", "HIGH", david, "2026-11-08");
                t4.setEstimatedHours(14);
                t4.setActualHours(6);
                t4.setTags(List.of("kafka", "notifications"));
                t4.setDependencies(List.of("task-002"));

                Task t5 = new Task("task-005", defaultProjectId, "Project Risk & Workload Analytics Pipeline",
                        "Compute completion rates, overdue tasks, and workload breakdown on live data", "TODO", "MEDIUM", rakshitha, "2026-11-12");
                t5.setEstimatedHours(15);
                t5.setTags(List.of("analytics", "metrics"));
                t5.setDependencies(List.of("task-003"));

                Task t6 = new Task("task-006", defaultProjectId, "RAG Grounded AI Assistant Pipeline",
                        "Vector retrieval & domain grounded query answering for project health and bottlenecks", "TODO", "CRITICAL", rakshitha, "2026-11-18");
                t6.setEstimatedHours(24);
                t6.setTags(List.of("ai", "rag"));
                t6.setDependencies(List.of("task-005"));

                taskRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6));
                syncProjectStats(defaultProjectId);
                log.info("[TaskService] Seeded 6 flagship tasks successfully for project '{}'", defaultProjectId);
            }
        } catch (Exception ex) {
            log.warn("[TaskService] Failed to seed default tasks: {}", ex.getMessage());
        }
    }

    public List<Task> getAllTasks(AuthenticatedUser user) {
        if (taskRepository == null) return Collections.emptyList();
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Task> getTasksByProject(String projectId, AuthenticatedUser user) {
        if (taskRepository == null) return Collections.emptyList();
        if (projectId != null && !projectId.isBlank() && !"ALL".equalsIgnoreCase(projectId)) {
            return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        }
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    public Task getTaskById(String id, AuthenticatedUser user) {
        if (taskRepository == null) {
            throw new IllegalArgumentException("Task repository is unavailable");
        }
        return taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + id));
    }

    public Task createTask(CreateTaskRequest request, AuthenticatedUser user) {
        if (taskRepository == null) {
            throw new IllegalStateException("Task repository is unavailable");
        }

        // Validate project existence
        final String reqProjectId = request.getProjectId();
        String resolvedProjectId = reqProjectId;
        if (projectRepository != null) {
            Project project = projectRepository.findById(reqProjectId).orElse(null);
            if (project == null) {
                // If ID didn't match directly, try by name or fallback to first project
                List<Project> all = projectRepository.findAll();
                project = all.stream().filter(p -> p.getName().equalsIgnoreCase(reqProjectId)).findFirst().orElse(null);
                if (project != null) {
                    resolvedProjectId = project.getId();
                }
            }
        }
        final String projectId = resolvedProjectId;

        // Validate dependencies cycle prevention
        if (request.getDependencies() != null && !request.getDependencies().isEmpty()) {
            validateNoDependencyCycle(null, request.getDependencies());
        }

        Task task = new Task();
        task.setId("task-" + UUID.randomUUID().toString().substring(0, 8));
        task.setProjectId(projectId);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        task.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus().toUpperCase() : "TODO");
        task.setPriority(request.getPriority() != null && !request.getPriority().isBlank() ? request.getPriority().toUpperCase() : "MEDIUM");
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setActualHours(request.getActualHours() != null ? request.getActualHours() : 0);
        task.setDependencies(request.getDependencies() != null ? request.getDependencies() : new ArrayList<>());
        task.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());

        if (request.getAssignee() != null) {
            task.setAssignee(request.getAssignee());
        } else if (user != null) {
            String initials = extractInitials(user.getName());
            task.setAssignee(new TaskAssignee(user.getId(), user.getName(), "Contributor", initials));
        }

        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());

        Task saved = taskRepository.save(task);
        log.info("[TaskService] Created task '{}' (ID: {}) for project '{}'", saved.getTitle(), saved.getId(), saved.getProjectId());

        // Update project statistics
        syncProjectStats(saved.getProjectId());

        // Publish Kafka event
        if (taskEventProducer != null) {
            String actorName = user != null ? user.getName() : "System";
            String recipientId = (saved.getAssignee() != null && saved.getAssignee().getId() != null)
                    ? saved.getAssignee().getId()
                    : (user != null ? user.getId() : null);
            String assigneeName = saved.getAssignee() != null ? saved.getAssignee().getName() : "Unassigned";

            taskEventProducer.publishTaskEvent(
                    saved.getId(),
                    saved.getProjectId(),
                    saved.getTitle(),
                    "TASK_CREATED",
                    recipientId,
                    assigneeName,
                    actorName
            );

            if (saved.getAssignee() != null && saved.getAssignee().getId() != null && !saved.getAssignee().getId().equals(user != null ? user.getId() : null)) {
                taskEventProducer.publishTaskEvent(
                        saved.getId(),
                        saved.getProjectId(),
                        saved.getTitle(),
                        "TASK_ASSIGNED",
                        saved.getAssignee().getId(),
                        assigneeName,
                        actorName
                );
            }
        }

        return saved;
    }

    public Task updateTask(String id, UpdateTaskRequest request, AuthenticatedUser user) {
        if (taskRepository == null) {
            throw new IllegalStateException("Task repository is unavailable");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + id));

        String oldStatus = task.getStatus();

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            task.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            task.setPriority(request.getPriority().toUpperCase());
        }
        if (request.getDueDate() != null && !request.getDueDate().isBlank()) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(request.getEstimatedHours());
        }
        if (request.getActualHours() != null) {
            task.setActualHours(request.getActualHours());
        }
        if (request.getTags() != null) {
            task.setTags(request.getTags());
        }
        if (request.getAssignee() != null) {
            task.setAssignee(request.getAssignee());
        }

        // Validate dependencies and check cycle
        if (request.getDependencies() != null) {
            validateNoDependencyCycle(id, request.getDependencies());
            task.setDependencies(request.getDependencies());
        }

        task.setUpdatedAt(Instant.now());
        Task updated = taskRepository.save(task);

        // Update project stats
        syncProjectStats(updated.getProjectId());

        // Publish Kafka event on completion or status change
        if (taskEventProducer != null) {
            String actorName = user != null ? user.getName() : "System";
            String recipientId = (updated.getAssignee() != null && updated.getAssignee().getId() != null)
                    ? updated.getAssignee().getId()
                    : (user != null ? user.getId() : null);
            String assigneeName = updated.getAssignee() != null ? updated.getAssignee().getName() : "Unassigned";

            if ("COMPLETED".equalsIgnoreCase(updated.getStatus()) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
                taskEventProducer.publishTaskEvent(
                        updated.getId(),
                        updated.getProjectId(),
                        updated.getTitle(),
                        "TASK_COMPLETED",
                        recipientId,
                        assigneeName,
                        actorName
                );
            } else if (request.getStatus() != null && !request.getStatus().equalsIgnoreCase(oldStatus)) {
                taskEventProducer.publishTaskEvent(
                        updated.getId(),
                        updated.getProjectId(),
                        updated.getTitle(),
                        "TASK_STATUS_CHANGED",
                        recipientId,
                        assigneeName,
                        actorName
                );
            }
        }

        return updated;
    }

    public boolean deleteTask(String id, AuthenticatedUser user) {
        if (taskRepository == null || !taskRepository.existsById(id)) {
            return false;
        }

        Task task = taskRepository.findById(id).orElse(null);
        String projectId = task != null ? task.getProjectId() : null;

        taskRepository.deleteById(id);

        // Remove from dependencies of any other tasks
        List<Task> all = taskRepository.findAll();
        for (Task t : all) {
            if (t.getDependencies() != null && t.getDependencies().contains(id)) {
                t.getDependencies().remove(id);
                taskRepository.save(t);
            }
        }

        if (projectId != null) {
            syncProjectStats(projectId);
        }

        return true;
    }

    /**
     * Cycle detection: performs a graph search to ensure adding candidate dependencies
     * does not create a circular dependency involving currentTaskId.
     */
    public void validateNoDependencyCycle(String currentTaskId, List<String> candidateDependencies) {
        if (candidateDependencies == null || candidateDependencies.isEmpty()) {
            return;
        }

        if (currentTaskId != null && candidateDependencies.contains(currentTaskId)) {
            throw new DependencyCycleException("Direct cycle detected: Task cannot depend on itself");
        }

        if (taskRepository == null) return;

        Set<String> visited = new HashSet<>();
        Queue<String> queue = new ArrayDeque<>(candidateDependencies);

        while (!queue.isEmpty()) {
            String depId = queue.poll();
            if (currentTaskId != null && depId.equals(currentTaskId)) {
                throw new DependencyCycleException(
                        "Circular dependency cycle detected: Task '" + currentTaskId +
                        "' would create an invalid dependency cycle through task '" + depId + "'"
                );
            }

            if (visited.add(depId)) {
                taskRepository.findById(depId).ifPresent(parent -> {
                    if (parent.getDependencies() != null) {
                        for (String parentDep : parent.getDependencies()) {
                            if (currentTaskId != null && parentDep.equals(currentTaskId)) {
                                throw new DependencyCycleException(
                                        "Circular dependency cycle detected: Task '" + currentTaskId +
                                        "' cannot depend on '" + depId + "' because '" + depId +
                                        "' already depends on '" + currentTaskId + "'"
                                );
                            }
                            queue.add(parentDep);
                        }
                    }
                });
            }
        }
    }

    /**
     * Recalculate and synchronize Project task summary, recent tasks list, and overall progress.
     */
    public void syncProjectStats(String projectId) {
        if (projectRepository == null || projectId == null || projectId.isBlank()) {
            return;
        }

        try {
            Project project = projectRepository.findById(projectId).orElse(null);
            if (project == null) {
                return;
            }

            List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
            int total = tasks.size();
            int completed = 0;
            int inProgress = 0;
            int todo = 0;

            List<ProjectTask> recent = new ArrayList<>();

            for (Task t : tasks) {
                String s = t.getStatus() != null ? t.getStatus().toUpperCase() : "TODO";
                if ("COMPLETED".equals(s)) {
                    completed++;
                } else if ("IN_PROGRESS".equals(s) || "REVIEW".equals(s)) {
                    inProgress++;
                } else {
                    todo++;
                }

                if (recent.size() < 5) {
                    recent.add(new ProjectTask(
                            t.getId(),
                            t.getTitle(),
                            t.getStatus(),
                            t.getPriority(),
                            t.getAssignee() != null ? t.getAssignee().getName() : "Unassigned",
                            t.getDueDate()
                    ));
                }
            }

            int progress = total > 0 ? (completed * 100) / total : 0;
            project.setTasksCount(total);
            project.setProgress(progress);
            project.setTaskSummary(new ProjectTaskSummary(total, completed, inProgress, todo));
            project.setRecentTasks(recent);
            project.setUpdatedAt(Instant.now());

            projectRepository.save(project);
            log.info("[TaskService] Synchronized stats for project '{}': {} tasks, {}% complete",
                    project.getName(), total, progress);
        } catch (Exception ex) {
            log.warn("[TaskService] Could not sync project stats for {}: {}", projectId, ex.getMessage());
        }
    }

    private String extractInitials(String name) {
        if (name == null || name.isBlank()) return "U";
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) {
            return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return ("" + name.charAt(0)).toUpperCase();
    }
}
