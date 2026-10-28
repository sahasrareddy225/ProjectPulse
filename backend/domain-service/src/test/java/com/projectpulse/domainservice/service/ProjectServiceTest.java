package com.projectpulse.domainservice.service;

import com.projectpulse.domainservice.dto.CreateProjectRequest;
import com.projectpulse.domainservice.event.ProjectEventProducer;
import com.projectpulse.domainservice.model.Project;
import com.projectpulse.domainservice.repository.ProjectRepository;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectEventProducer projectEventProducer;

    @InjectMocks
    private ProjectService projectService;

    @Test
    @DisplayName("Save project to repository before publishing ProjectCreatedEvent")
    void shouldSaveProjectBeforePublishingKafkaEvent() {
        AuthenticatedUser pm = new AuthenticatedUser("pm-1", "pm@test.com", "Project Manager", "PROJECT_MANAGER");
        CreateProjectRequest request = new CreateProjectRequest("Event Driven Project", "Kafka test", "Nov 01, 2026", "Dec 01, 2026");

        Project savedProject = new Project("Event Driven Project", "Kafka test", "Nov 01, 2026", "Dec 01, 2026", "Project Manager");
        savedProject.setId("proj-kafka-1");

        when(projectRepository.save(any(Project.class))).thenReturn(savedProject);

        Project result = projectService.createProject(request, pm);

        assertNotNull(result);
        assertEquals("proj-kafka-1", result.getId());

        // Strictly verify order: save() MUST be called before publishProjectCreated()
        InOrder inOrder = inOrder(projectRepository, projectEventProducer);
        inOrder.verify(projectRepository).save(any(Project.class));
        inOrder.verify(projectEventProducer).publishProjectCreated(eq("proj-kafka-1"), eq("Event Driven Project"), eq("Project Manager"), eq("pm-1"));
    }
}
