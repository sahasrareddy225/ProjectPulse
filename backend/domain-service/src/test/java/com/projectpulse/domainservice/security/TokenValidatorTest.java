package com.projectpulse.domainservice.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectpulse.domainservice.exception.UnauthorizedException;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenValidatorTest {

    private static final String SECRET = "test-secret-key-that-is-at-least-32-bytes-long";
    private TokenValidator tokenValidator;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        tokenValidator = new TokenValidator(SECRET, objectMapper);
    }

    private String createToken(String userId, String email, String name, String role, long expirationSeconds, String signingSecret) throws Exception {
        long now = Instant.now().getEpochSecond();
        long exp = now + expirationSeconds;

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", userId);
        claims.put("email", email);
        claims.put("name", name);
        claims.put("role", role);
        claims.put("iat", now);
        claims.put("exp", exp);

        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsString(claims).getBytes(StandardCharsets.UTF_8));
        String content = header + "." + payload;

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));

        return content + "." + signature;
    }

    @Test
    @DisplayName("Reject request when Authorization header is missing")
    void shouldRejectRequestWithoutAuthorizationHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        assertThrows(UnauthorizedException.class, () -> tokenValidator.authenticate(request));
    }

    @Test
    @DisplayName("Reject request with untrusted X-User-Role header when Bearer token is missing")
    void shouldRejectUntrustedHeaderWithoutBearerToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Role", "ADMIN");
        request.addHeader("X-User-Id", "attacker-1");

        // Must reject spoofed headers instead of trusting them
        assertThrows(UnauthorizedException.class, () -> tokenValidator.authenticate(request));
    }

    @Test
    @DisplayName("Reject request with invalid JWT signature (tampered token)")
    void shouldRejectForgedTokenSignature() throws Exception {
        String tokenSignedWithDifferentKey = createToken("u-1", "user@test.com", "User", "ADMIN", 3600, "attacker-different-secret-key-32b");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + tokenSignedWithDifferentKey);

        assertThrows(UnauthorizedException.class, () -> tokenValidator.authenticate(request));
    }

    @Test
    @DisplayName("Reject request with expired JWT")
    void shouldRejectExpiredToken() throws Exception {
        String expiredToken = createToken("u-1", "user@test.com", "User", "MEMBER", -60, SECRET);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + expiredToken);

        assertThrows(UnauthorizedException.class, () -> tokenValidator.authenticate(request));
    }

    @Test
    @DisplayName("Authenticate valid Bearer token and extract signed claims")
    void shouldAuthenticateValidBearerToken() throws Exception {
        String validToken = createToken("u-valid", "admin@test.com", "Admin User", "ADMIN", 3600, SECRET);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + validToken);

        AuthenticatedUser user = tokenValidator.authenticate(request);

        assertNotNull(user);
        assertEquals("u-valid", user.getId());
        assertEquals("admin@test.com", user.getEmail());
        assertEquals("Admin User", user.getName());
        assertEquals("ADMIN", user.getRole());
        assertTrue(user.isAdmin());
        assertTrue(user.canCreateProject());
    }

    @Test
    @DisplayName("Ignore spoofed X-User-Role and strictly enforce role from verified JWT")
    void shouldIgnoreSpoofedHeaderWhenValidTokenPresent() throws Exception {
        // Token has MEMBER role
        String memberToken = createToken("m-1", "member@test.com", "Member", "MEMBER", 3600, SECRET);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + memberToken);
        // Attacker attempts to spoof ADMIN via header
        request.addHeader("X-User-Role", "ADMIN");

        AuthenticatedUser user = tokenValidator.authenticate(request);

        assertNotNull(user);
        assertEquals("MEMBER", user.getRole());
        assertFalse(user.isAdmin());
        assertFalse(user.canCreateProject());
    }
}
