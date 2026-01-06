# Phase 0 Research: Backend API Technical Decisions

**Feature**: Backend API for Content Idea Management
**Branch**: `001-backend-api`
**Date**: 2026-01-05
**Status**: Complete

## Research Objectives

This document consolidates technical research for key architectural decisions identified during planning. All research references authoritative documentation and best practices for Phase 2 technology stack.

---

## 1. JWT Verification Strategy with Better Auth

### Decision
Implement RS256 (RSA asymmetric) JWT verification using shared public key from Better Auth service.

### Rationale
- **Security**: RS256 prevents token forgery - backend verifies with public key but cannot issue tokens
- **Decoupling**: Backend doesn't need secret key or direct Better Auth connection
- **Standard**: Better Auth uses RS256 by default for JWT signing
- **Performance**: Public key verification is fast (<50ms) and can be cached

### Implementation Approach
```python
# Use python-jose library for RS256 verification
from jose import jwt, JWTError

# Load public key from environment variable (PEM format)
PUBLIC_KEY = os.getenv("JWT_PUBLIC_KEY")

# Verify token
payload = jwt.decode(
    token,
    PUBLIC_KEY,
    algorithms=["RS256"],
    audience=["your-app"],
    issuer="better-auth"
)
user_id = payload["sub"]  # Extract user identifier
```

### Configuration Required
- `JWT_PUBLIC_KEY`: Better Auth RS256 public key (PEM format)
- `JWT_ALGORITHM`: "RS256"
- `JWT_AUDIENCE`: Expected audience claim (app identifier)
- `JWT_ISSUER`: Expected issuer claim ("better-auth")

### Alternatives Considered
- **HS256 (HMAC)**: Rejected - requires shared secret, less secure for distributed systems
- **Direct Better Auth API validation**: Rejected - adds latency and external dependency for every request
- **No verification**: Rejected - security requirement

### References
- Better Auth JWT documentation: Uses RS256 by default
- FastAPI JWT authentication patterns: Middleware-based verification
- python-jose library: Industry standard for JWT operations in Python

---

## 2. Database Schema Design with SQLModel

### Decision
Use SQLModel for unified ORM models and Pydantic validation schemas with Alembic for migrations.

### Rationale
- **Type Safety**: SQLModel provides full type hints compatible with Pydantic v2
- **Single Source of Truth**: One model definition serves as both ORM and validation schema
- **FastAPI Integration**: Native Pydantic v2 support for automatic OpenAPI generation
- **Migration Support**: Alembic works seamlessly with SQLModel for schema evolution
- **Async Support**: Compatible with asyncpg/psycopg3 for non-blocking database operations

### Schema Design Principles
1. **User-Scoped Isolation**: All ideas have `user_id` foreign key, indexed for fast filtering
2. **Immutable IDs**: UUID primary keys for globally unique, non-sequential identifiers
3. **Audit Timestamps**: `created_at` and `updated_at` on all mutable entities
4. **Enum Storage**: Store stage/priority as PostgreSQL ENUM types for data integrity
5. **JSONB for Arrays**: Store tags as JSONB array for flexible querying with GIN index

### Key Entities

#### Idea Model
```python
from sqlmodel import Field, SQLModel, Column, JSON
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

class StageEnum(str, Enum):
    IDEA = "idea"
    OUTLINE = "outline"
    DRAFT = "draft"
    PUBLISHED = "published"

class PriorityEnum(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Idea(SQLModel, table=True):
    __tablename__ = "ideas"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True, nullable=False)  # From JWT "sub" claim
    title: str = Field(max_length=200, nullable=False)
    notes: str | None = Field(default=None, max_length=5000)
    stage: StageEnum = Field(default=StageEnum.IDEA)
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM)
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    due_date: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Indexes Strategy
- `user_id`: B-tree index for filtering user-owned ideas
- `(user_id, stage)`: Composite index for stage filtering
- `(user_id, priority)`: Composite index for priority filtering
- `(user_id, created_at DESC)`: Composite index for default sorting
- `tags`: GIN index for JSONB array contains queries

### Alternatives Considered
- **Plain SQLAlchemy**: Rejected - requires separate Pydantic schemas, more boilerplate
- **Django ORM**: Rejected - not async-native, tied to Django framework
- **Tortoise ORM**: Rejected - less mature, smaller ecosystem than SQLModel
- **Tags as separate table**: Rejected - over-engineering for Phase 2, JSONB sufficient

### References
- SQLModel documentation: Hybrid ORM/Pydantic approach
- FastAPI SQLModel integration guide
- PostgreSQL JSONB performance best practices
- Alembic migration patterns with SQLModel

---

## 3. API Endpoint Design & Versioning

### Decision
RESTful API design with `/api/v1/` prefix and resource-based routing.

### Rationale
- **REST Principles**: Predictable CRUD operations mapped to HTTP verbs
- **Versioning**: `/v1/` prefix enables future breaking changes without disrupting clients
- **OpenAPI Standard**: FastAPI auto-generates complete OpenAPI 3.1 specification
- **Resource Scoping**: `/api/v1/{user_id}/ideas` enforces user-scoped access at URL level

### Endpoint Catalog

#### Health & Documentation
- `GET /health` - API health check (public)
- `GET /health/db` - Database connectivity check (public)
- `GET /health/ready` - Readiness probe for orchestration (public)
- `GET /docs` - Swagger UI (public)
- `GET /redoc` - ReDoc alternative documentation (public)

#### Ideas (all require JWT auth)
- `POST /api/v1/{user_id}/ideas` - Create new idea
- `GET /api/v1/{user_id}/ideas` - List ideas with pagination/filtering
- `GET /api/v1/{user_id}/ideas/{id}` - Get specific idea
- `PUT /api/v1/{user_id}/ideas/{id}` - Replace entire idea
- `PATCH /api/v1/{user_id}/ideas/{id}` - Partial update idea
- `DELETE /api/v1/{user_id}/ideas/{id}` - Delete idea

#### Users (require JWT auth)
- `GET /api/v1/users/me` - Get authenticated user profile
- `PATCH /api/v1/users/me` - Update user preferences

### Query Parameters for List Endpoint
```
GET /api/v1/{user_id}/ideas?
  search=AI               # Keyword search in title/notes
  &stage=draft            # Filter by stage
  &priority=high          # Filter by priority
  &tags=blog,video        # Filter by tags (OR logic)
  &sort=created_at        # Sort field
  &order=desc             # Sort direction
  &limit=20               # Page size (max 100)
  &offset=0               # Pagination offset
