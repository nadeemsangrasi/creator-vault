# Tasks: Backend API for Content Idea Management

**Input**: Design documents from `/specs/001-backend-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi-spec.yaml

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application backend using the structure defined in plan.md:
- **Backend**: `backend/src/`, `backend/tests/`
- All paths below follow this convention

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure per plan.md (backend/src/{api,core,models,repositories,services,schemas,middleware}, backend/alembic/, backend/tests/{unit,integration}/)
- [X] T002 Initialize Python project with uv in backend/ directory (uv init, create pyproject.toml with FastAPI 0.115+, SQLModel 0.0.22+, Pydantic v2 dependencies)
- [X] T003 [P] Create .env.example file in backend/ with required environment variables (DATABASE_URL, JWT_PUBLIC_KEY, JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER, ALLOWED_ORIGINS, LOG_LEVEL)
- [X] T004 [P] Create docker-compose.yml in backend/ for local PostgreSQL development database
- [X] T005 [P] Create .gitignore for backend/ (exclude .env, __pycache__/, .venv/, .pytest_cache/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create base SQLModel in backend/src/models/base.py with common fields (id: UUID, created_at, updated_at)
- [X] T007 Create Pydantic settings configuration in backend/src/core/config.py (BaseSettings with DATABASE_URL, JWT config, CORS, logging)
- [X] T008 [P] Setup structured logging in backend/src/core/logging.py (structlog configuration with JSON formatting, correlation IDs)
- [X] T009 Create async database connection manager in backend/src/core/database.py (async engine with connection pooling: pool_size=20, max_overflow=10)
- [X] T010 Create JWT verification utilities in backend/src/core/security.py (RS256 token decode, user_id extraction from "sub" claim)
- [X] T011 Create correlation ID middleware in backend/src/middleware/correlation_id.py (generate UUID for each request, inject into request.state)
- [X] T012 Create global error handler middleware in backend/src/middleware/error_handler.py (catch all exceptions, return structured ErrorResponse with correlation ID)
- [X] T013 Create Pydantic error response schemas in backend/src/schemas/common.py (ErrorResponse, PaginationMetadata)
- [X] T014 Initialize Alembic for migrations in backend/alembic/ (alembic init, configure env.py with async engine, SQLModel metadata)
- [X] T015 Create pytest configuration in backend/tests/conftest.py (async test fixtures, database session, test client)
- [X] T016 Create FastAPI application entry point in backend/main.py (FastAPI app with CORS, middleware registration, lifespan events)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - JWT Authentication Middleware (Priority: P1) 🎯 MVP FOUNDATION

**Goal**: Verify JWT tokens from Better Auth before allowing access to protected endpoints, extracting user identity and ensuring secure request authorization

**Independent Test**: Send requests with valid JWT (system allows), invalid tokens (401), expired tokens (401), no token (401), public endpoints work without auth

### Implementation for User Story 1

- [X] T017 [P] [US1] Create authentication dependency in backend/src/api/deps.py (get_current_user function using HTTPBearer, decode JWT with RS256, extract user_id from "sub")
- [X] T018 [P] [US1] Create health check router in backend/src/api/v1/endpoints/health.py (GET /health, GET /health/db, GET /health/ready - all public, no auth required)
- [X] T019 [US1] Register health endpoints in backend/main.py (include health router before v1 API router, mark as public)
- [X] T020 [US1] Create v1 API router aggregator in backend/src/api/v1/router.py (aggregate all v1 endpoints under /api/v1 prefix)
- [X] T021 [US1] Update main.py to register v1 router with authentication dependency (include v1 router, apply get_current_user to protected routes)

**Checkpoint**: JWT authentication middleware is operational. Health endpoints work without auth. Protected endpoints require valid JWT tokens.

---

## Phase 4: User Story 2 - Create and Retrieve Content Ideas (Priority: P1) 🎯 MVP CORE

**Goal**: Allow authenticated users to capture new content ideas and view them later for planning purposes

**Independent Test**: Create idea via API with title and notes, then retrieve it by ID. List all ideas for authenticated user.

### Implementation for User Story 2

- [X] T022 [P] [US2] Create Idea SQLModel in backend/src/models/idea.py (UUID id, user_id string, title VARCHAR(200), notes TEXT(5000), stage enum default "idea", priority enum default "medium", tags JSONB array, due_date timestamp nullable, created_at, updated_at)
- [X] T023 [P] [US2] Create Pydantic request/response schemas in backend/src/schemas/idea.py (IdeaCreate, IdeaUpdate, IdeaResponse with validation rules from data-model.md)
- [X] T024 [US2] Create Alembic migration for ideas table in backend/alembic/versions/001_create_ideas_table.py (create ideas table, stage/priority ENUMs, 5 indexes per data-model.md)
- [X] T025 [US2] Create base repository pattern in backend/src/repositories/base_repository.py (generic CRUD methods with async session)
- [X] T026 [US2] Create idea repository in backend/src/repositories/idea_repository.py (create, get_by_id, get_by_user, update, delete methods with user_id filtering)
- [X] T027 [US2] Create idea service in backend/src/services/idea_service.py (business logic layer: create_idea, get_idea, list_ideas with authorization checks)
- [X] T028 [US2] Create ideas router in backend/src/api/v1/endpoints/ideas.py (POST /api/v1/{user_id}/ideas, GET /api/v1/{user_id}/ideas/{id}, GET /api/v1/{user_id}/ideas with pagination)
- [X] T029 [US2] Register ideas router in backend/src/api/v1/router.py (include ideas router with authentication dependency)
- [X] T030 [US2] Add user_id path validation in ideas endpoints (verify path user_id matches authenticated user from JWT, return 403 if mismatch)

**Checkpoint**: Users can create ideas with title/notes, retrieve specific ideas by ID, and list all their ideas with pagination. Authorization ensures users only access their own ideas.

---

## Phase 5: User Story 3 - Update Content Idea Details and Stage (Priority: P1)

**Goal**: Allow creators to edit idea details as they evolve and track progress through content stages (idea → outline → draft → published)

**Independent Test**: Create idea, update title/notes, advance stage from "idea" to "outline", verify updated modification timestamp

### Implementation for User Story 3

- [X] T031 [US3] Add PATCH endpoint in backend/src/api/v1/endpoints/ideas.py (PATCH /api/v1/{user_id}/ideas/{id} for partial updates)
- [X] T032 [US3] Add PUT endpoint in backend/src/api/v1/endpoints/ideas.py (PUT /api/v1/{user_id}/ideas/{id} for full replacement)
- [X] T033 [US3] Implement update_idea method in backend/src/services/idea_service.py (validate stage enum, handle partial updates, update updated_at timestamp)
- [X] T034 [US3] Add stage validation in backend/src/schemas/idea.py (IdeaUpdate schema with stage enum validation, return 400 with valid values on invalid stage)
- [X] T035 [US3] Implement authorization check in update operations (verify idea belongs to authenticated user, return 403 if mismatch)

**Checkpoint**: Users can update idea title, notes, and stage. Stage enum validation rejects invalid values. Authorization prevents users from updating others' ideas.

---

## Phase 6: User Story 4 - Delete Unwanted Ideas (Priority: P1)

**Goal**: Allow creators to remove ideas that are no longer relevant or were captured by mistake

**Independent Test**: Create idea, delete it by ID, attempt to retrieve deleted idea (should return 404)

### Implementation for User Story 4

- [X] T036 [US4] Add DELETE endpoint in backend/src/api/v1/endpoints/ideas.py (DELETE /api/v1/{user_id}/ideas/{id} returns 204 on success)
- [X] T037 [US4] Implement delete_idea method in backend/src/services/idea_service.py (hard delete, no soft delete, verify ownership)
- [X] T038 [US4] Add delete method in backend/src/repositories/idea_repository.py (async delete with user_id filter for authorization)
- [X] T039 [US4] Handle 404 error when deleting non-existent idea (return structured error response with request_id)

**Checkpoint**: Users can permanently delete ideas. Deleted ideas return 404 on subsequent retrieval. Authorization prevents users from deleting others' ideas.

---

## Phase 7: User Story 5 - Organize Ideas with Tags and Priorities (Priority: P2)

**Goal**: Allow creators to categorize ideas by content type (blog, video, podcast) and importance (high, medium, low) for better organization

**Independent Test**: Create ideas with different tags and priorities, retrieve and verify tags/priorities are stored correctly

### Implementation for User Story 5

- [X] T040 [US5] Add priority validation in backend/src/schemas/idea.py (PriorityEnum validation, default "medium", reject invalid priorities with error listing valid values)
- [X] T041 [US5] Add tags validation in backend/src/schemas/idea.py (validate tags is array of strings, allow empty array)
- [X] T042 [US5] Update create_idea and update_idea in backend/src/services/idea_service.py (handle tags array, validate priority enum)
- [X] T043 [US5] Ensure tags JSONB and priority ENUM are properly indexed in migration (verify indexes from 001_create_ideas_table.py)

**Checkpoint**: Users can assign multiple tags and priority levels to ideas. Tags stored as JSONB array. Priority stored as ENUM with validation.

---

## Phase 8: User Story 6 - Search and Filter Ideas (Priority: P2)

**Goal**: Allow creators to find specific ideas using keyword search and filter by stage, tags, or priority

**Independent Test**: Create 10 ideas with varied attributes, filter by stage="draft", verify only draft-stage ideas return. Search by keyword in title.

### Implementation for User Story 6

- [X] T044 [P] [US6] Add search parameter to list endpoint in backend/src/api/v1/endpoints/ideas.py (query param "search" for keyword matching in title/notes, case-insensitive)
- [X] T045 [P] [US6] Add stage filter parameter to list endpoint (query param "stage" with enum validation)
- [X] T046 [P] [US6] Add priority filter parameter to list endpoint (query param "priority" with enum validation)
- [X] T047 [P] [US6] Add tags filter parameter to list endpoint (query param "tags" comma-separated, OR logic for multiple tags)
- [X] T048 [US6] Implement filter_ideas method in backend/src/repositories/idea_repository.py (build WHERE clause with user_id AND search ILIKE AND stage= AND priority= AND tags @> filters)
- [X] T049 [US6] Update list_ideas in backend/src/services/idea_service.py (pass filter parameters to repository, handle combined filters with AND logic)
- [X] T050 [US6] Add pagination metadata to list response (total count, limit, offset, has_more boolean)

**Checkpoint**: Users can search ideas by keywords, filter by stage/priority/tags, combine multiple filters. Pagination shows total count and has_more indicator.

---

## Phase 9: User Story 7 - Set Due Dates for Content Deadlines (Priority: P3)

**Goal**: Allow creators to assign due dates to ideas to track content publishing deadlines and upcoming commitments

**Independent Test**: Create idea with due_date one week from today, retrieve and verify due_date is stored correctly in ISO 8601 UTC format

### Implementation for User Story 7

- [X] T051 [US7] Add due_date validation in backend/src/schemas/idea.py (Optional[datetime], validate ISO 8601 format, allow null)
- [X] T052 [US7] Update create_idea and update_idea in backend/src/services/idea_service.py (handle due_date as optional timestamp, allow setting to null to clear)
- [X] T053 [US7] Ensure due_date field properly handles null values in backend/src/repositories/idea_repository.py (support setting due_date=None to clear)

**Checkpoint**: Users can set due dates on ideas, update due dates, and clear due dates (set to null). Dates stored in UTC as ISO 8601 timestamps.

---

## Phase 10: User Story 8 - Sort Ideas by Different Criteria (Priority: P3)

**Goal**: Allow creators to sort their ideas by creation date, priority, stage, or title to view them in different meaningful orders

**Independent Test**: Create 5 ideas with different priorities, request sorted by priority descending, verify order

### Implementation for User Story 8

- [X] T054 [P] [US8] Add sort parameter to list endpoint in backend/src/api/v1/endpoints/ideas.py (query param "sort" with enum: created_at, updated_at, title, priority, stage)
- [X] T055 [P] [US8] Add order parameter to list endpoint (query param "order" with enum: asc, desc, default desc)
- [X] T056 [US8] Implement sort logic in backend/src/repositories/idea_repository.py (dynamic ORDER BY clause based on sort field and order direction)
- [X] T057 [US8] Update list_ideas in backend/src/services/idea_service.py (pass sort and order parameters to repository)
- [X] T058 [US8] Add default sort behavior (default to created_at DESC when no sort specified)

**Checkpoint**: Users can sort ideas by creation date, priority, stage, or title in ascending/descending order. Default sort is newest first (created_at DESC).

---

## Phase 11: User Story 9 - Docker Containerization for Deployment (Priority: P1) 🎯 MVP DEPLOYMENT

**Goal**: Containerize the backend API using Docker with optimized multi-stage builds for consistent deployment across environments

**Independent Test**: Build Docker image, run container with environment variables, verify API responds to /health with 200 OK

### Implementation for User Story 9

- [X] T059 [P] [US9] Create multi-stage Dockerfile in backend/Dockerfile (Stage 1: builder with uv, Stage 2: runtime with python:3.13-slim, non-root user, <500MB target)
- [X] T060 [P] [US9] Add HEALTHCHECK directive to Dockerfile (interval 30s, timeout 3s, check /health endpoint)
- [X] T061 [P] [US9] Create .dockerignore in backend/ (exclude .env, .venv/, __pycache__/, .git/, tests/, *.md)
- [X] T062 [US9] Update docker-compose.yml to include API service (backend API + PostgreSQL database, environment variables, port mapping, depends_on)
- [X] T063 [US9] Add database migration to container startup in Dockerfile CMD (run "alembic upgrade head && uvicorn main:app")
- [X] T064 [US9] Add graceful shutdown handler in backend/main.py (handle SIGTERM, close database connections, complete in-flight requests)
- [X] T065 [US9] Add environment variable validation on startup in backend/src/core/config.py (fail fast with clear error if required vars missing: DATABASE_URL, JWT_PUBLIC_KEY)
- [X] T066 [US9] Test Docker build and verify image size <500MB (docker build -t creatorvault-backend ., docker images)

**Checkpoint**: Backend API is fully containerized. Docker image under 500MB. Container runs migrations on startup, responds to health checks, gracefully shuts down on SIGTERM.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T067 [P] Add OpenAPI documentation examples to all endpoints in backend/src/api/v1/endpoints/*.py (request/response examples per contracts/openapi-spec.yaml)
- [X] T068 [P] Add request/response logging in backend/src/middleware/correlation_id.py (log request method, path, status code, duration with correlation ID)
- [X] T069 [P] Add rate limiting headers to responses in backend/main.py (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- [X] T070 [P] Add security headers to responses in backend/main.py (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security)
- [X] T071 Verify quickstart.md instructions work end-to-end (follow specs/001-backend-api/quickstart.md from scratch, verify all commands succeed)
- [X] T072 Run Alembic migrations and verify database schema matches data-model.md (alembic upgrade head, inspect tables/indexes)
- [X] T073 Validate OpenAPI spec matches implementation (start server, access /docs, verify all endpoints documented)
- [X] T074 [P] Add user profile endpoint in backend/src/api/v1/endpoints/users.py (GET /api/v1/users/me returns authenticated user info)
- [X] T075 Performance optimization: verify connection pool configuration (check pool_size=20, max_overflow=10 in database.py)
- [X] T076 Security audit: verify JWT verification uses RS256 and validates issuer/audience (review core/security.py)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - US1 (JWT Auth) can start after Foundational - no dependencies on other stories
  - US2 (Create/Retrieve Ideas) depends on US1 (needs auth) - partially parallel
  - US3 (Update Ideas) depends on US2 (needs idea model) - sequential
  - US4 (Delete Ideas) depends on US2 (needs idea model) - sequential
  - US5 (Tags/Priorities) depends on US2 (enhances idea model) - sequential
  - US6 (Search/Filter) depends on US2, US5 (filters on tags/priorities) - sequential
  - US7 (Due Dates) depends on US2 (adds to idea model) - can be parallel with US3-US5
  - US8 (Sort) depends on US2 (sorts idea list) - can be parallel with US3-US7
  - US9 (Docker) depends on US1+US2 (needs working API) - can run anytime after US2
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

**Critical Path** (minimum MVP - must complete in order):
1. **Foundational (Phase 2)** → Blocking prerequisite for all stories
2. **US1 (JWT Auth)** → Required for all authenticated operations
3. **US2 (Create/Retrieve)** → Core functionality, blocks US3-US8
4. **US9 (Docker)** → Deployment capability

**Parallel Opportunities After US2**:
- US3 (Update), US4 (Delete), US5 (Tags/Priorities), US7 (Due Dates), US8 (Sort) can be developed in parallel
- US6 (Search/Filter) should come after US5 (needs tags/priorities to filter on)

**Dependency Graph**:
```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← CRITICAL BLOCKING PHASE
    ↓
