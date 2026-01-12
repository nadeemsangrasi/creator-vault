# CreatorVault Backend: Claude Code Rules

You are an expert AI assistant specializing in FastAPI backend development for the CreatorVault project. Your primary focus is building the privacy-first content idea manager's API and data layer.

## Project Overview

CreatorVault is a full-stack web application for content ideation and management. The backend provides secure API endpoints and robust data management with plans for AI integration.

**Core Features:**

- FastAPI backend (Python 3.13+, SQLModel, Pydantic v2)
- Neon Serverless PostgreSQL database
- Better Auth authentication system with JWT verification
- Secure API endpoints with proper validation
- Privacy-first architecture with encrypted content storage
- Full CRUD operations for content ideas
- Comprehensive test coverage and documentation
- Plans for AI-powered content analysis and categorization

**Technology Stack:**

- **Framework**: FastAPI 0.115+ with Python 3.13+
- **Database**: SQLModel 0.0.22+, PostgreSQL (Neon Serverless)
- **Validation**: Pydantic v2
- **Authentication**: Better Auth integration
- **Deployment**: Docker containerization with PgBouncer connection pooling

### AI-Powered Features

**Future AI Integration:** AI-powered features for enhanced content ideation and management will be implemented in upcoming phases.

**Planned AI Components:**

- OpenAI API integration layer
- Natural Language Processing pipelines
- AI-powered content analysis and categorization

**Chatbot Backend Architecture:**

- **Message Processing Layer**: FastAPI endpoints for handling chat interactions
- **LLM Integration**: Openai agent sdk orchestration
- **Response Streaming**: Server-Sent Events (SSE) for real-time responses
- **Context Retrieval**: Semantic search against content database
- **Tool Integration**: Custom tools for content ideation and management
- **Rate Limiting**: Per-user and per-endpoint rate limiting
- **Monitoring**: Structured logging and performance metrics

**AI Integration Skills:**

- `/openai-agent-sdk` - Scaffold OpenAI Agent SDK Python applications with MCP tools
- `/streaming-llm-responses` - Implement real-time LLM streaming responses from backend to frontend
- `/tool-design` - Design tools that AI agents can use effectively
- `/mcp-server-builder` - Build MCP (Model Context Protocol) servers for AI service integration
- `/memory-systems` - Design memory architectures for AI agent persistence and reasoning

## Project Overview

- **Framework**: FastAPI 0.115+ with Python 3.13+
- **Database**: SQLModel 0.0.22+, PostgreSQL (Neon Serverless)
- **Validation**: Pydantic v2
- **Authentication**: Better Auth integration
- **Deployment**: Docker containerization with PgBouncer connection pooling

## Getting Started

### Prerequisites

- Python 3.13+
- uv package manager
- Docker and Docker Compose
- PostgreSQL (local or Neon Serverless)

### Setup

```bash
cd backend
uv sync --dev  # Install dependencies with uv
```

### Running

```bash
uv run uvicorn app.main:app --reload    # Development server
uv run pytest                          # Run tests
uv run alembic upgrade head            # Apply database migrations
uv run ruff check .                    # Code quality check
uv run black .                         # Format code
```

## Project Structure

```
backend/
├── app/                    # Main application package
│   ├── __init__.py
│   ├── main.py            # Application factory and routing
│   ├── api/               # API endpoints
│   │   ├── __init__.py
│   │   ├── deps.py       # Dependency injection
│   │   ├── v1/           # API version 1
│   │   │   ├── __init__.py
│   │   │   ├── api.py    # API router
│   │   │   └── endpoints/ # Individual endpoints
│   │   │       ├── auth.py
│   │   │       ├── ideas.py
│   │   │       └── users.py
│   ├── models/            # SQLModel database models
│   │   ├── __init__.py
│   │   ├── base.py       # Base model
│   │   ├── user.py       # User model
│   │   └── idea.py       # Idea model
│   ├── schemas/           # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py       # User schemas
│   │   ├── idea.py       # Idea schemas
│   │   └── auth.py       # Auth schemas
│   ├── services/          # Business logic
│   │   ├── __init__.py
│   │   ├── auth.py       # Authentication logic
│   │   └── ideas.py      # Idea management logic
│   ├── core/              # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py     # Configuration settings
│   │   ├── security.py   # Security utilities
│   │   └── database.py   # Database utilities
│   └── db/                # Database utilities
│       ├── __init__.py
│       └── session.py     # Database session management
├── alembic/               # Database migrations
│   ├── versions/          # Migration files
│   ├── env.py
│   ├── script.py.mako
│   └──.ini
├── tests/                 # Test files
│   ├── __init__.py
│   ├── conftest.py       # Test configuration
│   ├── test_auth.py      # Authentication tests
│   ├── test_ideas.py     # Idea management tests
│   └── test_users.py     # User management tests
├── requirements.txt       # Production dependencies
├── requirements-dev.txt   # Development dependencies
└── alembic.ini           # Migration configuration
```

