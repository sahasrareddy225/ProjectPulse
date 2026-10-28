package com.projectpulse.authservice.service;

import com.projectpulse.authservice.dto.LoginRequest;
import com.projectpulse.authservice.dto.LoginResponse;
import com.projectpulse.authservice.dto.RegisterRequest;
import com.projectpulse.authservice.dto.UserResponse;
import com.projectpulse.authservice.exception.InvalidCredentialsException;
import com.projectpulse.authservice.exception.UserAlreadyExistsException;
import com.projectpulse.authservice.model.User;
import com.projectpulse.authservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException("A user with email '" + normalizedEmail + "' already exists");
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getName().trim(), normalizedEmail, passwordHash, "MEMBER");
        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getCreatedAt()
        );
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        // Constant-time behavior: verify credentials without revealing email existence
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userOpt.get();
        String token = jwtService.generateToken(user);
        long expiresIn = jwtService.getExpirationSeconds();

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );

        return new LoginResponse(token, expiresIn, userResponse);
    }

    public UserResponse validateAndGetUser(String token) {
        Map<String, Object> claims = jwtService.parseAndValidateToken(token);
        String userId = (String) claims.get("sub");
        String email = (String) claims.get("email");
        String name = (String) claims.get("name");
        String role = (String) claims.get("role");

        return new UserResponse(userId, name, email, role, Instant.now());
    }
}
