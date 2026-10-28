# ProjectPulse — Teammate Handover Guide

Welcome to **ProjectPulse**! This guide is written to give you a smooth, confident onboarding experience with the platform's architecture, latest implementation state, local environment setup, startup sequence, verification steps, and remaining roadmap.

---

## A. Project Overview

### 1. Platform Purpose & Core Workflows
ProjectPulse is an **AI-powered project intelligence and workflow management platform** engineered for cross-functional software teams. It solves the fragmentation between task tracking, real-time team notifications, delivery risk analysis, and AI-assisted decision making.

Core user workflows:
1. **Authentication & Team Onboarding**: Secure registration and login with role-based permissions (`ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `VIEWER`).
2. **Project Portfolio & Task Operations**: Creating projects, assigning team members, defining tasks with granular metadata (priority, estimate, due dates, tags), and tracking status transitions (`TODO` → `IN_PROGRESS` → `REVIEW` → `COMPLETED` / `BLOCKED`).
3. **Workflow & Dependency Governance**: Explicitly declaring prerequisite task dependencies with automated cycle detection preventing circular dependency deadlocks.
4. **Persistent Real-Time Notifications**: Automated event dispatching on project and task milestones via Kafka, with user-scoped persistent inbox management.
5. **Operational Analytics**: Real-time aggregated completion rates, overdue deliverable rates, team workload distribution, and project health indicators calculated on live data.
6. **Grounded AI Assistant & Risk Detection**: Querying project state, identifying timeline bottlenecks, surfacing blocked prerequisite chains, and receiving actionable recommendations grounded in real project data.

### 2. SOA / Microservices Architecture
ProjectPulse follows a clean Service-Oriented Architecture (SOA) structured into microservices:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 18 + TypeScript Frontend (Vite)                │
│                        (http://localhost:5173)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Spring Cloud API Gateway (http://localhost:8081)           │
│                 Routing, Path Mapping, Security Gateway                │
└───────┬──────────────┬──────────────┬──────────────┬───────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐
│ Auth Service │ │Domain Service│ │ Notification │ │  Config & Discovery │
│ (Port 8082)  │ │ (Port 8083)  │ │   Service    │ │   Eureka (8761)     │
│  User & JWT  │ │Projects/Tasks│ │ (Port 8085)  │ │   Config (8888)     │
└───────┬──────┘ └──────┬───────┘ └──────┬───────┘ └─────────────────────┘
        │               │                │
        │ MongoDB       │ MongoDB        │ MongoDB
        ▼               ▼                ▼
   [auth_db]       [domain_db]    [notification_db]
                        │                ▲
                        │ Kafka Events   │ Kafka Consumer
                        └───────► [Kafka Broker] ────────┘
                                 (Port 9092)
```

### 3. Service Responsibilities & Ports

| Service | Port | Primary Responsibilities | Database / Broker |
|---|:---:|---|---|
| **Discovery Server** | `8761` | Eureka service registry | Standalone |
| **Config Server** | `8888` | Centralized external configuration | Local configuration repo |
| **API Gateway** | `8081` | Single entry point, routing rules | Proxies to microservices |
| **Auth Service** | `8082` | User registration, authentication, JWT issuance, roles | MongoDB (`auth_db`) |
| **Domain Service** | `8083` | Projects, tasks, cycle detection, analytics, AI RAG engine, Kafka producer | MongoDB (`domain_db`), Kafka |
| **Notification Service** | `8085` | Kafka event consumption, idempotent persistence, user notification inbox | MongoDB (`notification_db`), Kafka |
| **Frontend** | `5173` | React/TypeScript SPA, dashboards, modals, bell feed, AI chat | Browser / Vite |

### 4. The Data Vision
ProjectPulse is built on a four-tier intelligence progression:
- **DATA**: MongoDB document persistence of projects, tasks, assignees, deadlines, and dependencies.
- **KNOWLEDGE**: Structured Kafka event feeds (`project-events`, `task-events`) and dependency relationship graphs.
- **INSIGHT**: Real-time analytical aggregations (overdue velocity, completion rates, workload skew).
- **RECOMMENDATION**: Grounded RAG intelligence surfacing root causes, blocked task warnings, and prioritized team actions.

---

## B. Repository and Git Workflow

### 1. Repository Structure
```
C:\Projectpulse\
├── .env.example                 # Sanitized environment variable template
├── .gitignore                   # Root gitignore (ignoring .env, target/, node_modules)
├── README.md                    # Root project documentation
├── docker-compose.kafka.yml     # Apache Kafka (KRaft mode) broker
├── docs\
│   ├── PROJECT_STATUS.md        # Detailed completion percentage & audit
│   └── TEAMMATE_HANDOVER.md     # This comprehensive handover guide
├── backend\
│   ├── pom.xml                  # Parent Maven POM (Java 24, Spring Boot 4.1.2)
│   ├── mvnw.cmd / mvnw          # Maven wrapper binaries
│   ├── api-gateway\             # Spring Cloud Gateway (Port 8081)
│   ├── auth-service\            # Authentication & JWT Service (Port 8082)
│   ├── domain-service\          # Core Domain, Tasks, Analytics, AI RAG (Port 8083)
│   ├── notification-service\    # Kafka Event Consumer & Inbox (Port 8085)
│   ├── config-server\           # Centralized Config (Port 8888)
│   ├── discovery-server\        # Eureka Registry (Port 8761)
│   ├── workflow-service\        # Workflow module (Port 8084)
│   ├── analytics-service\       # Analytics module (Port 8086)
│   └── ai-assistant-service\    # AI assistant module (Port 8087)
└── frontend\
    ├── package.json             # React 18, Vite, TypeScript, Tailwind
    ├── src\
    │   ├── components\          # UI components (tasks, analytics, ai, dashboard, layout)
    │   ├── pages\               # Top-level page views (Projects, Tasks, Workflow, Analytics, AIAssistant)
    │   ├── services\            # API client services (authService, projectService, taskService, analyticsService, aiService, notificationService)
    │   ├── routes\              # AppRoutes with ProtectedRoute wrapper
    │   └── store\               # Zustand authStore
```

### 2. Current Git State
- **Branch**: `dev`
- **Latest Remote & Local Commit**: `4ffc6a7` (`feat(auth): connect registration UI to Auth Service`)
- **Current Status**: All code changes implemented in this batch are currently **in the local working tree** on branch `dev`. Nothing has been discarded, reset, or pushed yet.

### 3. Safe Staging, Committing & Merge Sequence
When you are ready to commit and push this implementation batch to GitHub:

> [!CAUTION]
> Never run `git reset --hard` or `git clean -fd`. Never overwrite or discard existing local modifications.

```powershell
# 1. Verify working tree status
cd C:\Projectpulse
git status

# 2. Stage the newly implemented features in logical groups
# Group A: Documentation and config template
git add README.md .env.example docs/

# Group B: Kafka infrastructure
git add docker-compose.kafka.yml

# Group C: Backend services (Domain, Notification, Auth, Gateway)
git add backend/

# Group D: Frontend services and pages
git add frontend/

# 3. Commit with a descriptive conventional commit message
git commit -m "feat: complete end-to-end task management, persistent notifications, analytics, and RAG intelligence"

# 4. Pull latest remote changes with rebase before pushing
git pull --rebase origin dev

# 5. Push to origin dev
git push origin dev
```

---

## C. Prerequisites and Environment Setup

### 1. Tooling Requirements
- **Java**: JDK 24 (Verified: Oracle JDK 24.0.2 installed).
- **Node.js**: Node v18+ or v20+ with npm v9+.
- **Docker**: Docker Desktop (for Kafka KRaft broker container).
- **Git**: Git for Windows.

### 2. Environment Configuration
Copy `.env.example` to create your local `.env` file (or set these in your IDE run configuration). Note that `.env` is git-ignored and must never contain real credentials in version control.

```properties
# ==============================================================================
# MongoDB Persistence (Atlas or Local)
# ==============================================================================
AUTH_DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/auth_db?retryWrites=true&w=majority
DOMAIN_DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/domain_db?retryWrites=true&w=majority
NOTIFICATION_DB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notification_db?retryWrites=true&w=majority

# ==============================================================================
# Security & JWT Authentication (Minimum 32 bytes)
# ==============================================================================
JWT_SECRET=your-minimum-32-byte-secure-jwt-secret-key-goes-here!
JWT_EXPIRATION_SECONDS=3600

# ==============================================================================
# Apache Kafka Broker
# ==============================================================================
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_ENABLED=true
KAFKA_AUTO_STARTUP=true

# ==============================================================================
# Frontend Service Endpoints (Vite)
# ==============================================================================
VITE_AUTH_SERVICE_URL=http://localhost:8082
VITE_DOMAIN_SERVICE_URL=http://localhost:8083
VITE_NOTIFICATION_SERVICE_URL=http://localhost:8085

# ==============================================================================
# AI Provider Configuration (Optional)
# ==============================================================================
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-google-gemini-api-key-here
```

### 3. MongoDB Atlas Access & Network Rules
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com).
2. Ensure Network Access has your current IP address whitelisted (`Security` → `Network Access` → `Add IP Address`).
3. Ensure Database User has `readWriteAnyDatabase` privileges.
4. If testing offline, the backend services will use local fallback memory/mock modes gracefully.