```

### Response Formats

#### Success Response (200/201)
```json
{
  "id": "uuid",
  "user_id": "string",
  "title": "string",
  "notes": "string",
  "stage": "idea|outline|draft|published",
  "priority": "high|medium|low",
  "tags": ["string"],
  "due_date": "2026-01-15T00:00:00Z",
  "created_at": "2026-01-05T10:30:00Z",
  "updated_at": "2026-01-05T10:30:00Z"
}
```

#### List Response with Pagination
```json
{
  "items": [/* idea objects */],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

#### Error Response (400/401/403/404/500)
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Title exceeds maximum length of 200 characters",
  "request_id": "uuid",
  "details": {
    "field": "title",
    "constraint": "max_length"
  }
}
```

### Alternatives Considered
- **GraphQL**: Rejected - over-engineering for simple CRUD, adds complexity
- **Flat routing** (`/ideas` vs `/api/v1/{user_id}/ideas`): Rejected - less explicit about scoping
- **RPC-style** (`/createIdea`): Rejected - non-standard, harder to cache

### References
- FastAPI APIRouter documentation
- REST API best practices (Zalando API guidelines)
- OpenAPI 3.1 specification
- HTTP status code standards (RFC 9110)

---

## 4. Authentication Middleware Implementation

### Decision
FastAPI middleware that intercepts all requests, verifies JWT, and injects user context.

### Rationale
- **Centralized Auth**: Single point of verification, no auth logic in route handlers
- **Dependency Injection**: Authenticated user available via FastAPI `Depends()`
- **Public Endpoints**: Middleware bypasses auth for health checks and docs
- **Error Handling**: Consistent 401 responses for auth failures

### Implementation Pattern
```python
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract and verify JWT token, return user_id."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            PUBLIC_KEY,
            algorithms=["RS256"],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER
        )
        return payload["sub"]  # Return user_id
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

# Usage in route handler
@router.post("/api/v1/{user_id}/ideas")
async def create_idea(
    user_id: str,
    idea: IdeaCreate,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify user_id in path matches authenticated user
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Proceed with business logic
    ...
```

### Public Endpoints (no auth required)
- `/health*` - Health checks
- `/docs` - Swagger UI
- `/redoc` - ReDoc
- `/openapi.json` - OpenAPI spec

### Security Validations
1. Token signature verification (RS256)
2. Token expiration check
3. Issuer validation (must match Better Auth)
4. Audience validation (must match app identifier)
5. Required claims presence (`sub`, `exp`, `iat`)

### Alternatives Considered
- **OAuth2PasswordBearer**: Rejected - assumes password flow, not JWT verification
- **Route-level decorators**: Rejected - duplicates auth logic across routes
- **API Gateway auth**: Rejected - not available in Phase 2 deployment

### References
- FastAPI security utilities documentation
- python-jose JWT verification examples
- OAuth 2.0 Bearer Token Usage (RFC 6750)

---

## 5. Error Handling & Logging Strategy

### Decision
Global exception handler with structured JSON logging and correlation IDs.

### Rationale
- **Consistent Errors**: All errors follow same format regardless of source
- **Debuggability**: Correlation IDs enable request tracing across logs
- **Security**: Error details don't leak sensitive information
- **Observability**: Structured logs enable log aggregation and analysis

### Error Response Schema
```python
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    error_code: str              # Machine-readable code
    message: str                 # Human-readable message
    request_id: str              # Correlation ID
    details: dict | None = None  # Optional context
```

### Error Categories
- `VALIDATION_ERROR` (400): Invalid input data
- `AUTHENTICATION_ERROR` (401): Missing/invalid JWT token
- `AUTHORIZATION_ERROR` (403): User cannot access resource
- `NOT_FOUND` (404): Resource doesn't exist
- `INTERNAL_ERROR` (500): Unexpected server error
- `SERVICE_UNAVAILABLE` (503): Database connection failure

### Logging Configuration
```python
import structlog

# Configure structured JSON logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ]
)

