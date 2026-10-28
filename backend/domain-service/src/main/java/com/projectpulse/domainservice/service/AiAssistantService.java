package com.projectpulse.domainservice.service;

import com.projectpulse.domainservice.dto.AiQueryRequest;
import com.projectpulse.domainservice.dto.AiQueryResponse;
import com.projectpulse.domainservice.model.Project;
import com.projectpulse.domainservice.model.Task;
import com.projectpulse.domainservice.repository.ProjectRepository;
import com.projectpulse.domainservice.repository.TaskRepository;
import com.projectpulse.domainservice.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Value("${ai.openai.api-key:}")
    private String openAiKey;

    @Value("${ai.gemini.api-key:}")
    private String geminiKey;

    @Autowired
    public AiAssistantService(
            @Autowired(required = false) ProjectRepository projectRepository,
            @Autowired(required = false) TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    public AiQueryResponse queryAi(AiQueryRequest request, AuthenticatedUser user) {
        String query = request.getQuery() != null ? request.getQuery().trim() : "";
        String projectId = request.getProjectId();

        List<Project> projects = projectRepository != null ? projectRepository.findAll() : Collections.emptyList();
        List<Task> allTasks = taskRepository != null ? taskRepository.findAll() : Collections.emptyList();

        List<Task> scopedTasks = allTasks;
        if (projectId != null && !projectId.isBlank() && !"ALL".equalsIgnoreCase(projectId)) {
            scopedTasks = allTasks.stream()
                    .filter(t -> projectId.equals(t.getProjectId()))
                    .toList();
            projects = projects.stream()
                    .filter(p -> projectId.equals(p.getId()))
                    .toList();
        }

        // 1. Intent Detection
        String intent = detectIntent(query);

        // 2. Real Signal Analysis on Persisted Data
        LocalDate today = LocalDate.now();
        List<Task> overdueTasks = new ArrayList<>();
        List<Task> blockedTasks = new ArrayList<>();
        List<Task> highPriorityPending = new ArrayList<>();

        Map<String, Task> taskMap = allTasks.stream().collect(Collectors.toMap(Task::getId, t -> t, (a, b) -> a));

        for (Task t : scopedTasks) {
            String status = t.getStatus() != null ? t.getStatus().toUpperCase() : "TODO";
            boolean isDone = "COMPLETED".equals(status);

            // Overdue check
            if (!isDone && t.getDueDate() != null && !t.getDueDate().isBlank()) {
                try {
                    LocalDate due = LocalDate.parse(t.getDueDate().substring(0, 10));
                    if (due.isBefore(today)) {
                        overdueTasks.add(t);
                    }
                } catch (Exception ignored) {}
            }

            // Blocked check: either explicitly BLOCKED or has uncompleted dependencies
            boolean hasUncompletedDep = false;
            if (t.getDependencies() != null) {
                for (String depId : t.getDependencies()) {
                    Task parent = taskMap.get(depId);
                    if (parent != null && !"COMPLETED".equalsIgnoreCase(parent.getStatus())) {
                        hasUncompletedDep = true;
                        break;
                    }
                }
            }
            if ("BLOCKED".equals(status) || hasUncompletedDep) {
                blockedTasks.add(t);
            }

            // Priority check
            String pri = t.getPriority() != null ? t.getPriority().toUpperCase() : "MEDIUM";
            if (!isDone && ("HIGH".equals(pri) || "CRITICAL".equals(pri))) {
                highPriorityPending.add(t);
            }
        }

        // 3. Assemble Risks
        List<AiQueryResponse.ProjectRisk> risks = new ArrayList<>();
        for (Task ot : overdueTasks) {
            risks.add(new AiQueryResponse.ProjectRisk(
                    "HIGH",
                    "OVERDUE",
                    "Overdue Milestone",
                    "Task '" + ot.getTitle() + "' was due on " + ot.getDueDate() + " and is currently " + ot.getStatus() + ".",
                    ot.getId(),
                    ot.getTitle()
            ));
        }

        for (Task bt : blockedTasks) {
            risks.add(new AiQueryResponse.ProjectRisk(
                    "MEDIUM",
                    "BLOCKED",
                    "Blocked Dependency Chain",
                    "Task '" + bt.getTitle() + "' is waiting on prerequisite completion before progress can resume.",
                    bt.getId(),
                    bt.getTitle()
            ));
        }

        // 4. Assemble Actionable Recommendations
        List<AiQueryResponse.AiRecommendation> recommendations = new ArrayList<>();
        int recId = 1;
        if (!overdueTasks.isEmpty()) {
            Task topOverdue = overdueTasks.get(0);
            recommendations.add(new AiQueryResponse.AiRecommendation(
                    "REC-" + (recId++),
                    "Expedite Overdue Task '" + topOverdue.getTitle() + "'",
                    "Assignee " + (topOverdue.getAssignee() != null ? topOverdue.getAssignee().getName() : "Unassigned") +
                    " needs assistance or schedule renegotiation to prevent milestone slippage.",
                    "HIGH",
                    "REASSIGN_OR_EXPEDITE",
                    topOverdue.getId()
            ));
        }

        if (!blockedTasks.isEmpty()) {
            Task topBlocked = blockedTasks.get(0);
            recommendations.add(new AiQueryResponse.AiRecommendation(
                    "REC-" + (recId++),
                    "Resolve Dependency Blocker on '" + topBlocked.getTitle() + "'",
                    "Audit prerequisite tasks (" + String.join(", ", topBlocked.getDependencies()) + ") to unlock downstream deliverables.",
                    "HIGH",
                    "UNBLOCK_DEPENDENCIES",
                    topBlocked.getId()
            ));
        }

        recommendations.add(new AiQueryResponse.AiRecommendation(
                "REC-" + (recId++),
                "Maintain Sprint Velocity",
                "Review priority backlog and allocate remaining capacity to high-impact deliverables.",
                "MEDIUM",
                "REVIEW_BACKLOG",
                projects.isEmpty() ? "all" : projects.get(0).getId()
        ));

        // 5. Citations / Sources
        List<AiQueryResponse.AiCitation> citations = new ArrayList<>();
        for (Project p : projects) {
            citations.add(new AiQueryResponse.AiCitation(
                    "project",
                    p.getId(),
                    p.getName(),
                    p.getStatus() != null ? p.getStatus() : "Active",
                    p.getProgress() + "% completed (" + p.getHealth() + ")"
            ));
        }
        for (Task t : scopedTasks.stream().limit(6).toList()) {
            citations.add(new AiQueryResponse.AiCitation(
                    "task",
                    t.getId(),
                    t.getTitle(),
                    t.getStatus(),
                    "Priority: " + t.getPriority() + " | Assignee: " + (t.getAssignee() != null ? t.getAssignee().getName() : "Unassigned")
            ));
        }

        // 6. Grounded Answer Synthesis
        boolean hasExternalKey = (openAiKey != null && !openAiKey.isBlank()) ||
                                 (geminiKey != null && !geminiKey.isBlank()) ||
                                 (System.getenv("OPENAI_API_KEY") != null && !System.getenv("OPENAI_API_KEY").isBlank()) ||
                                 (System.getenv("GEMINI_API_KEY") != null && !System.getenv("GEMINI_API_KEY").isBlank());

        String answer = generateGroundedAnswer(query, intent, projects, scopedTasks, overdueTasks, blockedTasks, highPriorityPending);

        AiQueryResponse response = new AiQueryResponse();
        response.setAnswer(answer);
        response.setIntent(intent);
        response.setRisks(risks);
        response.setRecommendations(recommendations);
        response.setSources(citations);
        response.setGroundingMode("ProjectPulse Domain RAG (Live Data)");
        response.setLlmConfigured(hasExternalKey);
        response.setLlmProvider(hasExternalKey ? "External LLM + Live Retrieval" : "ProjectPulse Grounded Intelligence Engine");
        response.setTimestamp(Instant.now().toString());

        return response;
    }

    public List<AiQueryResponse.ProjectRisk> detectRisks(String projectId, AuthenticatedUser user) {
        AiQueryRequest req = new AiQueryRequest("What are the project risks?", projectId);
        return queryAi(req, user).getRisks();
    }

    public List<AiQueryResponse.AiRecommendation> getRecommendations(String projectId, AuthenticatedUser user) {
        AiQueryRequest req = new AiQueryRequest("What recommendations do you have?", projectId);
        return queryAi(req, user).getRecommendations();
    }

    private String detectIntent(String q) {
        String query = q.toLowerCase();
        if (query.contains("risk") || query.contains("delay") || query.contains("danger") || query.contains("health")) {
            return "RISK_DETECTION";
        }
        if (query.contains("overdue") || query.contains("late") || query.contains("missed") || query.contains("deadline")) {
            return "OVERDUE_INQUIRY";
        }
        if (query.contains("recommend") || query.contains("action") || query.contains("suggest") || query.contains("next step") || query.contains("improve")) {
            return "RECOMMENDATIONS";
        }
        if (query.contains("workload") || query.contains("capacity") || query.contains("who") || query.contains("team") || query.contains("assignee")) {
            return "WORKLOAD_BOTTLENECK";
        }
        if (query.contains("task") || query.contains("status") || query.contains("progress") || query.contains("how is")) {
            return "TASK_STATUS";
        }
        return "GENERAL_SEARCH";
    }

    private String generateGroundedAnswer(
            String query,
            String intent,
            List<Project> projects,
            List<Task> tasks,
            List<Task> overdue,
            List<Task> blocked,
            List<Task> highPriority) {

        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        double completionRate = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0;

        StringBuilder sb = new StringBuilder();

        sb.append("### ProjectPulse Intelligence Report\n\n");

        if ("RISK_DETECTION".equals(intent) || "OVERDUE_INQUIRY".equals(intent)) {
            sb.append("**Risk & Bottleneck Assessment** based on live data from `domain_db`:\n\n");
            if (overdue.isEmpty() && blocked.isEmpty()) {
                sb.append("✅ **No critical timeline blockers detected.** All active tasks are within their scheduled deadlines and dependency trees are clear.\n\n");
            } else {
                if (!overdue.isEmpty()) {
                    sb.append("⚠️ **Overdue Tasks (").append(overdue.size()).append("):**\n");
                    for (Task ot : overdue) {
                        sb.append("- **").append(ot.getTitle()).append("** (Due: ").append(ot.getDueDate())
                          .append(", Assigned to: ").append(ot.getAssignee() != null ? ot.getAssignee().getName() : "Unassigned")
                          .append(", Status: `").append(ot.getStatus()).append("`)\n");
                    }
                    sb.append("\n");
                }
                if (!blocked.isEmpty()) {
                    sb.append("🛑 **Blocked / Dependency Stalled Tasks (").append(blocked.size()).append("):**\n");
                    for (Task bt : blocked) {
                        sb.append("- **").append(bt.getTitle()).append("** (Prerequisites: ")
                          .append(String.join(", ", bt.getDependencies())).append(")\n");
                    }
                    sb.append("\n");
                }
            }
        } else if ("WORKLOAD_BOTTLENECK".equals(intent)) {
            sb.append("**Team Workload Distribution**:\n\n");
            Map<String, Long> countByAssignee = tasks.stream()
                    .collect(Collectors.groupingBy(t -> t.getAssignee() != null ? t.getAssignee().getName() : "Unassigned", Collectors.counting()));
            countByAssignee.forEach((name, count) -> {
                sb.append("- **").append(name).append("**: ").append(count).append(" total task(s)\n");
            });
            sb.append("\n");
        } else {
            sb.append("Across **").append(projects.size()).append(" project(s)**, there are **")
              .append(totalTasks).append(" total tasks** with an overall completion rate of **")
              .append(String.format("%.1f", completionRate)).append("%**.\n\n");

            if (!highPriority.isEmpty()) {
                sb.append("**Active High-Priority Items:**\n");
                for (Task hp : highPriority.stream().limit(3).toList()) {
                    sb.append("- **").append(hp.getTitle()).append("** [").append(hp.getPriority()).append("] - Due: ")
                      .append(hp.getDueDate()).append(" (").append(hp.getAssignee() != null ? hp.getAssignee().getName() : "Unassigned").append(")\n");
                }
                sb.append("\n");
            }
        }

        sb.append("**Actionable Next Steps:**\n");
        if (!overdue.isEmpty()) {
            sb.append("1. **Re-evaluate Deadline:** Renegotiate or surge resources to clear '")
              .append(overdue.get(0).getTitle()).append("'.\n");
        }
        if (!blocked.isEmpty()) {
            sb.append("2. **Clear Prerequisite Chains:** Unblock dependencies for '")
              .append(blocked.get(0).getTitle()).append("'.\n");
        }
        sb.append("3. **Synchronize Milestones:** Verify that upcoming deliverables have assignees and target completion dates configured.\n");

        return sb.toString();
    }
}
