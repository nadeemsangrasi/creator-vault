# CreatorVault Backend API

Backend API for Content Idea Management - Phase 2

## Quick Start

### Prerequisites
- Python 3.13+ with `uv` package manager
- PostgreSQL 16+ or Docker

### Local Development

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT configuration
   ```

3. **Start PostgreSQL** (if using Docker):
   ```bash
   docker-compose up postgres -d
   ```

4. **Run database migrations:**
   ```bash
   uv run alembic upgrade head
   ```

5. **Start development server:**
   ```bash
   uv run uvicorn main:app --reload
   ```

6. **Access API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc
   - OpenAPI JSON: http://localhost:8000/openapi.json

### Docker Deployment

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Access API:**
   - API: http://localhost:8000
   - Health Check: http://localhost:8000/health
   - Database Check: http://localhost:8000/health/db

### Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_PUBLIC_KEY`: RS256 public key from Better Auth
- `JWT_AUDIENCE`: Expected JWT audience claim
- `JWT_ISSUER`: Expected JWT issuer claim

Optional:
- `ALLOWED_ORIGINS`: CORS origins (default: http://localhost:3000)
- `LOG_LEVEL`: Logging level (default: INFO)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

### API Endpoints

#### Health Checks (Public)
- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity check
- `GET /health/ready` - Readiness probe

#### Ideas (Authenticated)
- `POST /api/v1/{user_id}/ideas` - Create idea
- `GET /api/v1/{user_id}/ideas` - List ideas (with filters/search)
- `GET /api/v1/{user_id}/ideas/{id}` - Get idea by ID
- `PATCH /api/v1/{user_id}/ideas/{id}` - Partial update
- `PUT /api/v1/{user_id}/ideas/{id}` - Full update
- `DELETE /api/v1/{user_id}/ideas/{id}` - Delete idea

### Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest tests/unit/test_idea_service.py
```

### Project Structure

```
backend/
├── src/
│   ├── api/            # API routes and endpoints
│   ├── core/           # Configuration, security, database
│   ├── models/         # SQLModel database models
│   ├── repositories/   # Data access layer
│   ├── services/       # Business logic layer
│   ├── schemas/        # Pydantic request/response schemas
│   └── middleware/     # Custom middleware
├── alembic/            # Database migrations
├── tests/              # Unit and integration tests
├── main.py             # Application entry point
└── pyproject.toml      # Dependencies
```

### Architecture

- **Layered Architecture**: API → Service → Repository → Database
- **Authentication**: JWT verification with Better Auth (RS256)
- **Database**: PostgreSQL with async SQLModel ORM
- **Logging**: Structured JSON logs with correlation IDs
- **Containerization**: Multi-stage Docker build (<500MB)

### Development Commands

```bash
# Create new migration
uv run alembic revision --autogenerate -m "description"

# Upgrade database to latest
uv run alembic upgrade head

# Downgrade one revision
uv run alembic downgrade -1

# Format code
uv run ruff check --fix .

# Type check
uv run mypy src/
```

## License

MIT
