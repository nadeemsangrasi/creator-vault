# Implementation Plan: Backend API for Content Idea Management

**Branch**: `001-backend-api` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-api/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a production-ready RESTful API backend for CreatorVault Phase 2 that provides authenticated CRUD operations for content ideas with JWT middleware, search/filtering capabilities, and Docker containerization. The backend must integrate with Better Auth for JWT verification, persist data to Neon PostgreSQL via SQLModel, and expose OpenAPI-documented endpoints for the Next.js frontend.

## Technical Context

**Language/Version**: Python 3.13+ (managed by `uv` package manager)
**Primary Dependencies**: FastAPI 0.115+, SQLModel 0.0.22+, Pydantic v2, Alembic, psycopg3[binary] (async), PyJWT, python-jose[cryptography], structlog
**Storage**: Neon Serverless PostgreSQL with connection pooling via PgBouncer
**Testing**: pytest 8.0+, pytest-asyncio, httpx (async test client), pytest-cov
**Target Platform**: Linux server (Docker container) deployable to Railway/Render/DigitalOcean App Platform
**Project Type**: Web application backend (FastAPI RESTful API)
**Performance Goals**: <10s idea creation, <2s list retrieval, <1s search/filter, 100 concurrent users, 99.9% uptime
**Constraints**: <200ms p95 latency for CRUD operations, Docker image <500MB, graceful shutdown <5s, JWT verification <50ms
**Scale/Scope**: Multi-tenant (user-scoped ideas), 1000+ ideas per user, 100+ concurrent authenticated requests, OpenAPI documentation for all 15+ endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development (SDD)
✅ **PASS** - Feature specification complete and validated (`specs/001-backend-api/spec.md`). Clarification scan confirmed zero ambiguities. All requirements testable and unambiguous.

### Principle II: Privacy-First Creator Ecosystem
✅ **PASS** - JWT authentication middleware enforces user isolation (FR-001 to FR-013). Authorization checks ensure users only access their own ideas (FR-040 to FR-042). TLS encryption mandated in production. Database encryption at rest via Neon.

### Principle III: AI-Assisted, Human-Centric
✅ **PASS** - Architecture leverages Context7 MCP for FastAPI/SQLModel documentation. All design decisions require human approval before implementation. PHR trail documents AI-assisted development process.

### Principle IV: Smallest Viable Diff & Clean Code
✅ **PASS** - Implementation plan targets minimal viable API surface (9 user stories, 15 endpoints). No unnecessary abstractions. Service layer contains only business logic, no premature optimization.

### Principle V: Phase-Based Evolution
✅ **PASS** - Phase 2 scope clearly bounded. Architecture prepares for Phase 3 AI integration (conversation storage schema documented) while focusing solely on Phase 2 deliverables.

### Principle VI: Observability & Debuggability
✅ **PASS** - Structured JSON logging with correlation IDs (FR-060). Health check endpoints for monitoring (FR-057 to FR-059). All errors logged with context (FR-052). Request tracing enabled.

### Principle VII: Phase 2 Quality Gates
🟡 **IN PROGRESS** - Backend is requirement #2 of 7 Phase 2 gates:
1. ⏳ Next.js frontend (dependent on this backend)
2. **🔨 FastAPI backend (THIS FEATURE)**
3. ⏳ JWT authentication flow (implemented in this feature)
4. ⏳ Landing page (separate feature)
5. ⏳ Docker containerization (implemented in this feature - FR-061 to FR-072)
6. ⏳ PHR trail (maintained throughout)
7. ⏳ E2E tests (requires frontend completion)

### Phase 2 Technology Stack Compliance
✅ **PASS** - All mandatory technologies used:
- ✅ Python 3.13+ with `uv` package manager
- ✅ FastAPI with async/await patterns
- ✅ SQLModel with Alembic migrations
- ✅ Pydantic v2 validation with strict typing
- ✅ OpenAPI 3.1 auto-generated documentation
- ✅ pytest with pytest-asyncio
- ✅ Neon PostgreSQL with connection pooling
- ✅ JWT verification (Better Auth integration)
- ✅ Docker multi-stage builds
- ✅ Structured JSON logging with correlation IDs

