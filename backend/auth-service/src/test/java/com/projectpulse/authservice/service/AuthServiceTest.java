package com.projectpulse.authservice.service;

import com.projectpulse.authservice.dto.LoginRequest;
import com.projectpulse.authservice.dto.LoginResponse;
import com.projectpulse.authservice.dto.RegisterRequest;
import com.projectpulse.authservice.dto.UserResponse;
import com.projectpulse.authservice.exception.InvalidCredentialsException;
import com.projectpulse.authservice.exception.UserAlreadyExistsException;
import com.projectpulse.authservice.model.User;
import com.projectpulse.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("Successfully registers user with hashed password and normalized email")
    void shouldRegisterUser() {
        RegisterRequest request = new RegisterRequest("Bob Jones", " Bob.Jones@Example.com ", "mySecretPassword123");

        when(userRepository.existsByEmail("bob.jones@example.com")).thenReturn(false);
        when(passwordEncoder.encode("mySecretPassword123")).thenReturn("$2a$10$hashedPasswordSample");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("gen-id-123");
            return user;
        });

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("gen-id-123", response.getId());
        assertEquals("Bob Jones", response.getName());
        assertEquals("bob.jones@example.com", response.getEmail());
        assertEquals("MEMBER", response.getRole());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("$2a$10$hashedPasswordSample", saved.getPasswordHash());
        assertNotEquals("mySecretPassword123", saved.getPasswordHash());
    }

    @Test
    @DisplayName("Throws UserAlreadyExistsException when email already registered")
    void shouldThrowWhenDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Bob Jones", "bob@example.com", "mySecretPassword123");
        when(userRepository.existsByEmail("bob@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(request));
    }

    @Test
    @DisplayName("Successfully logs in with valid credentials and issues JWT")
    void shouldLoginSuccessfully() {
        User user = new User("Alice", "alice@example.com", "$2a$10$hashedPasswordSample", "MEMBER");
        user.setId("user-1");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("ValidPassword123", "$2a$10$hashedPasswordSample")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("sample.jwt.token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        LoginResponse response = authService.login(new LoginRequest(" alice@example.com ", "ValidPassword123"));

        assertNotNull(response);
        assertEquals("sample.jwt.token", response.getToken());
        assertEquals(3600L, response.getExpiresIn());
        assertEquals("user-1", response.getUser().getId());
        assertEquals("alice@example.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Throws InvalidCredentialsException when email does not exist")
    void shouldThrowWhenEmailNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () ->
                authService.login(new LoginRequest("unknown@example.com", "SomePassword")));
    }

    @Test
    @DisplayName("Throws InvalidCredentialsException when password does not match")
    void shouldThrowWhenPasswordMismatch() {
        User user = new User("Alice", "alice@example.com", "$2a$10$hashedPasswordSample", "MEMBER");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "$2a$10$hashedPasswordSample")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () ->
                authService.login(new LoginRequest("alice@example.com", "WrongPassword")));
    }

    @Test
    @DisplayName("Prevents role escalation: public registration strictly assigns least-privileged MEMBER role")
    void shouldPreventRoleEscalationOnPublicRegistration() {
        RegisterRequest request = new RegisterRequest("Attacker", "attacker@example.com", "SecretPass123!");

        when(userRepository.existsByEmail("attacker@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecretPass123!")).thenReturn("$2a$10$hashedSecretPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = authService.register(request);

        assertEquals("MEMBER", response.getRole());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("MEMBER", captor.getValue().getRole());
    }
}
