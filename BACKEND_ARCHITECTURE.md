# CreatorVault Backend Architecture - Phase 2

**Version:** 1.0.0
**Date:** 2026-01-04
**Phase:** Phase 2 - Full-Stack Web Application
**Status:** Design Document - Ready for Implementation

---

## Executive Summary

This document defines the complete backend architecture for CreatorVault Phase 2, a privacy-first content idea manager built with FastAPI, SQLModel, and Neon PostgreSQL. The architecture is designed to support authenticated multi-user CRUD operations, RESTful API patterns, and preparation for Phase 3 AI integration.

**Key Architectural Decisions:**
- RESTful API design with OpenAPI 3.1 documentation
- SQLModel for type-safe database operations
- JWT-based authentication verification from Better Auth
- Async/await patterns throughout for scalability
- Structured logging with correlation IDs
- Database migrations managed by Alembic

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [API Design](#api-design)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Project Structure](#project-structure)
8. [Data Flow](#data-flow)
9. [Error Handling](#error-handling)
10. [Logging & Observability](#logging--observability)
11. [Security Considerations](#security-considerations)
12. [Performance & Scalability](#performance--scalability)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Architecture](#deployment-architecture)
15. [Phase 3 Preparation](#phase-3-preparation)
16. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Next.js Frontend│         │  Mobile App      │             │
│  │  (Vercel)        │         │  (Future)        │             │
│  └─────────┬────────┘         └─────────┬────────┘             │
│            │                            │                       │
│            └────────────┬───────────────┘                       │
└─────────────────────────┼─────────────────────────────────────┘
                          │ JWT Token (Bearer)
                          │ HTTPS Only
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI Application (Uvicorn ASGI Server)               │  │
│  │  - CORS Configuration                                     │  │
│  │  - Rate Limiting Middleware                               │  │
│  │  - JWT Verification Middleware                            │  │
│  │  - Request ID Generation                                  │  │
│  │  - Structured Logging                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Idea Service    │  │  User Service    │  │  Auth Service│ │
│  │  - CRUD Ops      │  │  - Profile Mgmt  │  │  - JWT Verify│ │
│  │  - Search/Filter │  │  - Preferences   │  │  - User Auth │ │
│  │  - Tag Mgmt      │  └──────────────────┘  └──────────────┘ │
│  │  - Stage Updates │                                          │
│  └──────────────────┘                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SQLModel Repository Pattern                             │  │
│  │  - Async Session Management                              │  │
│  │  - Query Builders                                        │  │
│  │  - Transaction Management                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Neon Serverless PostgreSQL                              │  │
│  │  - Connection Pooling (PgBouncer)                        │  │
│  │  - Automated Backups                                     │  │
│  │  - Branch Isolation (Dev/Staging/Prod)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns:** Clear separation between API routes, business logic, and data access
2. **Type Safety:** Pydantic v2 models throughout the stack for validation
3. **Async-First:** All I/O operations use async/await patterns
4. **Fail-Fast Validation:** Input validation at API boundary with detailed error messages
5. **Stateless Architecture:** No server-side session state; JWT tokens for authentication
6. **Observability:** Structured logging with correlation IDs for request tracing
7. **Security by Default:** All endpoints require authentication unless explicitly public

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Runtime** | Python | 3.13+ | Latest stable release with performance improvements |
| **Framework** | FastAPI | 0.115+ | Modern async framework with auto-generated OpenAPI docs |
| **ASGI Server** | Uvicorn | 0.34+ | High-performance ASGI server with WebSocket support |
| **ORM** | SQLModel | 0.0.22+ | Type-safe SQLAlchemy wrapper with Pydantic integration |
| **Database Driver** | psycopg3 (async) | 3.2+ | Native async PostgreSQL driver |
| **Database** | Neon PostgreSQL | 16+ | Serverless PostgreSQL with branching |
| **Migrations** | Alembic | 1.14+ | Industry-standard database migration tool |
| **Validation** | Pydantic | 2.10+ | Fast validation with type hints |
| **Authentication** | JWT (via PyJWT) | 2.10+ | JWT token verification |
| **Password Hashing** | bcrypt | 4.2+ | Secure password hashing (cost factor 12) |
| **Environment Config** | pydantic-settings | 2.7+ | Type-safe environment variable management |
| **Testing** | pytest | 8.3+ | Comprehensive testing framework |
| **Testing (Async)** | pytest-asyncio | 0.24+ | Async test support |
| **HTTP Client** | httpx | 0.28+ | Async HTTP client for testing |
| **Logging** | structlog | 24.4+ | Structured logging with JSON output |
| **Package Manager** | uv | 0.5+ | Fast Python package manager |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ruff** | Fast Python linter and formatter |
| **mypy** | Static type checker |
| **black** | Code formatter |
| **isort** | Import sorter |
| **pytest-cov** | Code coverage reporting |

---

## System Components

### 1. API Layer (`/backend/routes/`)

**Responsibility:** HTTP request handling, input validation, response formatting

**Components:**
- `ideas.py` - CRUD operations for ideas
- `users.py` - User profile management
- `health.py` - Health check endpoints

**Key Features:**
- OpenAPI documentation with examples
- Automatic request/response validation via Pydantic
- Dependency injection for database sessions and authentication
- Standardized error responses

### 2. Service Layer (`/backend/services/`)

**Responsibility:** Business logic, orchestration, data transformations

**Components:**
- `idea_service.py` - Idea management business logic
- `user_service.py` - User management operations
- `auth_service.py` - JWT verification and user authentication

**Key Features:**
- Pure business logic (no HTTP concerns)
- Reusable across different API endpoints
- Transaction management
- Input sanitization and business rule enforcement

### 3. Repository Layer (`/backend/repositories/`)

**Responsibility:** Database access, query construction, data persistence

**Components:**
- `idea_repository.py` - Idea database operations
- `user_repository.py` - User database operations
- `base_repository.py` - Abstract base repository with common operations

**Key Features:**
- Async SQLAlchemy queries
- Query builders for complex filters
- Pagination support
- Connection pooling management

### 4. Models Layer (`/backend/models/`)

**Responsibility:** Data structures, validation, ORM mappings

**Components:**
- `idea.py` - Idea SQLModel and Pydantic schemas
- `user.py` - User SQLModel and Pydantic schemas
- `enums.py` - Shared enumerations (Stage, Priority)

**Key Features:**
- SQLModel classes for ORM mapping
- Pydantic models for API request/response validation
- Shared base classes with common fields (id, timestamps)

### 5. Core Layer (`/backend/core/`)

**Responsibility:** Cross-cutting concerns, configuration, utilities

**Components:**
- `config.py` - Application configuration (environment variables)
- `database.py` - Database connection and session management
- `security.py` - JWT verification, password hashing
- `logging.py` - Structured logging configuration
- `dependencies.py` - FastAPI dependency injection factories

---

## API Design

### RESTful Endpoint Structure

**Base URL:** `https://api.creatorvault.com` (Production)
**Local Development:** `http://localhost:8000`

### Endpoint Catalog

#### Health & System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/health/db` | Database health check | No |
| GET | `/health/ready` | Readiness probe (K8s) | No |
| GET | `/docs` | OpenAPI documentation | No |
| GET | `/redoc` | ReDoc documentation | No |

#### Ideas API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/{user_id}/ideas` | List all ideas for user | Yes |
| POST | `/api/v1/{user_id}/ideas` | Create new idea | Yes |
| GET | `/api/v1/{user_id}/ideas/{idea_id}` | Get idea details | Yes |
| PUT | `/api/v1/{user_id}/ideas/{idea_id}` | Update idea (full) | Yes |
| PATCH | `/api/v1/{user_id}/ideas/{idea_id}` | Update idea (partial) | Yes |
| DELETE | `/api/v1/{user_id}/ideas/{idea_id}` | Delete idea | Yes |
| PATCH | `/api/v1/{user_id}/ideas/{idea_id}/stage` | Update stage only | Yes |

#### Users API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users/me` | Get current user profile | Yes |
| PATCH | `/api/v1/users/me` | Update current user profile | Yes |

### Request/Response Standards

#### Standard Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "AI Content Tools Research",
    "notes": "Compare top 5 AI writing assistants",
    "stage": "idea",
    "tags": ["blog", "research"],
    "priority": "high",
    "user_id": "user_123",
    "created_at": "2026-01-04T10:30:00Z",
    "updated_at": "2026-01-04T10:30:00Z"
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-04T10:30:00Z"
  }
}
```

#### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [
      {
        "field": "title",
        "message": "Field required",
        "type": "missing"
      }
    ]
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-04T10:30:00Z"
  }
}
```

### Query Parameters

#### List Ideas Endpoint

```
GET /api/v1/{user_id}/ideas?stage=idea&tags=blog,video&priority=high&search=AI&sort=created_at&order=desc&limit=20&offset=0
```

**Parameters:**
- `stage` (optional): Filter by stage (idea, outline, draft, published)
- `tags` (optional): Comma-separated list of tags
- `priority` (optional): Filter by priority (high, medium, low)
- `search` (optional): Search in title and notes
- `sort` (optional): Sort field (created_at, updated_at, title, priority)
- `order` (optional): Sort order (asc, desc)
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

#### Response with Pagination

```json
{
  "success": true,
  "data": {
    "ideas": [...],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-04T10:30:00Z"
  }
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  users (managed by Better Auth)                                 │
├─────────────────────────────────────────────────────────────────┤
│  id              VARCHAR(255)   PRIMARY KEY                      │
│  email           VARCHAR(255)   UNIQUE NOT NULL                  │
│  name            VARCHAR(255)                                    │
│  created_at      TIMESTAMP      DEFAULT NOW()                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ 1:N
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  ideas                                                          │
├─────────────────────────────────────────────────────────────────┤
│  id              SERIAL         PRIMARY KEY                      │
│  user_id         VARCHAR(255)   FOREIGN KEY → users(id)          │
│  title           VARCHAR(200)   NOT NULL                         │
│  notes           TEXT                                            │
│  stage           VARCHAR(20)    DEFAULT 'idea'                   │
│                                 CHECK (stage IN ...)             │
│  tags            JSONB          DEFAULT '[]'                     │
│  priority        VARCHAR(10)    DEFAULT 'medium'                 │
│                                 CHECK (priority IN ...)          │
│  due_date        TIMESTAMP      NULL                             │
│  created_at      TIMESTAMP      DEFAULT NOW()                    │
│  updated_at      TIMESTAMP      DEFAULT NOW()                    │
│                                                                  │
│  INDEX idx_ideas_user_id         (user_id)                       │
│  INDEX idx_ideas_stage           (stage)                         │
│  INDEX idx_ideas_priority        (priority)                      │
│  INDEX idx_ideas_created_at      (created_at DESC)               │
│  INDEX idx_ideas_tags            USING GIN (tags)                │
└─────────────────────────────────────────────────────────────────┘
```

### SQLModel Definitions

#### User Model

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True, max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

#### Idea Model

```python
from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, List
from enum import Enum

class IdeaStage(str, Enum):
    IDEA = "idea"
    OUTLINE = "outline"
    DRAFT = "draft"
    PUBLISHED = "published"

class IdeaPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Idea(SQLModel, table=True):
    __tablename__ = "ideas"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True, max_length=255)
    title: str = Field(max_length=200)
    notes: Optional[str] = Field(default=None, max_length=5000)
    stage: IdeaStage = Field(default=IdeaStage.IDEA)
    tags: List[str] = Field(default=[], sa_column=Column(JSON))
    priority: IdeaPriority = Field(default=IdeaPriority.MEDIUM)
    due_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Migration Strategy

**Migration Tool:** Alembic

**Migration Workflow:**
1. Create migration: `alembic revision --autogenerate -m "Create ideas table"`
2. Review migration file in `backend/alembic/versions/`
3. Apply migration: `alembic upgrade head`
4. Rollback if needed: `alembic downgrade -1`

**Initial Migrations:**
1. `001_create_users_table.py` - User schema (if not managed by Better Auth)
2. `002_create_ideas_table.py` - Ideas schema with indexes
3. `003_add_tags_gin_index.py` - GIN index for JSONB tags column

---

## Authentication & Authorization

### JWT Verification Flow

```
┌─────────────────┐     1. Request with JWT      ┌─────────────────┐
│  Next.js Client │─────────────────────────────▶│  FastAPI Server │
│  (Better Auth)  │                               │                 │
└─────────────────┘                               └────────┬────────┘
                                                           │
                        2. Extract Bearer Token            │
                           ┌──────────────────────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │ JWT Middleware   │
                    │ - Verify Sig     │
                    │ - Check Exp      │
                    │ - Extract Claims │
                    └──────┬───────────┘
                           │
                           │ 3. Valid Token?
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼ YES                     ▼ NO
    ┌─────────────────┐      ┌──────────────────┐
    │ Inject User ID  │      │ Return 401       │
    │ into Request    │      │ Unauthorized     │
    └────────┬────────┘      └──────────────────┘
             │
             │ 4. Proceed to Route
             │
             ▼
    ┌─────────────────┐
    │  Route Handler  │
    │  (Ideas API)    │
    └─────────────────┘
```

### JWT Token Structure

**Header:**
```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "user_123",
  "email": "creator@example.com",
  "iat": 1704350400,
  "exp": 1704436800,
  "aud": "creatorvault-api",
  "iss": "better-auth"
}
```

### Security Configuration

**Environment Variables:**
```bash
# JWT Configuration
JWT_PUBLIC_KEY=<RSA-256 Public Key from Better Auth>
JWT_ALGORITHM=RS256
JWT_AUDIENCE=creatorvault-api
JWT_ISSUER=better-auth

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# CORS
ALLOWED_ORIGINS=https://creatorvault.com,http://localhost:3000
```

### Middleware Implementation

```python
from fastapi import Request, HTTPException
from jose import jwt, JWTError
from datetime import datetime

async def jwt_verification_middleware(request: Request, call_next):
    # Skip auth for public endpoints
    if request.url.path in ["/health", "/docs", "/redoc"]:
        return await call_next(request)

    # Extract token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]

    try:
        # Verify token
        payload = jwt.decode(
            token,
            settings.JWT_PUBLIC_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER
        )

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Token expired")

        # Inject user_id into request state
        request.state.user_id = payload.get("sub")
        request.state.user_email = payload.get("email")

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    return await call_next(request)
```

### Authorization Rules

**Principle:** Resource-level authorization - users can only access their own resources

**Implementation:**
- All `/api/v1/{user_id}/...` endpoints verify `user_id` matches JWT `sub` claim
- Database queries automatically filter by authenticated user_id
- Admin endpoints (future) require role claim in JWT

**Example Route Protection:**
```python
@router.get("/api/v1/{user_id}/ideas")
async def list_ideas(
    user_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Verify user_id matches authenticated user
    if request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # User can only see their own ideas
    ideas = await idea_service.list_ideas(db, user_id)
    return {"success": True, "data": ideas}
```

---

## Project Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/               # Migration files
│   └── env.py                  # Alembic configuration
├── core/                       # Core utilities
│   ├── __init__.py
│   ├── config.py               # Environment config (Pydantic Settings)
│   ├── database.py             # DB connection & session management
│   ├── security.py             # JWT verification, password hashing
│   ├── logging.py              # Structured logging setup
│   └── dependencies.py         # FastAPI dependency injection
├── models/                     # Data models
│   ├── __init__.py
│   ├── user.py                 # User SQLModel & Pydantic schemas
│   ├── idea.py                 # Idea SQLModel & Pydantic schemas
│   └── enums.py                # Enumerations (Stage, Priority)
├── repositories/               # Data access layer
│   ├── __init__.py
│   ├── base_repository.py      # Abstract base repository
│   ├── user_repository.py      # User DB operations
│   └── idea_repository.py      # Idea DB operations
├── services/                   # Business logic layer
│   ├── __init__.py
│   ├── user_service.py         # User business logic
│   ├── idea_service.py         # Idea business logic
│   └── auth_service.py         # Authentication logic
├── routes/                     # API endpoints
│   ├── __init__.py
│   ├── health.py               # Health check endpoints
│   ├── users.py                # User API routes
│   └── ideas.py                # Ideas API routes
├── middleware/                 # Custom middleware
│   ├── __init__.py
│   ├── jwt_auth.py             # JWT verification middleware
│   ├── request_id.py           # Request ID generation
│   └── logging_middleware.py   # Request/response logging
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures
│   ├── test_ideas.py           # Idea API tests
│   ├── test_users.py           # User API tests
│   └── test_auth.py            # Authentication tests
├── main.py                     # FastAPI application entry point
├── pyproject.toml              # Project dependencies (uv)
├── alembic.ini                 # Alembic configuration
├── .env.example                # Environment variable template
├── BACKEND.md                  # Backend-specific documentation
└── README.md                   # Backend setup instructions
```

---

## Data Flow

### Create Idea Flow

```
1. Client Request
   POST /api/v1/user_123/ideas
   Headers: Authorization: Bearer <jwt_token>
   Body: {"title": "AI Tools", "notes": "...", "tags": ["blog"], "priority": "high"}

   ▼

2. Middleware Chain
   - Request ID Generation → Assign "req_abc123"
   - JWT Verification → Extract user_id="user_123", inject into request.state
   - Logging → Log incoming request with correlation ID

   ▼

3. Route Handler (routes/ideas.py)
   - Validate user_id matches authenticated user
   - Parse and validate request body via Pydantic model
   - Call service layer

   ▼

4. Service Layer (services/idea_service.py)
   - Apply business rules (e.g., title max length, sanitize input)
   - Call repository layer

   ▼

5. Repository Layer (repositories/idea_repository.py)
   - Create SQLModel Idea instance
   - Insert into database using async session
   - Commit transaction

   ▼

6. Database (Neon PostgreSQL)
   - Execute INSERT statement
   - Generate auto-increment ID
   - Return created record

   ▼

7. Response Chain
   - Repository → return Idea object
   - Service → return Idea object
   - Route → format success response
   - Middleware → log response, add request_id to headers

   ▼

8. Client Response
   Status: 201 Created
   Body: {"success": true, "data": {...}, "meta": {"request_id": "req_abc123"}}
```

---

## Error Handling

### Error Categories

| Category | HTTP Status | Code | Example |
|----------|-------------|------|---------|
| Validation Error | 400 | VALIDATION_ERROR | Missing required field |
| Authentication Error | 401 | AUTH_ERROR | Invalid or expired JWT |
| Authorization Error | 403 | FORBIDDEN | User accessing another user's resource |
| Not Found | 404 | NOT_FOUND | Idea ID does not exist |
| Conflict | 409 | CONFLICT | Duplicate email during signup |
| Rate Limit | 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| Server Error | 500 | INTERNAL_ERROR | Unhandled exception |
| Database Error | 503 | DATABASE_ERROR | Database connection failure |

### Global Exception Handler

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception",
        exc_info=exc,
        request_id=getattr(request.state, "request_id", None)
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "request_id": getattr(request.state, "request_id", None)
            }
        }
    )
```

### Custom Exception Classes

```python
class CreatorVaultException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

class ValidationError(CreatorVaultException):
    def __init__(self, message: str, details: list = None):
        super().__init__("VALIDATION_ERROR", message, 400)
        self.details = details

class NotFoundError(CreatorVaultException):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            "NOT_FOUND",
            f"{resource} with id {resource_id} not found",
            404
        )

class ForbiddenError(CreatorVaultException):
    def __init__(self, message: str = "Access forbidden"):
        super().__init__("FORBIDDEN", message, 403)
```

---

## Logging & Observability

### Structured Logging

**Format:** JSON logs with structured fields

**Required Fields:**
- `timestamp` (ISO 8601)
- `level` (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `message`
- `request_id` (correlation ID)
- `user_id` (if authenticated)
- `service` (always "creatorvault-backend")
- `environment` (dev, staging, production)

**Example Log Entry:**
```json
{
  "timestamp": "2026-01-04T10:30:15.123Z",
  "level": "INFO",
  "message": "Idea created successfully",
  "request_id": "req_abc123",
  "user_id": "user_123",
  "idea_id": 42,
  "service": "creatorvault-backend",
  "environment": "production",
  "duration_ms": 45
}
```

### Logging Configuration

```python
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)
```

### Observability Metrics

**Key Metrics to Track:**
- Request rate (requests/second)
- Response time (p50, p95, p99 latency)
- Error rate (5xx responses)
- Database query time
- JWT verification time
- Active database connections

**Implementation:** Use FastAPI middleware to collect metrics and expose Prometheus endpoint

---

## Security Considerations

### OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| **A01: Broken Access Control** | JWT verification, user_id validation, resource-level auth |
| **A02: Cryptographic Failures** | HTTPS only, JWT RS256, bcrypt password hashing |
| **A03: Injection** | SQLModel parameterized queries, Pydantic validation |
| **A04: Insecure Design** | Principle of least privilege, fail-secure defaults |
| **A05: Security Misconfiguration** | Environment-based config, no hardcoded secrets |
| **A06: Vulnerable Components** | Regular dependency updates via uv |
| **A07: Authentication Failures** | JWT expiration, secure token storage |
| **A08: Software/Data Integrity** | Alembic migrations, database constraints |
| **A09: Logging Failures** | Structured logging with correlation IDs |
| **A10: SSRF** | Input validation, no user-controlled URLs |

### Security Headers

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Request-ID"]
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### Rate Limiting

**Strategy:** Token bucket algorithm with user_id as key

**Limits:**
- Authenticated users: 100 requests/minute
- Unauthenticated (health checks): 10 requests/minute

**Implementation:** Use `slowapi` library with Redis backend

---

## Performance & Scalability

### Database Optimization

**Connection Pooling:**
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600    # Recycle connections after 1 hour
)
```