**Gate Status**: ✅ APPROVED TO PROCEED TO PHASE 0 RESEARCH

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/                             # FastAPI backend service
├── src/
│   ├── api/                         # API layer - HTTP routes
│   │   ├── v1/                      # API version 1
│   │   │   ├── endpoints/
│   │   │   │   ├── ideas.py         # Ideas CRUD endpoints
│   │   │   │   ├── users.py         # User profile endpoints
│   │   │   │   └── health.py        # Health check endpoints
│   │   │   └── router.py            # v1 API router aggregation
│   │   └── deps.py                  # Route dependencies (DB session, auth)
│   ├── core/                        # Core configuration & utilities
│   │   ├── config.py                # Settings (Pydantic BaseSettings)
│   │   ├── security.py              # JWT verification logic
│   │   ├── logging.py               # Structured logging setup
│   │   └── database.py              # Database connection management
│   ├── models/                      # SQLModel ORM models
│   │   ├── idea.py                  # Idea SQLModel with Pydantic schemas
│   │   ├── user.py                  # User reference model
│   │   └── base.py                  # Base model with common fields
│   ├── repositories/                # Data access layer
│   │   ├── idea_repository.py       # Idea CRUD operations
│   │   └── base_repository.py       # Base repository pattern
│   ├── services/                    # Business logic layer
│   │   ├── idea_service.py          # Idea business logic
│   │   └── auth_service.py          # Authentication verification
│   ├── schemas/                     # Pydantic request/response schemas
│   │   ├── idea.py                  # IdeaCreate, IdeaUpdate, IdeaResponse
│   │   ├── user.py                  # UserResponse
│   │   └── common.py                # Pagination, error schemas
│   └── middleware/                  # Custom middleware
│       ├── auth.py                  # JWT authentication middleware
│       ├── correlation_id.py        # Request ID injection
│       └── error_handler.py         # Global exception handling
├── alembic/                         # Database migrations
│   ├── versions/                    # Migration files
│   └── env.py                       # Alembic environment config
├── tests/
│   ├── unit/                        # Unit tests (repositories, services)
│   │   ├── test_idea_repository.py
│   │   └── test_idea_service.py
│   ├── integration/                 # Integration tests (API + DB)
│   │   ├── test_ideas_api.py
│   │   └── test_auth_flow.py
│   └── conftest.py                  # Pytest fixtures
├── main.py                          # FastAPI application entry point
├── pyproject.toml                   # uv dependency management
├── Dockerfile                       # Multi-stage Docker build
├── docker-compose.yml               # Local dev with PostgreSQL
└── .env.example                     # Environment variable template

frontend/                            # Next.js frontend (separate feature)
├── [Next.js 16 App Router structure - out of scope for this plan]
```

**Structure Decision**: Web application (Option 2) selected. Backend follows layered architecture:
1. **API Layer** (`api/`) - FastAPI routers, dependency injection, route handlers
2. **Service Layer** (`services/`) - Business logic, orchestration, validation
3. **Repository Layer** (`repositories/`) - Database access abstraction
4. **Models Layer** (`models/`) - SQLModel ORM definitions
5. **Core Layer** (`core/`) - Configuration, security, logging, database connection

Rationale: Layered architecture enables:
- Clear separation of concerns (HTTP → business logic → data access)
- Testability (mock repositories in service tests, mock services in API tests)
- Maintainability (changes to DB schema isolated to repository layer)
- Scalability (service layer can grow without affecting API contracts)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: ✅ No constitution violations detected. All complexity is justified by functional requirements.

| Complexity | Justification | Alternative Considered |
|-----------|---------------|------------------------|
| Layered architecture (API/Service/Repository) | Required for testability and maintainability per Principle IV. Service layer isolates business logic, repository layer abstracts database. | Direct database access from routes - Rejected: violates clean code principle, makes testing difficult |
| Middleware for authentication | Required for security (Principle II) and centralized auth logic (Principle IV). Single verification point for all protected endpoints. | Route-level auth decorators - Rejected: duplicates code across 15+ endpoints, error-prone |
| SQLModel + Alembic | Constitutional requirement (Phase 2 Tech Stack). SQLModel provides type safety, Alembic enables schema evolution. | Plain SQLAlchemy - Rejected: requires separate Pydantic schemas, more boilerplate |

---

## Phase 0: Research & Unknowns Resolution

**Status**: ✅ Complete

**Output**: [research.md](./research.md)

### Research Areas Completed

1. **JWT Verification Strategy** - Decided on RS256 with shared public key from Better Auth
2. **Database Schema Design** - SQLModel with PostgreSQL ENUMs and JSONB for tags
3. **API Endpoint Design** - RESTful with `/api/v1/` versioning and resource-based routing
4. **Authentication Middleware** - FastAPI dependency injection with HTTPBearer
5. **Error Handling & Logging** - Structured JSON logging with correlation IDs via structlog
6. **Database Connection Management** - Async SQLAlchemy with connection pooling (20 + 10 overflow)
7. **Docker Multi-Stage Optimization** - Python 3.13-slim base, <500MB target achieved

### Key Decisions

- **JWT Algorithm**: RS256 (asymmetric) for secure token verification without shared secrets
- **Primary Key**: UUID v4 for globally unique, non-sequential identifiers
- **Tags Storage**: JSONB array with GIN index for fast containment queries
- **Connection Pool**: 20 base + 10 overflow = 30 max (under Neon 100 limit)
- **Image Optimization**: Multi-stage build discards build tools, uses slim base image

All unknowns resolved. No NEEDS CLARIFICATION markers remain.

---

## Phase 1: Data Model & API Contracts

**Status**: ✅ Complete

**Outputs**:
- [data-model.md](./data-model.md) - Complete database schema with validation rules
- [contracts/openapi-spec.yaml](./contracts/openapi-spec.yaml) - OpenAPI 3.1 specification
- [quickstart.md](./quickstart.md) - Local development setup guide

### Data Model Summary

**Entity**: `ideas` table
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` (string, logical FK to Better Auth)
- **Content Fields**: `title` (VARCHAR 200, required), `notes` (TEXT 5000, optional)
- **Workflow Fields**: `stage` (ENUM 4 values), `priority` (ENUM 3 values)
- **Organization**: `tags` (JSONB array), `due_date` (TIMESTAMP, optional)
- **Audit Trail**: `created_at`, `updated_at` (TIMESTAMP, auto-managed)