# Log example
logger.info(
    "idea_created",
    request_id=request_id,
    user_id=user_id,
    idea_id=str(idea.id),
    duration_ms=42
)
```

### Correlation ID Implementation
- Generate UUID for each request via middleware
- Inject into request state: `request.state.request_id`
- Include in all log entries
- Return in error responses
- Include in response header: `X-Request-ID`

### Alternatives Considered
- **Plain Python logging**: Rejected - harder to parse, no structure
- **Stack traces in responses**: Rejected - security risk, leaks internals
- **No correlation IDs**: Rejected - impossible to trace requests

### References
- FastAPI exception handling documentation
- structlog library for structured logging
- Twelve-Factor App logging best practices
- OpenTelemetry trace context propagation

---

## 6. Database Connection & Session Management

### Decision
Async SQLAlchemy session with connection pooling via asyncpg/psycopg3.

### Rationale
- **Async Performance**: Non-blocking I/O for concurrent requests
- **Connection Pooling**: Reuse connections, prevent exhaustion
- **Transaction Management**: Automatic commit/rollback via context manager
- **Neon Compatibility**: Neon PostgreSQL supports standard PostgreSQL protocol

### Connection Configuration
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Async engine with connection pooling
engine = create_async_engine(
    DATABASE_URL,  # postgresql+asyncpg://...
    echo=False,    # Disable SQL logging in production
    pool_size=20,  # Max connections in pool
    max_overflow=10,  # Additional connections if pool exhausted
    pool_pre_ping=True,  # Verify connection before use
    pool_recycle=3600  # Recycle connections after 1 hour
)

# Async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for route handlers
async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
```

### Connection String Format
```
postgresql+asyncpg://user:password@host:5432/database?ssl=require
```

### Pool Sizing Strategy
- **pool_size=20**: Handle 20 concurrent requests
- **max_overflow=10**: Allow burst to 30 total connections
- **Neon limit**: 100 connections (pooled via PgBouncer)
- **Safety margin**: 30 < 100, leaves headroom for admin connections

### Health Check Implementation
```python
@router.get("/health/db")
async def health_db(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database unavailable: {str(e)}"
        )
```

### Alternatives Considered
- **Synchronous psycopg2**: Rejected - blocks event loop, poor concurrency
- **Raw asyncpg without SQLModel**: Rejected - lose ORM benefits, more boilerplate
- **No connection pooling**: Rejected - connection overhead kills performance

### References
- SQLAlchemy async documentation
- asyncpg performance benchmarks
- Neon connection pooling guide
- PostgreSQL connection pool sizing best practices

---

## 7. Docker Multi-Stage Build Optimization

### Decision
Multi-stage Dockerfile with separate build and runtime stages to minimize image size.

### Rationale
- **Size Optimization**: Runtime image <500MB (requirement: FR-071)
- **Build Caching**: Dependencies cached separately from application code
- **Security**: Runtime image has no build tools, minimal attack surface
- **uv Integration**: Fast dependency resolution and installation

### Dockerfile Structure
```dockerfile
# Stage 1: Build stage with uv
FROM python:3.13-slim as builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies into /app/.venv
RUN uv sync --frozen --no-dev

# Stage 2: Runtime stage
FROM python:3.13-slim

# Create non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./
COPY main.py ./

# Set PATH to include venv
ENV PATH="/app/.venv/bin:$PATH"

# Run as non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run migrations then start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
```

### Size Optimization Techniques
1. **Multi-stage build**: Discard build tools in final image
2. **python:3.13-slim**: Minimal base image (~150MB vs ~1GB for full Python)
3. **No unnecessary packages**: Only production dependencies
4. **Layer caching**: Dependencies change less than code

### docker-compose.yml for Local Development
```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: creator
      POSTGRES_PASSWORD: vault_dev_pass
      POSTGRES_DB: creatorvault
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://creator:vault_dev_pass@db:5432/creatorvault
      JWT_PUBLIC_KEY: ${JWT_PUBLIC_KEY}
      JWT_ALGORITHM: RS256
      ALLOWED_ORIGINS: http://localhost:3000
    depends_on:
      - db
    volumes:
      - ./backend:/app  # Hot reload during development

volumes:
  postgres_data:
```

### Alternatives Considered
- **Single-stage build**: Rejected - image too large (>1GB)
- **Alpine Python**: Rejected - compilation issues with binary dependencies
- **Docker secrets**: Deferred to Phase 5 (Kubernetes secrets)

### References
- Docker multi-stage build best practices
- uv Docker integration guide
- Python Docker official images
- Container security best practices (run as non-root)

---

## Research Summary

All technical decisions validated against:
- Phase 2 constitution requirements
- Industry best practices
- Performance constraints (<200ms p95, <500MB image)
- Security requirements (JWT verification, user isolation)

**Next Steps**: Proceed to Phase 1 (Data Model & API Contracts)
