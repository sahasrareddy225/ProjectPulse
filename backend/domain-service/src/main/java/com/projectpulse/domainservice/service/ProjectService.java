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

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;

    public ProjectService(@org.springframework.beans.factory.annotation.Autowired(required = false) ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
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

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Project createProject(CreateProjectRequest request) {
        String owner = (request.getOwner() != null && !request.getOwner().isBlank())
            ? request.getOwner()
            : "Bhavya Gutta";

        Project project = new Project(
            request.getName().trim(),
            request.getDescription().trim(),
            request.getStartDate(),
            request.getDueDate(),
            owner
        );

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            project.setStatus(request.getStatus());
        }
        if (request.getHealth() != null && !request.getHealth().isBlank()) {
            project.setHealth(request.getHealth());
        }

        // Add creator as primary project member
        List<ProjectMember> members = new ArrayList<>();
        String initials = extractInitials(owner);
        members.add(new ProjectMember("1", owner, "Owner", initials));
        project.setMembers(members);
        project.setMembersCount(1);
        project.setTaskSummary(new ProjectTaskSummary(0, 0, 0, 0));
        project.setRecentTasks(new ArrayList<>());
        project.setProgress(0);
        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());

        return projectRepository.save(project);
    }

    public boolean deleteProject(String id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return true;
        }
        return false;
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