### 4. Kafka KRaft Startup
Start the Apache Kafka KRaft container (no Zookeeper required):

```powershell
cd C:\Projectpulse
docker compose -f docker-compose.kafka.yml up -d
```
Verify Kafka is listening:
```powershell
docker ps --filter "name=projectpulse-kafka"
```

---

## D. Exact Startup Order

To run ProjectPulse concurrently in development, open **4 PowerShell terminals** in the following order:

### Terminal 1: Infrastructure (Kafka)
```powershell
# Working Directory: C:\Projectpulse
docker compose -f docker-compose.kafka.yml up -d
```
*Confirmation*: Running `docker ps` shows `projectpulse-kafka` with port `0.0.0.0:9092->9092/tcp`.

### Terminal 2: Auth Service (Port 8082)
```powershell
# Working Directory: C:\Projectpulse\backend
.\mvnw.cmd spring-boot:run -pl auth-service
```
*Confirmation*: Terminal prints `Tomcat started on port 8082 (http)` and `Started AuthServiceApplication`.

### Terminal 3: Domain Service (Port 8083)
```powershell
# Working Directory: C:\Projectpulse\backend
.\mvnw.cmd spring-boot:run -pl domain-service
```
*Confirmation*: Terminal prints `Tomcat started on port 8083 (http)`, `Initialized default flagship project 'ProjectPulse'`, and `Seeded 6 flagship tasks successfully`.