## Development Workflow

### Before Starting

1. Pull latest: `git pull origin main`
2. Install dependencies: `uv sync --dev`
3. Start database: `docker-compose up postgres` (or connect to Neon)
4. Run migrations: `uv run alembic upgrade head`

### During Development

1. Create feature branch: `git checkout -b feature/name`
2. Write tests first (TDD approach)
3. Implement feature following patterns below
4. Run tests: `uv run pytest`
5. Run linter: `uv run ruff check .`
6. Format code: `uv run black .`
7. Verify database migrations work

### Before Committing

- [ ] All tests pass
- [ ] No lint errors (ruff check)
- [ ] Code is formatted (black)
- [ ] Updated relevant documentation
- [ ] Database migrations tested
- [ ] Security scan passed

## Critical Patterns

### API Endpoint Development

- Follow RESTful conventions with proper HTTP status codes
- Use Pydantic models for request/response validation
- Implement proper error handling with custom exceptions
- Add OpenAPI documentation with examples
- Include rate limiting for public endpoints

**Reference `/scaffolding-fastapi` skill for proper FastAPI endpoint patterns.**

### Database Modeling

- Use SQLModel for declarative models with Pydantic compatibility
- Implement proper relationships with foreign keys
- Add proper indexing for frequently queried fields
- Include proper constraints and validation
- Use UUIDs for primary keys

**Reference `/database-schema-sqlmodel` skill for proper SQLModel database modeling patterns.**

### Pydantic Schema Design

- Create separate schemas for Create, Read, Update operations
- Use Field validators for data validation
- Implement computed properties when needed
- Include proper serialization settings
- Handle sensitive data appropriately

### Authentication & Security

- Implement JWT token validation for protected endpoints
- Use Better Auth for user management
- Hash passwords with bcrypt or argon2
- Implement proper rate limiting
- Add input sanitization and validation
- Use prepared statements (SQLModel handles this)

**Reference `/frontend-backend-jwt-verification` skill for JWT token verification patterns.**

## Testing

### Test Structure

- Unit tests: Individual function testing
- Integration tests: API endpoint testing
- Database tests: Model and query testing
- Security tests: Auth flow validation

```bash
uv run pytest                    # Run all tests
uv run pytest tests/test_ideas.py  # Specific test file
uv run pytest --cov=app         # With coverage report
uv run pytest -x                # Stop on first failure
```

### Testing Guidelines

- Test all endpoint responses
- Verify authentication requirements
- Test error conditions
- Validate data validation
- Check database operations

## Performance

### Optimization Strategies

- Use proper database indexing
- Implement caching for expensive queries
- Use connection pooling with PgBouncer
- Optimize SQL queries with proper joins
- Implement pagination for large datasets

### Performance Targets

- API response time < 200ms (p95)
- Database query time < 50ms (p95)
- Connection pool utilization < 80%
- Memory usage < 512MB
- CPU usage < 70%

## Security

### Security Requirements

- Never execute raw SQL queries without parameterization
- Never store sensitive data in plain text
- Never return stack traces in error responses
- Always use async/await for I/O operations
- Implement proper rate limiting
- Validate all inputs with Pydantic
- Use HTTPS for all communications

## Common Issues

### Database Issues

- **Connection timeouts**: Increase timeout settings or optimize queries
- **Deadlocks**: Reduce transaction scope and implement retry logic
- **Index performance**: Add proper indexes for frequently queried fields

### Authentication Issues

- **Token validation**: Verify JWT secret and algorithm
- **Session management**: Proper token refresh and expiration
- **Rate limiting**: Prevent brute force attacks

## Database Migrations

### Creating Migrations

1. Update your SQLModel model
2. Generate migration: `uv run alembic revision --autogenerate -m "description"`
3. Review generated migration in `alembic/versions/`
4. Update migration if needed (especially for data migrations)
5. Apply migration: `uv run alembic upgrade head`

### Migration Best Practices

- Always backup production before running migrations
- Test migrations on a copy of production data
- Write reversible migrations when possible
- Include data validation in migration tests

## Relevant Skills

- `/scaffolding-fastapi` - FastAPI application structure and patterns
- `/database-schema-sqlmodel` - SQLModel database modeling
- `/better-auth-nextjs` - Authentication setup and patterns
- `/frontend-backend-jwt-verification` - JWT token verification
- `/docker-containerization` - Containerization best practices

## Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Pydantic v2 Documentation](https://docs.pydantic.dev/latest/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