US1: JWT Auth ← Required for all authenticated operations
    ↓
US2: Create/Retrieve Ideas ← Core model, blocks all subsequent stories
    ├→ US3: Update Ideas
    ├→ US4: Delete Ideas
    ├→ US5: Tags/Priorities → US6: Search/Filter
    ├→ US7: Due Dates
    └→ US8: Sort Ideas

US9: Docker ← Can run anytime after US2 complete
    ↓
Polish (Phase 12)
```

### Within Each User Story

- Models before services (services depend on models)
- Services before endpoints (endpoints depend on services)
- Repositories before services (services depend on repositories)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: T003, T004, T005 can run in parallel (different files)

**Phase 2 (Foundational)**: T008 (logging) can run in parallel with T006-T007 (independent infrastructure)

**Phase 3 (US1)**: T017, T018 can run in parallel (different files: deps.py, health.py)

**Phase 4 (US2)**: T022 (model), T023 (schemas) can run in parallel initially, but T024-T030 are sequential dependencies

**Phase 8 (US6)**: T044-T047 (adding query parameters) can run in parallel (same file but independent changes)

**Phase 10 (US8)**: T054-T055 (adding query parameters) can run in parallel (same file but independent changes)

**Phase 11 (US9)**: T059, T060, T061 can run in parallel (different files)

**Phase 12 (Polish)**: T067, T068, T069, T070, T074 can run in parallel (different files or non-conflicting changes)

---

## Parallel Example: After Foundational Phase

Once Phase 2 (Foundational) is complete, with sufficient team capacity:

```bash
# Developer A: US1 (JWT Auth)
Task Group: T017-T021 (authentication middleware and health endpoints)