### Terminal 4: Notification Service (Port 8085)
```powershell
# Working Directory: C:\Projectpulse\backend
.\mvnw.cmd spring-boot:run -pl notification-service
```
*Confirmation*: Terminal prints `Tomcat started on port 8085 (http)` and Kafka consumer group `notification-service-group` partitions assigned.

### Terminal 5: Frontend Development Server (Port 5173)
```powershell
# Working Directory: C:\Projectpulse\frontend
npm run dev
```
*Confirmation*: Terminal prints `VITE v8.3.3 ready in ... ms` and displays `➜ Local: http://localhost:5173/`.

---

## E. Feature Verification Runbook

### 1. Authentication & JWT Validation
- **Exercise**: Open `http://localhost:5173/register` and create an account (e.g., `teammate@projectpulse.io` / `Password123!`).
- **Endpoint**: `POST http://localhost:8082/api/auth/register`
- **Expected Payload**: `{"email":"teammate@projectpulse.io","name":"Teammate","password":"Password123!","role":"DEVELOPER"}`
- **Response**: `201 Created` with `UserResponse` (`id`, `name`, `email`, `role`).
- **Persistence Verification**: Auth database `auth_db.users` contains the document with hashed `password` field.

### 2. Task Management CRUD & Automatic Stats Sync
- **Exercise**:
  1. Navigate to `http://localhost:5173/tasks`.
  2. Click **Create Task**, fill in Title, Project, Assignee, Priority, Due Date. Click **Save**.
