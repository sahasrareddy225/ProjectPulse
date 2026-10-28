package com.projectpulse.authservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.authservice.exception.InvalidCredentialsException;
import com.projectpulse.authservice.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    public static final String DEFAULT_DEV_SECRET = "projectpulse-secure-jwt-default-secret-key-32bytes-min";
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final String HEADER_B64 = Base64.getUrlEncoder().withoutPadding()
            .encodeToString(HEADER_JSON.getBytes(StandardCharsets.UTF_8));

    private final byte[] secretKeyBytes;
    private final long expirationSeconds;
    private final ObjectMapper objectMapper;

    @Autowired
    public JwtService(
            @Value("${jwt.secret:${JWT_SECRET:projectpulse-secure-jwt-default-secret-key-32bytes-min}}") String secret,
            @Value("${jwt.expiration-seconds:3600}") long expirationSeconds,
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
        this.expirationSeconds = expirationSeconds;
        this.objectMapper = objectMapper;
    }

    public JwtService(String secret, long expirationSeconds, ObjectMapper objectMapper) {
        this(secret, expirationSeconds, "", objectMapper);
    }

    public String generateToken(User user) {
        long now = Instant.now().getEpochSecond();
        long exp = now + expirationSeconds;

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getId());
        claims.put("email", user.getEmail());
        claims.put("name", user.getName());
        claims.put("role", user.getRole());
        claims.put("iat", now);
        claims.put("exp", exp);

        try {
            String payloadJson = objectMapper.writeValueAsString(claims);
            String payloadB64 = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

            String content = HEADER_B64 + "." + payloadB64;
            String signature = sign(content);

            return content + "." + signature;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate JWT", e);
        }
    }

    public Map<String, Object> parseAndValidateToken(String token) {
        if (token == null || token.isBlank()) {
            throw new InvalidCredentialsException("Authentication token is missing");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new InvalidCredentialsException("Invalid token format");
        }

        String content = parts[0] + "." + parts[1];
        String expectedSignature = sign(content);

        // Constant-time comparison to prevent timing attacks
        if (!MessageDigest.isEqual(
                parts[2].getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            throw new InvalidCredentialsException("Invalid token signature");
        }

        try {
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(payloadBytes, new TypeReference<>() {});

            Number expNumber = (Number) claims.get("exp");
            if (expNumber == null || expNumber.longValue() < Instant.now().getEpochSecond()) {
                throw new InvalidCredentialsException("Token has expired");
            }

            return claims;
        } catch (InvalidCredentialsException ice) {
            throw ice;
        } catch (Exception e) {
            throw new InvalidCredentialsException("Malformed token claims");
        }
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec keySpec = new SecretKeySpec(secretKeyBytes, HMAC_SHA256);
            mac.init(keySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new IllegalStateException("Could not compute HMAC signature", e);
        }
    }
}