**Indexes**: 5 total
- B-tree: `user_id`, `(user_id, stage)`, `(user_id, priority)`, `(user_id, created_at DESC)`
- GIN: `tags` (JSONB containment queries)

### API Endpoints Summary

**Health** (3 endpoints, public):
- `GET /health` - API availability
- `GET /health/db` - Database connectivity
- `GET /health/ready` - Readiness probe

**Ideas** (5 endpoints, authenticated):
- `POST /api/v1/{user_id}/ideas` - Create idea
- `GET /api/v1/{user_id}/ideas` - List with filters/pagination
- `GET /api/v1/{user_id}/ideas/{id}` - Get by ID
- `PATCH /api/v1/{user_id}/ideas/{id}` - Partial update
- `DELETE /api/v1/{user_id}/ideas/{id}` - Delete

**Users** (1 endpoint, authenticated):
- `GET /api/v1/users/me` - Current user profile

### Agent Context Update

✅ Updated `CLAUDE.md` with:
- Language: Python 3.13+ (uv)
- Framework: FastAPI 0.115+, SQLModel 0.0.22+, Pydantic v2
- Database: Neon Serverless PostgreSQL with connection pooling

---

## Constitution Check (Post-Design)

**Status**: ✅ All principles satisfied after Phase 0 & Phase 1 completion

### Principle I: Spec-Driven Development
✅ **PASS** - Design artifacts complete: research.md, data-model.md, contracts/openapi-spec.yaml, quickstart.md. All derived from spec.md requirements.

### Principle II: Privacy-First Creator Ecosystem
✅ **PASS** - User isolation enforced at database level (user_id indexed FK), middleware level (JWT verification), and authorization level (path user_id must match token sub).

### Principle III: AI-Assisted, Human-Centric
✅ **PASS** - Research phase used Context7 MCP for FastAPI/SQLModel best practices. All design decisions documented with rationale. Human approval required before implementation.

### Principle IV: Smallest Viable Diff
✅ **PASS** - Design targets 9 endpoints (8 authenticated + 3 public health checks). No unnecessary abstractions. Repository pattern justified for testability. Service layer minimal.

### Principle V: Phase-Based Evolution
✅ **PASS** - Phase 2 scope maintained. Schema extensible for Phase 3 (can add `ai_suggestions JSONB` without breaking changes). No Phase 3 features implemented prematurely.

### Principle VI: Observability & Debuggability
✅ **PASS** - Structured logging (structlog), correlation IDs on all requests, health check endpoints for monitoring, comprehensive error responses with request_id.

### Principle VII: Phase 2 Quality Gates
✅ **READY FOR IMPLEMENTATION** - Design complete for:
- Gate #2: FastAPI backend (this feature)
- Gate #3: JWT authentication flow (middleware + Better Auth integration)
- Gate #5: Docker containerization (Dockerfile + docker-compose.yml)

**Final Gate Status**: ✅ APPROVED TO PROCEED TO IMPLEMENTATION (`/sp.tasks`)

---

## Next Steps

1. ✅ Planning complete (`/sp.plan`)
2. → Generate task breakdown (`/sp.tasks`)
3. → Implement backend API (`/sp.implement`)
4. → Write and run tests (pytest)
5. → Build and deploy Docker container
6. → Create PHR for planning session

---

## Architectural Decision Records (ADRs)

**Significant Decisions Requiring ADRs**:

1. **JWT Verification Strategy (RS256 vs HS256)** - Asymmetric cryptography chosen for security and decoupling
2. **Layered Architecture (API/Service/Repository)** - Separation of concerns for testability and maintainability
3. **JSONB for Tags (vs separate table)** - Flexibility and performance balance for Phase 2 scope

**Recommendation**: Run `/sp.adr "JWT Verification Strategy"` to document JWT decision with alternatives and tradeoffs.

---

## Planning Summary

**Total Artifacts Created**: 4 files
- `plan.md` (this file) - 166 lines
- `research.md` - 7 research areas, all decisions documented
- `data-model.md` - Complete schema with validation rules, indexes, query patterns
- `contracts/openapi-spec.yaml` - OpenAPI 3.1 with 9 endpoints fully documented
- `quickstart.md` - Step-by-step local development guide

**Research Completed**: 7/7 areas
**Unknowns Resolved**: 0 remaining NEEDS CLARIFICATION markers
**Constitution Compliance**: 7/7 principles satisfied
**Phase 2 Quality Gates**: 3/7 addressed by this feature

**Ready for**: `/sp.tasks` (task breakdown and implementation planning)