- **Endpoint**: `POST http://localhost:8083/api/tasks`
- **Expected Response**: `201 Created` with generated task ID (e.g., `task-e7b39a1c`).
- **Project Sync Verification**: Parent project in `domain_db.projects` updates its `tasksCount`, `progress`, and `recentTasks` immediately.
- **Kafka Event Verification**: `domain-service` console logs `[TaskEventProducer] Delivered TaskEvent for taskId='...' to topic='task-events'`.
- **Notification Verification**: `notification-service` console logs `[NotificationService] Persisted notification to notification_db: type='TASK_CREATED'`. The bell icon on the top header increments its badge.

### 3. Dependency Cycle Prevention
- **Exercise**:
  1. In `Tasks`, create Task A.
  2. Create Task B and set its dependency to Task A.
  3. Attempt to update Task A so it depends on Task B (creating `A -> B -> A`).
- **API Call**: `PUT http://localhost:8083/api/tasks/{taskA_id}` with `{"dependencies":["{taskB_id}"]}`
- **Expected Response**: `400 Bad Request` with message:  
  `"Circular dependency cycle detected: Task 'taskA' would create an invalid dependency cycle through task 'taskB'"`
- **UI Behavior**: Red banner displays the error without corrupting the task state.

### 4. Real Analytics Aggregation
- **Exercise**: Navigate to `http://localhost:5173/dashboard` and `http://localhost:5173/analytics`.
- **Endpoint**: `GET http://localhost:8083/api/analytics/dashboard`
- **Expected Response**: `200 OK` with JSON:
  ```json
  {
    "totalProjects": 1,
    "activeProjects": 1,
    "totalTasks": 7,
    "completedTasks": 2,
    "overdueTasks": 1,
    "completionRate": 28.6,
    "statusBreakdown": {"TODO": 2, "IN_PROGRESS": 2, "COMPLETED": 2, "BLOCKED": 1},
    "workloadDistribution": [...]
  }
  ```
- **Verification**: Values match the real count of tasks in `domain_db`.

### 5. Grounded RAG AI Assistant
- **Exercise**: Navigate to `http://localhost:5173/ai-assistant`. Ask:  
  *"What are the biggest project risks right now?"*
- **Endpoint**: `POST http://localhost:8083/api/ai/query` with `{"query":"What are the biggest project risks right now?"}`
- **Expected Response**: Structured markdown report listing specific overdue tasks, blocked dependencies, and citations linking directly to the real task and project documents.

---

## F. Remaining Work Plan

### Task 1: Deploy MongoDB Atlas Vector Search Index [Priority: P1]
- **Goal**: Enable vector embedding similarity search (`$vectorSearch`) on project deliverables.
- **Acceptance Criteria**: Creating a project or task computes an embedding and stores it in the `embedding` array field; vector index queries return semantically related items.
- **Affected Services**: `domain-service`, `ai-assistant-service`.
- **Definition of Done**: Atlas Search Index `vector_index` active on `domain_db.tasks`.