**Query Optimization:**
- Use indexes on frequently queried columns (user_id, stage, priority, created_at)
- GIN index on JSONB tags column for efficient array queries
- Pagination with limit/offset to prevent full table scans
- Use `select_in_loading` for relationship queries

**Caching Strategy (Phase 3):**
- Cache user profiles in Redis (TTL: 5 minutes)
- Cache frequently accessed ideas (TTL: 1 minute)
- Invalidate cache on create/update/delete operations

### Scalability Considerations

**Horizontal Scaling:**
- Stateless design allows multiple backend instances behind load balancer
- Neon PostgreSQL handles connection pooling and read replicas
- Session state managed by Better Auth (external service)

**Vertical Scaling:**
- Async/await patterns maximize CPU utilization
- Connection pooling optimizes database connections
- Lazy loading prevents N+1 query problems

**Future Enhancements (Phase 4-5):**
- Redis for session caching
- Read replicas for read-heavy workloads
- Message queue (Kafka) for async operations

---

## Testing Strategy

### Test Pyramid

```
        ┌──────────────┐
        │  E2E Tests   │  10% - Full user journeys
        │  (Selenium)  │
        ├──────────────┤
        │              │
        │              │
        │ Integration  │  30% - API + Database
        │    Tests     │
        │              │
        │              │
        ├──────────────┤
        │              │
        │              │
        │              │
        │              │
        │  Unit Tests  │  60% - Services, Repositories
        │              │
        │              │
        │              │
        │              │
        └──────────────┘
```

