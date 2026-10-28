package com.projectpulse.domainservice.service;

import com.projectpulse.domainservice.dto.AiQueryRequest;
import com.projectpulse.domainservice.dto.AiQueryResponse;
import com.projectpulse.domainservice.dto.DashboardAnalyticsResponse;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsAndAiServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    private AnalyticsService analyticsService;
    private AiAssistantService aiAssistantService;
    private AuthenticatedUser testUser;

    @BeforeEach
    void setUp() {
        analyticsService = new AnalyticsService(projectRepository, taskRepository);
        aiAssistantService = new AiAssistantService(projectRepository, taskRepository);
        testUser = new AuthenticatedUser("u1", "admin@projectpulse.io", "Admin User", "ADMIN");
    }

    @Test
    @DisplayName("getDashboardAnalytics accurately aggregates real project and task statistics")
    void testDashboardAnalyticsCalculation() {
        Project p1 = new Project("Flagship Project", "Desc", "2026-09-01", "2026-12-01", "admin@projectpulse.io");
        p1.setId("proj-1");
        p1.setStatus("Active");

        Task t1 = new Task("t1", "proj-1", "Done task", "Desc", "COMPLETED", "HIGH",
                new TaskAssignee("u1", "Admin User", "Lead", "AU"), "2026-10-01");
        Task t2 = new Task("t2", "proj-1", "Overdue task", "Desc", "IN_PROGRESS", "CRITICAL",
                new TaskAssignee("u2", "Teammate", "Dev", "TM"), "2026-09-01"); // overdue

        when(projectRepository.findAll()).thenReturn(List.of(p1));
        when(taskRepository.findAll()).thenReturn(List.of(t1, t2));

        DashboardAnalyticsResponse analytics = analyticsService.getDashboardAnalytics(testUser);

        assertNotNull(analytics);
        assertEquals(1, analytics.getTotalProjects());
        assertEquals(1, analytics.getActiveProjects());
        assertEquals(2, analytics.getTotalTasks());
        assertEquals(1, analytics.getCompletedTasks());
        assertEquals(1, analytics.getOverdueTasks());
        assertEquals(50.0, analytics.getCompletionRate());
        assertEquals(50.0, analytics.getOverdueRate());
        assertEquals(1, analytics.getStatusBreakdown().get("COMPLETED"));
        assertEquals(1, analytics.getStatusBreakdown().get("IN_PROGRESS"));
        assertFalse(analytics.getWorkloadDistribution().isEmpty());
    }

    @Test
    @DisplayName("queryAi detects risk intent and returns grounded findings on overdue/blocked items")
    void testAiQueryRiskIntentGrounded() {
        Project p1 = new Project("Flagship Project", "Desc", "2026-09-01", "2026-12-01", "admin@projectpulse.io");
        p1.setId("proj-1");

        Task t1 = new Task("t1", "proj-1", "Blocked critical task", "Desc", "BLOCKED", "CRITICAL",
                new TaskAssignee("u1", "Admin User", "Lead", "AU"), "2026-11-20");

        when(projectRepository.findAll()).thenReturn(List.of(p1));
        when(taskRepository.findAll()).thenReturn(List.of(t1));

        AiQueryRequest req = new AiQueryRequest("What are the project risks and blocked tasks?", "proj-1");
        AiQueryResponse response = aiAssistantService.queryAi(req, testUser);

        assertNotNull(response);
        assertEquals("RISK_DETECTION", response.getIntent());
        assertNotNull(response.getAnswer());
        assertTrue(response.getAnswer().contains("ProjectPulse Intelligence Report"));
        assertFalse(response.getRisks().isEmpty());
        assertFalse(response.getRecommendations().isEmpty());
        assertEquals("BLOCKED", response.getRisks().get(0).getType());
    }
}