### Task 2: Real-Time WebSocket / STOMP Push Notifications [Priority: P2]
- **Goal**: Deliver notifications to the frontend header bell instantly without 15s polling.
- **Acceptance Criteria**: When a Kafka consumer writes a notification, it broadcasts over a WebSocket topic `/topic/notifications/{userId}`; the bell badge updates within 200ms.
- **Affected Services**: `notification-service`, `frontend/src/components/layout/AppLayout.tsx`.
- **Definition of Done**: Unit and integration test verifying WebSocket message dispatch.

### Task 3: Interactive Workflow Gantt / DAG Timeline [Priority: P2]
- **Goal**: Visual graph representation of task dependency chains.
- **Acceptance Criteria**: Users can see prerequisite arrows connecting tasks on `Workflow.tsx`; dragging a dependency links tasks and triggers cycle validation.
- **Affected Services**: `frontend/src/pages/Workflow/Workflow.tsx`.
- **Definition of Done**: Renders dependencies visually with zero layout overflows.

### Task 4: Automated Status Advancement [Priority: P1]
- **Goal**: Automatically unblock tasks when prerequisites finish.
- **Acceptance Criteria**: When task X is marked `COMPLETED`, any task Y that was `BLOCKED` solely by X transitions to `TODO` and notifies its assignee.
- **Affected Services**: `domain-service/src/main/java/com/projectpulse/domainservice/service/TaskService.java`.
- **Definition of Done**: `TaskServiceTest` verifying auto-transition logic.

---

## G. Troubleshooting Guide

### 1. Port Conflict (`BindException: Address already in use`)
If port 8082, 8083, or 8085 is in use:
```powershell
# Find process using the port
netstat -ano | findstr :8083
# Terminate the lingering process safely
Stop-Process -Id <PID> -Force
```

### 2. Docker / Kafka Connection Refused
If `Connection to node -1 (localhost/127.0.0.1:9092) could not be established`:
- Check Docker Desktop is running.
- Run `docker compose -f docker-compose.kafka.yml restart`.
- Note: Both `domain-service` and `notification-service` are configured with graceful error handling so they continue operating even if Kafka is temporarily offline.

### 3. MongoDB Atlas IP Whitelist (`MongoTimeoutException`)
If connection times out:
- Check your external IP via `curl ifconfig.me`.
- Ensure this IP is added to the MongoDB Atlas Network Access whitelist.

### 4. CORS Errors on Frontend
All controllers (`AuthController`, `ProjectController`, `TaskController`, `AnalyticsController`, `AiController`, `NotificationController`) have `@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})` configured. If changing the frontend port, update the `origins` parameter.

### 5. AI API Key Configuration
If external LLM features are desired, set `OPENAI_API_KEY` or `GEMINI_API_KEY` in your environment. If unset, ProjectPulse automatically uses its built-in deterministic RAG intelligence engine without error.

---

## H. Handover Checklist

Please use this checklist to verify the environment upon takeover:

- [ ] Repository cloned and `git status` shows branch `dev`.
- [ ] JDK 24 (`java -version`) and Node v18+ (`node -v`) confirmed.
- [ ] `.env` created from `.env.example` with valid MongoDB connection strings.
- [ ] Kafka broker started via `docker compose -f docker-compose.kafka.yml up -d`.
- [ ] Auth Service compiles and runs on port `8082`.
- [ ] Domain Service compiles and runs on port `8083`.
- [ ] Notification Service compiles and runs on port `8085`.
- [ ] Frontend compiles (`npm run build`) and starts (`npm run dev`) on port `5173`.
- [ ] User registration and login flow works and issues JWT.
- [ ] Task creation persists to MongoDB and updates project counters.
- [ ] Cyclical task dependency is rejected with a clear 400 error.
- [ ] Notification bell badge updates upon creating/assigning tasks.
- [ ] Dashboard displays real computed analytics from database tasks.
- [ ] AI Assistant answers questions with grounded citations.
- [ ] Backend tests pass via `.\mvnw.cmd test -DfailIfNoTests=false -pl auth-service,domain-service,notification-service`.