### Unit Tests

**Target:** Services, repositories, utilities

**Framework:** pytest with pytest-asyncio

**Example:**
```python
# tests/test_idea_service.py
import pytest
from backend.services.idea_service import IdeaService
from backend.models.idea import IdeaCreate

@pytest.mark.asyncio
async def test_create_idea_success(db_session):
    service = IdeaService()
    idea_data = IdeaCreate(
        title="Test Idea",
        notes="Test notes",
        tags=["test"],
        priority="high"
    )

    idea = await service.create_idea(db_session, "user_123", idea_data)

    assert idea.id is not None
    assert idea.title == "Test Idea"
    assert idea.user_id == "user_123"
```

### Integration Tests

**Target:** API endpoints with test database

**Setup:** Use separate test database, reset before each test

**Example:**
```python
# tests/test_ideas_api.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_ideas_authenticated(client: AsyncClient, auth_token: str):
    response = await client.get(
        "/api/v1/user_123/ideas",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert isinstance(response.json()["data"], list)
```

### E2E Tests

**Target:** Full user workflows from frontend to database

**Framework:** Playwright or Selenium

**Example Scenarios:**
1. User signs up → Creates idea → Views list → Edits idea → Deletes idea
2. User searches ideas → Filters by tag → Sorts by date
3. User changes idea stage → Verifies state transition

