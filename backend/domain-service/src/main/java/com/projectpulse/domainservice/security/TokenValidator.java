package com.projectpulse.domainservice.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.domainservice.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class TokenValidator {

    private static final Logger log = LoggerFactory.getLogger(TokenValidator.class);
    public static final String DEFAULT_DEV_SECRET = "projectpulse-secure-jwt-default-secret-key-32bytes-min";
    private static final String HMAC_SHA256 = "HmacSHA256";
    private final byte[] secretKeyBytes;
    private final ObjectMapper objectMapper;

    @Autowired
    public TokenValidator(
            @Value("${jwt.secret:${JWT_SECRET:projectpulse-secure-jwt-default-secret-key-32bytes-min}}") String secret,
            @Value("${spring.profiles.active:}") String activeProfiles,
            ObjectMapper objectMapper) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("JWT secret key must not be blank.");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 32 bytes (256 bits) for HMAC-SHA256 security.");
        }

        boolean isProd = activeProfiles != null && (activeProfiles.contains("prod") || activeProfiles.contains("production"));
        if (isProd && DEFAULT_DEV_SECRET.equals(secret)) {
            throw new IllegalStateException("Production environment detected, but JWT_SECRET is using the insecure development default! " +
                    "A secure, high-entropy JWT_SECRET must be configured.");
        }

        if (DEFAULT_DEV_SECRET.equals(secret)) {
            log.warn("[SECURITY] Running with default development JWT secret key. Configure JWT_SECRET for staging/production deployments.");
        }

        this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.objectMapper = objectMapper;
    }

    public TokenValidator(String secret, ObjectMapper objectMapper) {
        this(secret, "", objectMapper);
    }

    public AuthenticatedUser authenticate(HttpServletRequest request) {
        if (request == null) {
            throw new UnauthorizedException("Authentication required");
        }

        // Untrusted client headers like X-User-Role, X-User-Id must never be trusted directly.
        // Identity and permissions must always be derived from a cryptographically verified Bearer JWT.
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Authentication required: missing Bearer token");
        }

        String token = authHeader.substring(7).trim();
        return validateJwt(token);
    }

    public AuthenticatedUser validateJwt(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Authentication token is empty");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new UnauthorizedException("Invalid token format");
        }

        String content = parts[0] + "." + parts[1];
        String expectedSignature = sign(content);

        // Constant-time comparison against signature forgery
        if (!MessageDigest.isEqual(
                parts[2].getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("Invalid token signature");
        }

        try {
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(payloadBytes, new TypeReference<>() {});

            Number expNumber = (Number) claims.get("exp");
            if (expNumber == null || expNumber.longValue() < Instant.now().getEpochSecond()) {
                throw new UnauthorizedException("Authentication token has expired");
            }

            String userId = (String) claims.getOrDefault("sub", "unknown");
            String email = (String) claims.getOrDefault("email", "");
            String name = (String) claims.getOrDefault("name", "");
            String role = (String) claims.getOrDefault("role", "MEMBER");

            return new AuthenticatedUser(userId, email, name, role);
        } catch (UnauthorizedException ue) {
            throw ue;
        } catch (Exception e) {
            throw new UnauthorizedException("Malformed token claims");
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec keySpec = new SecretKeySpec(secretKeyBytes, HMAC_SHA256);
            mac.init(keySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC signature", e);
        }
    }
}
