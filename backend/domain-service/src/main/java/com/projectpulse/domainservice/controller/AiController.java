package com.projectpulse.domainservice.controller;

import com.projectpulse.domainservice.dto.AiQueryRequest;
import com.projectpulse.domainservice.dto.AiQueryResponse;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import com.projectpulse.domainservice.security.TokenValidator;
import com.projectpulse.domainservice.service.AiAssistantService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class AiController {

    private final AiAssistantService aiAssistantService;
    private final TokenValidator tokenValidator;

    public AiController(AiAssistantService aiAssistantService, TokenValidator tokenValidator) {
        this.aiAssistantService = aiAssistantService;
        this.tokenValidator = tokenValidator;
    }

    @PostMapping("/query")
    public ResponseEntity<AiQueryResponse> queryAi(
            @Valid @RequestBody AiQueryRequest request,
            HttpServletRequest httpRequest) {
        AuthenticatedUser user = tokenValidator.authenticate(httpRequest);
        return ResponseEntity.ok(aiAssistantService.queryAi(request, user));
    }

    @GetMapping("/risks")
    public ResponseEntity<List<AiQueryResponse.ProjectRisk>> getRisks(
            @RequestParam(required = false) String projectId,
            HttpServletRequest httpRequest) {
        AuthenticatedUser user = tokenValidator.authenticate(httpRequest);
        return ResponseEntity.ok(aiAssistantService.detectRisks(projectId, user));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<AiQueryResponse.AiRecommendation>> getRecommendations(
            @RequestParam(required = false) String projectId,
            HttpServletRequest httpRequest) {
        AuthenticatedUser user = tokenValidator.authenticate(httpRequest);
        return ResponseEntity.ok(aiAssistantService.getRecommendations(projectId, user));
    }
}
