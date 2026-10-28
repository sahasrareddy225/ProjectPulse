package com.projectpulse.authservice.controller;

import com.projectpulse.authservice.dto.LoginRequest;
import com.projectpulse.authservice.dto.LoginResponse;
import com.projectpulse.authservice.dto.RegisterRequest;
import com.projectpulse.authservice.dto.UserResponse;
import com.projectpulse.authservice.exception.GlobalExceptionHandler;
import com.projectpulse.authservice.exception.InvalidCredentialsException;
import com.projectpulse.authservice.exception.UserAlreadyExistsException;
import com.projectpulse.authservice.service.AuthService;
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

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/register - 201 Created on valid input")
    void shouldRegisterUserSuccessfully() throws Exception {
        UserResponse response = new UserResponse("user-123", "Alice Smith", "alice@example.com", Instant.now());
        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        String json = """
                {
                    "name": "Alice Smith",
                    "email": "alice@example.com",
                    "password": "Password123!"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("user-123"))
                .andExpect(jsonPath("$.name").value("Alice Smith"))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/register - 400 Bad Request on invalid input")
    void shouldReturnBadRequestWhenInputIsInvalid() throws Exception {
        String invalidJson = """
                {
                    "name": "",
                    "email": "invalid-email",
                    "password": "short"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.name").isNotEmpty())
                .andExpect(jsonPath("$.fieldErrors.email").isNotEmpty())
                .andExpect(jsonPath("$.fieldErrors.password").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/auth/register - 409 Conflict on duplicate email")
    void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new UserAlreadyExistsException("A user with email 'existing@example.com' already exists"));

        String json = """
                {
                    "name": "Duplicate User",
                    "email": "existing@example.com",
                    "password": "ValidPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("A user with email 'existing@example.com' already exists"));
    }

    @Test
    @DisplayName("POST /api/auth/login - 200 OK on valid credentials")
    void shouldLoginSuccessfully() throws Exception {
        UserResponse user = new UserResponse("user-1", "Bob", "bob@example.com", "MEMBER", Instant.now());
        LoginResponse loginResponse = new LoginResponse("sample.jwt.token", 3600L, user);
        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        String json = """
                {
                    "email": "bob@example.com",
                    "password": "ValidPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("sample.jwt.token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andExpect(jsonPath("$.user.email").value("bob@example.com"))
                .andExpect(jsonPath("$.user.role").value("MEMBER"));
    }

    @Test
    @DisplayName("POST /api/auth/login - 401 Unauthorized on invalid credentials")
    void shouldReturnUnauthorizedWhenCredentialsInvalid() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        String json = """
                {
                    "email": "wrong@example.com",
                    "password": "WrongPassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("GET /api/auth/me - 401 Unauthorized when Authorization header is missing")
    void shouldReturnUnauthorizedWhenTokenMissingOnMe() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/auth/me - 200 OK when valid Bearer token provided")
    void shouldReturnUserWhenTokenValidOnMe() throws Exception {
        UserResponse user = new UserResponse("user-1", "Bob", "bob@example.com", "MEMBER", Instant.now());
        when(authService.validateAndGetUser("valid.token")).thenReturn(user);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/auth/me")
                        .header("Authorization", "Bearer valid.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("user-1"))
                .andExpect(jsonPath("$.email").value("bob@example.com"))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }
}
