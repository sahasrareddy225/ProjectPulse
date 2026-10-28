# ProjectPulse

ProjectPulse is an enterprise project tracking and team collaboration platform built on a Spring Boot microservices architecture with Apache Kafka event streaming, MongoDB Atlas persistence, and a React + TypeScript frontend.

---

## Architecture & Service Ports

| Service / Component | Port | Technology | Purpose |
| :--- | :--- | :--- | :--- |
| **Discovery Server** | `8761` | Spring Cloud Netflix Eureka | Microservice registry and discovery |
| **Config Server** | `8888` | Spring Cloud Config Server | Centralized configuration management |
| **API Gateway** | `8081` | Spring Cloud Gateway | Client routing and edge proxy |
| **Auth Service** | `8082` | Spring Boot, MongoDB (`auth_db`) | User registration, login, role management, and HS256 JWT issuance |
| **Domain Service** | `8083` | Spring Boot, MongoDB (`domain_db`), Kafka | Project CRUD, task tracking, and `project.created` event publishing |
| **Notification Service** | `8085` | Spring Boot, MongoDB (`notification_db`), Kafka | Consumes `project.created` events and manages user notification feeds |
| **Kafka Broker** | `9092` | Apache Kafka 3.8.0 (KRaft mode) | Distributed event bus |
| **Frontend UI** | `5173` | React 19, TypeScript, Vite, Tailwind CSS | Single-page application interface |

---

## Prerequisites

Before starting the platform, ensure the following tools are installed:

* **Java JDK**: Version 17 or 21
* **Node.js**: Version 20+ (with npm)
* **Docker & Docker Compose**: For running the Apache Kafka broker container
* **MongoDB**: A free MongoDB Atlas cluster connection string or a local MongoDB 6+ instance

---

## Environment Configuration

A configuration template is provided in [.env.example](.env.example). Create your local configuration or export variables in your shell / IDE:

```bash
# Required for Auth Service startup
export AUTH_DB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/auth_db?retryWrites=true&w=majority"

# Optional: defaults to AUTH_DB_URI if unset
export DOMAIN_DB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/domain_db?retryWrites=true&w=majority"
export NOTIFICATION_DB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notification_db?retryWrites=true&w=majority"

# Security: minimum 32-byte signing secret for HS256 JWT
export JWT_SECRET="your-minimum-32-byte-secure-jwt-secret-key-goes-here!"

# Kafka Broker (defaults to localhost:9092)
export KAFKA_BOOTSTRAP_SERVERS="localhost:9092"
```

> **Security Note**: Never commit `.env` or real connection strings to version control. The repository `.gitignore` automatically excludes all `.env` files.

---

## Step-by-Step Local Setup

### 1. Start the Kafka Message Broker

Start the KRaft-mode Apache Kafka container (no ZooKeeper required):

```bash
docker compose -f docker-compose.kafka.yml up -d
```

Verify that Kafka is running and listening on port `9092`:

```bash
docker compose -f docker-compose.kafka.yml ps
```

### 2. Start Backend Microservices

Start the services in the following order using Maven Wrapper:

```bash
# 1. Discovery Server (Port 8761)
cd backend
.\mvnw.cmd spring-boot:run -pl discovery-server

# 2. Config Server (Port 8888)
.\mvnw.cmd spring-boot:run -pl config-server

# 3. Auth Service (Port 8082)
.\mvnw.cmd spring-boot:run -pl auth-service

# 4. Domain Service (Port 8083)
.\mvnw.cmd spring-boot:run -pl domain-service

# 5. Notification Service (Port 8085)
.\mvnw.cmd spring-boot:run -pl notification-service

# 6. API Gateway (Port 8081)
.\mvnw.cmd spring-boot:run -pl api-gateway
```

*(On Linux / macOS, replace `.\mvnw.cmd` with `./mvnw`)*

### 3. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be accessible at `http://localhost:5173`.

---

## Running Tests

### Backend Unit Tests

Run the full offline test suite across all microservice modules (does not require an active MongoDB connection):

```bash
cd backend
.\mvnw.cmd test
```

To run tests for an individual microservice:

```bash
cd backend
.\mvnw.cmd test -pl domain-service
.\mvnw.cmd test -pl notification-service
.\mvnw.cmd test -pl auth-service
```

### Live MongoDB Atlas Integration Test

The live connection ping test is opt-in and tagged with `@Tag("integration")`. To execute against your live MongoDB Atlas cluster:

```bash
cd backend
.\mvnw.cmd test -pl auth-service -Dtest=MongoAtlasConnectionTest -DrunAtlasTest=true
```

*(Ensure `AUTH_DB_URI` is set in your environment and your IP address is whitelisted in MongoDB Atlas Network Access).*

### Frontend Lint and Build Verification

```bash
cd frontend
npm run lint    # Runs Oxlint checks
npm run build   # Validates TypeScript compilation and builds production bundle
```

---

## Git Workflow & Handoff Guidelines

* The primary development branch is `dev`.
* All feature branches must branch off and merge into `dev`.
* Verify that tests pass (`.\mvnw.cmd test` and `npm run build`) before pushing commits.
* Avoid force pushes (`git push --force`) on shared branches.
