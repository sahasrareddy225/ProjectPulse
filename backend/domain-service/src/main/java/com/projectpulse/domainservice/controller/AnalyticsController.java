package com.projectpulse.domainservice.controller;

import com.projectpulse.domainservice.dto.DashboardAnalyticsResponse;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import com.projectpulse.domainservice.security.TokenValidator;
import com.projectpulse.domainservice.service.AnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.OPTIONS}
)
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final TokenValidator tokenValidator;

    public AnalyticsController(AnalyticsService analyticsService, TokenValidator tokenValidator) {
        this.analyticsService = analyticsService;
        this.tokenValidator = tokenValidator;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalyticsResponse> getDashboardAnalytics(HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics(user));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<DashboardAnalyticsResponse> getProjectAnalytics(
            @PathVariable String projectId,
            HttpServletRequest request) {
        AuthenticatedUser user = tokenValidator.authenticate(request);
        return ResponseEntity.ok(analyticsService.getProjectAnalytics(projectId, user));
    }
}
