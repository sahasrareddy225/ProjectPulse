package com.projectpulse.authservice.service;

import com.projectpulse.authservice.dto.RegisterRequest;
import com.projectpulse.authservice.dto.UserResponse;
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

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder);
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
}
