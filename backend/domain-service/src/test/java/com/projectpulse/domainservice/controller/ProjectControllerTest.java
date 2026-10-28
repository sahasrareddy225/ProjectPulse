package com.projectpulse.domainservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.domainservice.dto.CreateProjectRequest;
import com.projectpulse.domainservice.exception.AccessDeniedException;
import com.projectpulse.domainservice.exception.GlobalExceptionHandler;
import com.projectpulse.domainservice.exception.UnauthorizedException;
import com.projectpulse.domainservice.model.Project;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import com.projectpulse.domainservice.security.TokenValidator;
import com.projectpulse.domainservice.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProjectControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ProjectService projectService;

    @Mock
    private TokenValidator tokenValidator;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(projectController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("GET /api/projects - 401 Unauthorized when unauthenticated")
    void shouldReturnUnauthorizedWhenUnauthenticated() throws Exception {
        when(tokenValidator.authenticate(any())).thenThrow(new UnauthorizedException("Authentication required"));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Authentication required"));
    }

    @Test
    @DisplayName("GET /api/projects - 200 OK returns authorized project list")
    void shouldReturnProjectsListForAuthenticatedUser() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser("u-1", "user@example.com", "User", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(user);

        Project project = new Project("Test Project", "Description", "Oct 01, 2026", "Nov 01, 2026", "User");
        project.setId("proj-1");

        when(projectService.getProjectsForUser(user)).thenReturn(List.of(project));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("proj-1"))
                .andExpect(jsonPath("$[0].name").value("Test Project"));
    }

    @Test
    @DisplayName("POST /api/projects - 201 Created when created by PROJECT_MANAGER")
    void shouldCreateProjectWhenAuthorized() throws Exception {
        AuthenticatedUser pm = new AuthenticatedUser("pm-1", "pm@example.com", "PM User", "PROJECT_MANAGER");
        when(tokenValidator.authenticate(any())).thenReturn(pm);

        CreateProjectRequest request = new CreateProjectRequest(
                "New Initiative",
                "Project description",
                "Oct 25, 2026",
                "Dec 31, 2026"
        );

        Project created = new Project("New Initiative", "Project description", "Oct 25, 2026", "Dec 31, 2026", "PM User");
        created.setId("proj-initiative");

        when(projectService.createProject(any(CreateProjectRequest.class), eq(pm))).thenReturn(created);

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("proj-initiative"))
                .andExpect(jsonPath("$.name").value("New Initiative"));
    }

    @Test
    @DisplayName("POST /api/projects - 403 Forbidden when MEMBER attempts to create project (denied action)")
    void shouldRejectProjectCreationForMember() throws Exception {
        AuthenticatedUser member = new AuthenticatedUser("m-1", "member@example.com", "Member User", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(member);
        when(projectService.createProject(any(CreateProjectRequest.class), eq(member)))
                .thenThrow(new AccessDeniedException("Insufficient permissions: Only ADMIN and PROJECT_MANAGER can create projects."));

        CreateProjectRequest request = new CreateProjectRequest(
                "Unauthorized Project",
                "Description",
                "Oct 25, 2026",
                "Dec 31, 2026"
        );

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Insufficient permissions: Only ADMIN and PROJECT_MANAGER can create projects."));
    }

    @Test
    @DisplayName("GET /api/projects/{id} - 403 Forbidden on cross-project access for non-member")
    void shouldDenyCrossProjectAccessForNonMember() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser("u-other", "other@example.com", "Other User", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(user);
        when(projectService.getProjectByIdForUser(eq("proj-secret"), eq(user)))
                .thenThrow(new AccessDeniedException("Access denied: You are not a member of project 'Secret Project'"));

        mockMvc.perform(get("/api/projects/proj-secret"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Access denied: You are not a member of project 'Secret Project'"));
    }

    @Test
    @DisplayName("GET /api/projects/{id} - 200 OK when user is member")
    void shouldAllowProjectAccessForMember() throws Exception {
        AuthenticatedUser member = new AuthenticatedUser("m-1", "member@example.com", "Member User", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(member);

        Project project = new Project("Team Project", "Description", "Oct 01, 2026", "Nov 01, 2026", "Owner");
        project.setId("proj-team");

        when(projectService.getProjectByIdForUser("proj-team", member)).thenReturn(project);

        mockMvc.perform(get("/api/projects/proj-team"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("proj-team"))
                .andExpect(jsonPath("$.name").value("Team Project"));
    }

    @Test
    @DisplayName("GET /api/projects/{id} - 404 Not Found when project does not exist")
    void shouldReturn404WhenNotFound() throws Exception {
        AuthenticatedUser admin = new AuthenticatedUser("admin-1", "admin@example.com", "Admin", "ADMIN");
        when(tokenValidator.authenticate(any())).thenReturn(admin);
        when(projectService.getProjectByIdForUser(eq("missing-id"), eq(admin)))
                .thenThrow(new IllegalArgumentException("Project not found: missing-id"));

        mockMvc.perform(get("/api/projects/missing-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/projects/{id} - 403 Forbidden when non-owner/non-admin attempts delete")
    void shouldDenyDeleteForNonOwnerNonAdmin() throws Exception {
        AuthenticatedUser member = new AuthenticatedUser("m-1", "member@example.com", "Member", "MEMBER");
        when(tokenValidator.authenticate(any())).thenReturn(member);
        when(projectService.deleteProject(eq("proj-1"), eq(member)))
                .thenThrow(new AccessDeniedException("Insufficient permissions: Only ADMIN or the project owner can delete this project."));

        mockMvc.perform(delete("/api/projects/proj-1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }
}
