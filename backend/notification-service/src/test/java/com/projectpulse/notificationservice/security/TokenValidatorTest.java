package com.projectpulse.notificationservice.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.notificationservice.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class TokenValidatorTest {

    private static final String TEST_SECRET = "projectpulse-test-jwt-secret-key-32bytes-min";
    private TokenValidator tokenValidator;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        tokenValidator = new TokenValidator(TEST_SECRET, objectMapper);
    }

    private String createToken(String sub, String email, String name, String role, long expOffsetSeconds, String secret) {
        long now = Instant.now().getEpochSecond();
        long exp = now + expOffsetSeconds;

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", sub);
        claims.put("email", email);
        claims.put("name", name);
        claims.put("role", role);
        claims.put("iat", now);
        claims.put("exp", exp);

        try {
            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String headerB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String payloadJson = objectMapper.writeValueAsString(claims);
            String payloadB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            String content = headerB64 + "." + payloadB64;

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hmac = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
            String signature = Base64.getUrlEncoder().withoutPadding().encodeToString(hmac);

            return content + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    @DisplayName("Validate correctly signed JWT and extract AuthenticatedUser")
    void shouldValidateValidJwt() {
        String token = createToken("user-42", "sarah@projectpulse.io", "Sarah Chen", "PROJECT_MANAGER", 3600, TEST_SECRET);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        AuthenticatedUser user = tokenValidator.authenticate(request);

        assertNotNull(user);
        assertEquals("user-42", user.getId());
        assertEquals("sarah@projectpulse.io", user.getEmail());
        assertEquals("Sarah Chen", user.getName());
        assertEquals("PROJECT_MANAGER", user.getRole());
    }

    @Test
    @DisplayName("Reject expired token with UnauthorizedException")
    void shouldRejectExpiredToken() {
        String token = createToken("user-42", "sarah@test.com", "Sarah", "MEMBER", -10, TEST_SECRET);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> tokenValidator.authenticate(request));
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("Reject token signed with wrong secret")
    void shouldRejectForgedSignature() {
        String token = createToken("user-42", "sarah@test.com", "Sarah", "MEMBER", 3600, "attacker-wrong-secret-key-32bytes-min");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> tokenValidator.authenticate(request));
        assertTrue(ex.getMessage().contains("signature"));
    }

    @Test
    @DisplayName("Reject request with missing Bearer prefix or missing Authorization header")
    void shouldRejectMissingBearerHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> tokenValidator.authenticate(request));
        assertTrue(ex.getMessage().contains("missing Bearer token"));
    }
}