### Test Coverage

**Minimum Coverage Target:** 80% overall
- Services: 90%
- Repositories: 85%
- Routes: 80%
- Models: 70%

**Coverage Tool:** pytest-cov

```bash
pytest --cov=backend --cov-report=html --cov-report=term
```

---

## Deployment Architecture

### Development Environment

```bash
# Local development
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
uvicorn main:app --reload --port 8000
```

**Environment:** `.env.local`
- Local PostgreSQL or Neon branch
- Debug logging enabled
- CORS allows localhost:3000

### Production Environment

**Hosting:** Railway, Render, or DigitalOcean App Platform

**Environment Variables (Production):**
```bash
DATABASE_URL=postgresql+asyncpg://...@neon.tech/creatorvault
JWT_PUBLIC_KEY=<Base64 RSA Public Key>
ALLOWED_ORIGINS=https://creatorvault.com
ENVIRONMENT=production
LOG_LEVEL=INFO
```

**Health Checks:**
- `/health` - Basic health check
- `/health/db` - Database connectivity check
- `/health/ready` - Readiness probe (for K8s)

### Docker Deployment (Phase 4)

**Dockerfile:**
```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependencies
COPY pyproject.toml ./
RUN uv pip install --system .

# Copy source code
COPY . .

# Run migrations on startup
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY}
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=creatorvault
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=creatorvault
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Phase 3 Preparation

### MCP Server Foundation

**Phase 3 Requirement:** OpenAI Agents SDK with MCP tools for natural language operations

**Backend Changes Needed:**
1. Create MCP server module (`backend/mcp/`)
2. Expose idea operations as MCP tools
3. Add conversation storage (messages table)
4. Create `/api/v1/{user_id}/chat` endpoint

**MCP Tools to Implement:**
```python
# backend/mcp/tools.py
from mcp.server import MCPServer