# Developer B: Start US2 prep in parallel
Task Group: T022-T023 (create Idea model and schemas while US1 completes)

# After US2 core (T022-T030) completes:

# Developer A: US3 (Update)
Task Group: T031-T035

# Developer B: US4 (Delete)
Task Group: T036-T039

# Developer C: US5 (Tags/Priorities)
Task Group: T040-T043

# Developer D: US7 (Due Dates)
Task Group: T051-T053

# Developer E: US8 (Sort)
Task Group: T054-T058
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**Phase 1: Setup** (5 tasks: T001-T005)
- Create project structure, initialize dependencies, configure environment

**Phase 2: Foundational** (11 tasks: T006-T016) ⚠️ CRITICAL BLOCKING PHASE
- Setup base models, database connection, JWT verification, middleware, error handling
- **STOP**: Validate foundation is solid before proceeding

**Phase 3: US1 - JWT Auth** (5 tasks: T017-T021)
- Implement authentication middleware and health endpoints
- **STOP**: Test authentication with valid/invalid tokens

**Phase 4: US2 - Create/Retrieve** (9 tasks: T022-T030)
- Core CRUD functionality for ideas
- **STOP**: Test creating and retrieving ideas

**Phase 11: US9 - Docker** (8 tasks: T059-T066)
- Containerize application for deployment
- **STOP**: Validate Docker build and container startup

