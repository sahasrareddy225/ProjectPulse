package com.projectpulse.domainservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.domainservice.dto.CreateProjectRequest;
import com.projectpulse.domainservice.model.Project;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
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
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(projectController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("GET /api/projects returns list of projects")
    void shouldReturnProjectsList() throws Exception {
        Project project = new Project("Test Project", "Description", "Oct 01, 2026", "Nov 01, 2026", "Bhavya Gutta");
        project.setId("proj-1");

        when(projectService.getAllProjects()).thenReturn(List.of(project));

        mockMvc.perform(get("/api/projects"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value("proj-1"))
            .andExpect(jsonPath("$[0].name").value("Test Project"));
    }

    @Test
    @DisplayName("POST /api/projects creates a new project and returns 201")
    void shouldCreateProjectSuccessfully() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest(
            "New Alpha Project",
            "Core initiative for Q4",
            "Oct 25, 2026",
            "Dec 31, 2026"
        );

        Project created = new Project("New Alpha Project", "Core initiative for Q4", "Oct 25, 2026", "Dec 31, 2026", "Bhavya Gutta");
        created.setId("proj-alpha");

        when(projectService.createProject(any(CreateProjectRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value("proj-alpha"))
            .andExpect(jsonPath("$.name").value("New Alpha Project"));
    }

    @Test
    @DisplayName("GET /api/projects/{id} returns 404 when project not found")
    void shouldReturn404WhenNotFound() throws Exception {
        when(projectService.getProjectById("missing-id")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/projects/missing-id"))
            .andExpect(status().isNotFound());
    }
}
