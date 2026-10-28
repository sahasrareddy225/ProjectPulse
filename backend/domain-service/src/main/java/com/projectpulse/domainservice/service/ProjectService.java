package com.projectpulse.domainservice.service;

import com.projectpulse.domainservice.dto.CreateProjectRequest;
import com.projectpulse.domainservice.model.Project;
import com.projectpulse.domainservice.model.ProjectMember;
import com.projectpulse.domainservice.model.ProjectTask;
import com.projectpulse.domainservice.model.ProjectTaskSummary;
import com.projectpulse.domainservice.repository.ProjectRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.projectpulse.domainservice.event.ProjectEventProducer;

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final ProjectEventProducer projectEventProducer;

    @org.springframework.beans.factory.annotation.Autowired
    public ProjectService(
            @org.springframework.beans.factory.annotation.Autowired(required = false) ProjectRepository projectRepository,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ProjectEventProducer projectEventProducer) {
        this.projectRepository = projectRepository;
        this.projectEventProducer = projectEventProducer;
    }

    public ProjectService(ProjectRepository projectRepository) {
        this(projectRepository, null);
    }

    @PostConstruct
    public void seedInitialProjectIfEmpty() {
        if (projectRepository == null) {
            return;
        }
        try {
            if (projectRepository.count() == 0) {
                log.info("[ProjectService] Initializing default flagship project 'ProjectPulse' in domain_db...");
                Project defaultProject = new Project(
                    "ProjectPulse",
                    "Enterprise project intelligence platform",
                    "Sep 01, 2026",
                    "Dec 15, 2026",
                    "Bhavya Gutta"
                );
                defaultProject.setStatus("Active");
                defaultProject.setHealth("Healthy");
                defaultProject.setProgress(72);
                defaultProject.setMembersCount(5);
                defaultProject.setTasksCount(24);

                List<ProjectMember> members = new ArrayList<>();
                members.add(new ProjectMember("1", "Bhavya Gutta", "Frontend Lead", "BG"));
                members.add(new ProjectMember("2", "Alex Rivera", "Fullstack Engineer", "AR"));
                members.add(new ProjectMember("3", "Sarah Chen", "Product Manager", "SC"));
                members.add(new ProjectMember("4", "David Kim", "DevOps Engineer", "DK"));
                members.add(new ProjectMember("5", "Elena Rostova", "UI/UX Designer", "ER"));
                defaultProject.setMembers(members);

                defaultProject.setTaskSummary(new ProjectTaskSummary(24, 15, 7, 2));

                List<ProjectTask> tasks = new ArrayList<>();
                tasks.add(new ProjectTask("1", "Implement JWT auth interceptor", "In Progress", "High", "Alex Rivera", "Oct 28, 2026"));
                tasks.add(new ProjectTask("2", "Connect domain service with Atlas", "Completed", "Urgent", "Bhavya Gutta", "Oct 25, 2026"));
                tasks.add(new ProjectTask("3", "Design Analytics drilldown UI", "Todo", "Medium", "Elena Rostova", "Nov 02, 2026"));
                defaultProject.setRecentTasks(tasks);

                projectRepository.save(defaultProject);
                log.info("[ProjectService] Flagship project saved successfully. ID: {}", defaultProject.getId());
            }
        } catch (Exception e) {
            log.warn("[ProjectService] Could not check or seed default project at startup: {}", e.getMessage());
        }
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Project> getProjectsForUser(com.projectpulse.domainservice.security.AuthenticatedUser user) {
        List<Project> all = projectRepository.findAllByOrderByCreatedAtDesc();
        if (user == null || user.isAdmin()) {
            return all;
        }
        return all.stream()
                .filter(p -> isUserMemberOrOwner(p, user))
                .toList();
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Project getProjectByIdForUser(String id, com.projectpulse.domainservice.security.AuthenticatedUser user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));

        if (!isUserMemberOrOwner(project, user)) {
            throw new com.projectpulse.domainservice.exception.AccessDeniedException(
                    "Access denied: You are not a member of project '" + project.getName() + "'"
            );
        }

        return project;
    }

    public Project createProject(CreateProjectRequest request) {
        return createProject(request, new com.projectpulse.domainservice.security.AuthenticatedUser("1", "admin@projectpulse.io", "Admin", "ADMIN"));
    }

    public Project createProject(CreateProjectRequest request, com.projectpulse.domainservice.security.AuthenticatedUser user) {
        if (user != null && !user.canCreateProject()) {
            throw new com.projectpulse.domainservice.exception.AccessDeniedException(
                    "Insufficient permissions: Only ADMIN and PROJECT_MANAGER can create projects."
            );
        }

        String ownerName = (user != null && user.getName() != null && !user.getName().isBlank())
                ? user.getName()
                : ((request.getOwner() != null && !request.getOwner().isBlank()) ? request.getOwner() : "Workspace Owner");

        String ownerId = (user != null && user.getId() != null) ? user.getId() : "1";

        Project project = new Project(
            request.getName().trim(),
            request.getDescription().trim(),
            request.getStartDate(),
            request.getDueDate(),
            ownerName
        );

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            project.setStatus(request.getStatus());
        }
        if (request.getHealth() != null && !request.getHealth().isBlank()) {
            project.setHealth(request.getHealth());
        }

        // Add creator as primary project member and owner
        List<ProjectMember> members = new ArrayList<>();
        String initials = extractInitials(ownerName);
        members.add(new ProjectMember(ownerId, ownerName, "Owner", initials));
        project.setMembers(members);
        project.setMembersCount(1);
        project.setTaskSummary(new ProjectTaskSummary(0, 0, 0, 0));
        project.setRecentTasks(new ArrayList<>());
        project.setProgress(0);
        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());

        Project saved = projectRepository.save(project);
        if (projectEventProducer != null) {
            String recipientUserId = (user != null && user.getId() != null && !user.getId().isBlank()) ? user.getId() : null;
            projectEventProducer.publishProjectCreated(saved.getId(), saved.getName(), saved.getOwner(), recipientUserId);
        }
        return saved;
    }

    public boolean deleteProject(String id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean deleteProject(String id, com.projectpulse.domainservice.security.AuthenticatedUser user) {
        Project project = projectRepository.findById(id).orElse(null);
        if (project == null) {
            return false;
        }

        if (user != null && !user.isAdmin() && !isOwner(project, user)) {
            throw new com.projectpulse.domainservice.exception.AccessDeniedException(
                    "Insufficient permissions: Only ADMIN or the project owner can delete this project."
            );
        }

        projectRepository.deleteById(id);
        return true;
    }

    public boolean isUserMemberOrOwner(Project project, com.projectpulse.domainservice.security.AuthenticatedUser user) {
        if (project == null || user == null) {
            return false;
        }
        if (user.isAdmin()) {
            return true;
        }

        if (isOwner(project, user)) {
            return true;
        }

        if (project.getMembers() != null) {
            for (ProjectMember m : project.getMembers()) {
                if (m.getId() != null && m.getId().equalsIgnoreCase(user.getId())) {
                    return true;
                }
                if (m.getName() != null && (
                        m.getName().equalsIgnoreCase(user.getName()) ||
                        m.getName().equalsIgnoreCase(user.getEmail())
                )) {
                    return true;
                }
            }
        }

        return false;
    }

    private boolean isOwner(Project project, com.projectpulse.domainservice.security.AuthenticatedUser user) {
        String owner = project.getOwner();
        if (owner == null) return false;
        return owner.equalsIgnoreCase(user.getId()) ||
               owner.equalsIgnoreCase(user.getName()) ||
               owner.equalsIgnoreCase(user.getEmail());
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