**MVP COMPLETE** → Deploy and validate with real JWT tokens from Better Auth

**Total MVP Tasks**: 38 tasks (Phases 1, 2, 3, 4, 11)

### Incremental Delivery

1. **Foundation** → Phases 1-2 complete → Database, auth framework ready
2. **MVP** → Add Phase 3 (US1), Phase 4 (US2), Phase 11 (US9) → Working authenticated CRUD API in Docker
3. **Enhancement 1** → Add Phase 5 (US3), Phase 6 (US4) → Update and delete operations
4. **Enhancement 2** → Add Phase 7 (US5), Phase 8 (US6) → Tags, priorities, search/filter
5. **Enhancement 3** → Add Phase 9 (US7), Phase 10 (US8) → Due dates, sorting
6. **Polish** → Phase 12 → Documentation, security headers, performance tuning

Each phase adds value without breaking previous phases.

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. **Week 1**: Everyone completes Setup + Foundational together (Phases 1-2)
2. **Week 2**:
   - Dev A: US1 (JWT Auth)
   - Dev B: US2 prep (models/schemas)
   - Dev C: US9 prep (Docker files)
3. **Week 3**:
   - Dev A: US3 (Update)
   - Dev B: US4 (Delete)
   - Dev C: US5 (Tags/Priorities)