server = MCPServer(name="creatorvault-mcp")

@server.tool()
async def add_idea(
    user_id: str,
    title: str,
    notes: str = "",
    tags: list[str] = [],
    priority: str = "medium"
) -> dict:
    """Create a new content idea for the user."""
    # Call IdeaService.create_idea
    pass

@server.tool()
async def list_ideas(
    user_id: str,
    stage: str = None,
    tags: list[str] = None
) -> list[dict]:
    """List ideas for the user with optional filters."""
    # Call IdeaService.list_ideas
    pass

@server.tool()
async def expand_idea(
    user_id: str,
    idea_id: int,
    expansion_type: str  # "angles", "outline", "variations"
) -> str:
    """Generate AI-powered content suggestions for an idea."""
    # Call OpenAI API to expand idea
    pass
```

**Conversation Storage:**
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id),
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Checklist

### Phase 2 Backend Implementation Tasks

#### Setup & Configuration
- [ ] Initialize backend directory structure
- [ ] Set up uv project with `pyproject.toml`
- [ ] Create `.env.example` with all required variables
- [ ] Configure Neon PostgreSQL database
- [ ] Set up Alembic for migrations
- [ ] Configure structured logging with structlog

#### Core Layer
- [ ] Implement `core/config.py` (Pydantic Settings)
- [ ] Implement `core/database.py` (async SQLAlchemy engine + session)
- [ ] Implement `core/security.py` (JWT verification, password hashing)
- [ ] Implement `core/logging.py` (structured logging setup)
- [ ] Implement `core/dependencies.py` (FastAPI dependencies)

#### Models Layer
- [ ] Define `models/enums.py` (IdeaStage, IdeaPriority)
- [ ] Define `models/user.py` (User SQLModel + Pydantic schemas)
- [ ] Define `models/idea.py` (Idea SQLModel + Pydantic schemas)

#### Repository Layer
- [ ] Implement `repositories/base_repository.py`
- [ ] Implement `repositories/user_repository.py`
- [ ] Implement `repositories/idea_repository.py` (CRUD + filters)

#### Service Layer
- [ ] Implement `services/auth_service.py` (JWT verification)
- [ ] Implement `services/user_service.py`
- [ ] Implement `services/idea_service.py` (business logic + validation)

#### API Layer
- [ ] Implement `routes/health.py` (health checks)
- [ ] Implement `routes/users.py` (GET /users/me, PATCH /users/me)
- [ ] Implement `routes/ideas.py` (full CRUD + filters)

#### Middleware
- [ ] Implement `middleware/jwt_auth.py` (JWT verification middleware)
- [ ] Implement `middleware/request_id.py` (correlation ID generation)
- [ ] Implement `middleware/logging_middleware.py` (request/response logging)

#### Migrations
- [ ] Create migration: `001_create_users_table.py`
- [ ] Create migration: `002_create_ideas_table.py`
- [ ] Create migration: `003_add_indexes.py`

#### Testing
- [ ] Set up pytest configuration (`conftest.py`)
- [ ] Write unit tests for services (80% coverage)
- [ ] Write integration tests for API endpoints
- [ ] Set up GitHub Actions CI pipeline

#### Documentation
- [ ] Update `BACKEND.md` with setup instructions
- [ ] Generate OpenAPI docs (automatic via FastAPI)
- [ ] Document environment variables
- [ ] Create deployment guide

#### Deployment Prep
- [ ] Test Neon database connection
- [ ] Configure CORS for Next.js frontend
- [ ] Set up production environment variables
- [ ] Test JWT verification with Better Auth tokens

---

## Appendix

### Environment Variables Reference

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/creatorvault
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# JWT Authentication
JWT_PUBLIC_KEY=<Base64 RSA-256 Public Key from Better Auth>
JWT_ALGORITHM=RS256
JWT_AUDIENCE=creatorvault-api
JWT_ISSUER=better-auth

# CORS
ALLOWED_ORIGINS=https://creatorvault.com,http://localhost:3000
ALLOWED_HOSTS=creatorvault.com,localhost

# Application
ENVIRONMENT=production  # dev, staging, production
LOG_LEVEL=INFO          # DEBUG, INFO, WARNING, ERROR
DEBUG=false

# Rate Limiting (Optional - Phase 3)
REDIS_URL=redis://localhost:6379/0
RATE_LIMIT_PER_MINUTE=100
```

### Useful Commands

```bash
# Development
uv run uvicorn main:app --reload --port 8000

# Migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
alembic downgrade -1

# Testing
pytest
pytest --cov=backend --cov-report=html
pytest -v -s  # Verbose with stdout

# Linting
ruff check .
ruff format .
mypy backend/

# Database
psql $DATABASE_URL  # Connect to database
alembic current     # Show current migration
alembic history     # Show migration history
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | Claude Sonnet 4.5 | Initial backend architecture for Phase 2 |

---

**Next Steps:**
1. Review this architecture document
2. Create feature specifications in `/specs/` using `/sp.specify`
3. Begin implementation with `/scaffolding-fastapi` skill
4. Implement database schema with `/database-schema-sqlmodel` skill
5. Set up authentication with `/frontend-backend-jwt-verification` skill

**Estimated Implementation Time:** 3-4 days (with spec-driven development)

**Phase 2 Completion Criteria:**
- [ ] All 7 Quality Gates met (see constitution.md)
- [ ] Backend deployed and accessible via public URL
- [ ] JWT authentication working with Next.js frontend
- [ ] Full CRUD operations tested and documented
- [ ] OpenAPI documentation published at `/docs`
