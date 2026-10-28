package com.projectpulse.domainservice.service;

import com.projectpulse.domainservice.dto.CreateTaskRequest;
import com.projectpulse.domainservice.dto.UpdateTaskRequest;
import com.projectpulse.domainservice.event.TaskEventProducer;
import com.projectpulse.domainservice.exception.DependencyCycleException;
import com.projectpulse.domainservice.model.Project;
import com.projectpulse.domainservice.model.Task;
import com.projectpulse.domainservice.model.TaskAssignee;
import com.projectpulse.domainservice.repository.ProjectRepository;
import com.projectpulse.domainservice.repository.TaskRepository;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectService projectService;

    @Mock
    private TaskEventProducer taskEventProducer;

    private TaskService taskService;
    private AuthenticatedUser testUser;
    private Project testProject;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository, projectRepository, projectService, taskEventProducer);
        testUser = new AuthenticatedUser("u1", "dev@projectpulse.io", "Dev User", "DEVELOPER");
        testProject = new Project("Test Project", "Desc", "2026-09-01", "2026-12-01", "dev@projectpulse.io");
        testProject.setId("proj-1");
    }

    @Test
    @DisplayName("createTask persists task and synchronizes project statistics")
    void testCreateTaskSuccess() {
        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(testProject));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.findByProjectIdOrderByCreatedAtDesc("proj-1")).thenReturn(Collections.emptyList());

        CreateTaskRequest req = new CreateTaskRequest();
        req.setProjectId("proj-1");
        req.setTitle("Build API Gateway Routing");
        req.setDescription("Configure WebMvc Gateway routes");
        req.setStatus("TODO");
        req.setPriority("HIGH");
        req.setDueDate("2026-11-20");
        req.setAssignee(new TaskAssignee("u1", "Dev User", "Dev", "DU"));

        Task created = taskService.createTask(req, testUser);

        assertNotNull(created);
        assertEquals("Build API Gateway Routing", created.getTitle());
        assertEquals("proj-1", created.getProjectId());
        verify(taskRepository, atLeastOnce()).save(any(Task.class));
        verify(projectRepository, atLeastOnce()).save(any(Project.class));
    }

    @Test
    @DisplayName("validateNoDependencyCycle throws DependencyCycleException on direct self-dependency")
    void testSelfDependencyCycleThrows() {
        assertThrows(DependencyCycleException.class, () -> {
            taskService.validateNoDependencyCycle("task-100", List.of("task-100"));
        });
    }

    @Test
    @DisplayName("validateNoDependencyCycle throws DependencyCycleException on indirect circular cycle")
    void testIndirectDependencyCycleThrows() {
        Task parent = new Task();
        parent.setId("task-A");
        parent.setDependencies(List.of("task-B"));

        Task child = new Task();
        child.setId("task-B");
        child.setDependencies(List.of("task-C"));

        when(taskRepository.findById("task-A")).thenReturn(Optional.of(parent));
        when(taskRepository.findById("task-B")).thenReturn(Optional.of(child));

        // If task-C attempts to depend on task-A, it creates cycle: C -> A -> B -> C
        assertThrows(DependencyCycleException.class, () -> {
            taskService.validateNoDependencyCycle("task-C", List.of("task-A"));
        });
    }

    @Test
    @DisplayName("deleteTask removes task and cleans up dependencies in other tasks")
    void testDeleteTaskCleansDependencies() {
        when(taskRepository.existsById("task-del")).thenReturn(true);
        Task toDelete = new Task();
        toDelete.setId("task-del");
        toDelete.setProjectId("proj-1");
        when(taskRepository.findById("task-del")).thenReturn(Optional.of(toDelete));

        Task dependent = new Task();
        dependent.setId("task-dep");
        dependent.setDependencies(new ArrayList<>(List.of("task-del", "task-other")));

        when(taskRepository.findAll()).thenReturn(List.of(dependent));
        when(projectRepository.findById("proj-1")).thenReturn(Optional.of(testProject));
        when(taskRepository.findByProjectIdOrderByCreatedAtDesc("proj-1")).thenReturn(Collections.emptyList());

        boolean result = taskService.deleteTask("task-del", testUser);

        assertTrue(result);
        verify(taskRepository).deleteById("task-del");
        assertFalse(dependent.getDependencies().contains("task-del"));
        assertTrue(dependent.getDependencies().contains("task-other"));
    }
}