4. **Week 4**:
   - Dev A: US6 (Search/Filter)
   - Dev B: US7 (Due Dates)
   - Dev C: US8 (Sort)
5. **Week 5**: Everyone on Polish (Phase 12)

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 11 tasks (⚠️ BLOCKS all user stories)
- **Phase 3 (US1 - JWT Auth)**: 5 tasks - P1 🎯 MVP Foundation
- **Phase 4 (US2 - Create/Retrieve)**: 9 tasks - P1 🎯 MVP Core
- **Phase 5 (US3 - Update)**: 5 tasks - P1
- **Phase 6 (US4 - Delete)**: 4 tasks - P1
- **Phase 7 (US5 - Tags/Priorities)**: 4 tasks - P2
- **Phase 8 (US6 - Search/Filter)**: 7 tasks - P2
- **Phase 9 (US7 - Due Dates)**: 3 tasks - P3
- **Phase 10 (US8 - Sort)**: 5 tasks - P3
- **Phase 11 (US9 - Docker)**: 8 tasks - P1 🎯 MVP Deployment
- **Phase 12 (Polish)**: 10 tasks

**Total Tasks**: 76 tasks

**MVP Scope** (Phases 1, 2, 3, 4, 11): 38 tasks
**Full Feature** (All phases): 76 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**User Story Mapping**:
- US1: 5 tasks (T017-T021)
- US2: 9 tasks (T022-T030)
- US3: 5 tasks (T031-T035)
- US4: 4 tasks (T036-T039)
- US5: 4 tasks (T040-T043)
- US6: 7 tasks (T044-T050)
- US7: 3 tasks (T051-T053)
- US8: 5 tasks (T054-T058)
- US9: 8 tasks (T059-T066)

---

## Notes

- [P] tasks = different files or non-conflicting changes, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable after Phase 2
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate story works independently
- Run quickstart.md validation at the end to ensure developer experience is smooth
- Phase 2 (Foundational) is the critical blocking phase - prioritize quality over speed here
- MVP can be deployed after Phase 11 (US9) with just create/retrieve functionality
