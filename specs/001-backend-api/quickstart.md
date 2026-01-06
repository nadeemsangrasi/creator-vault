# Backend API Quickstart Guide

**Feature**: Backend API for Content Idea Management
**Branch**: `001-backend-api`
**Date**: 2026-01-05

---

## Overview

This guide provides step-by-step instructions for setting up, running, and testing the CreatorVault backend API locally. Follow these steps to get the FastAPI server running with PostgreSQL database.

---

## Prerequisites

### Required Software
- **Python 3.13+**: [python.org/downloads](https://www.python.org/downloads/)
- **uv Package Manager**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Docker & docker-compose**: [docs.docker.com/get-docker](https://docs.docker.com/get-docker/)
- **Git**: For cloning the repository

### Required Accounts (for production deployment)
- **Neon PostgreSQL**: [neon.tech](https://neon.tech) (free tier available)
- **Better Auth**: Running instance with JWT public key

---

## Local Development Setup

### Step 1: Clone Repository and Navigate to Backend

```bash
# Clone repository
git clone https://github.com/your-org/full-stack-creator-vault.git
cd full-stack-creator-vault

# Checkout feature branch
git checkout 001-backend-api

# Navigate to backend directory
cd backend
```

### Step 2: Install Dependencies with uv

```bash
# Initialize uv project (if not already initialized)
uv init

# Install dependencies from pyproject.toml
uv sync

# Verify installation
uv run python --version  # Should show Python 3.13+
```

### Step 3: Start PostgreSQL Database with Docker

```bash
# Start PostgreSQL container
docker-compose up -d db

# Verify database is running
docker ps | grep postgres

# Check database logs
docker-compose logs db
```

**Database Connection Details** (from docker-compose.yml):
- Host: `localhost`
- Port: `5432`
- Database: `creatorvault`
- User: `creator`
- Password: `vault_dev_pass`

### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required Environment Variables**:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://creator:vault_dev_pass@localhost:5432/creatorvault

# JWT Configuration (get from Better Auth)
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_BETTER_AUTH_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"
JWT_ALGORITHM=RS256
JWT_AUDIENCE=creatorvault-api
JWT_ISSUER=better-auth

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
```

### Step 5: Run Database Migrations

```bash
# Run Alembic migrations to create tables
uv run alembic upgrade head

# Verify migration success
uv run alembic current
```

**Expected Output**:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001, create ideas table
```

### Step 6: Start FastAPI Development Server

```bash
# Start Uvicorn server with hot reload
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the shortcut
uv run fastapi dev
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 7: Verify API is Running

Open browser and navigate to:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

**Expected Health Check Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-05T10:30:00Z"
}
```

---

## Testing the API

### Using Swagger UI (Recommended for Manual Testing)

1. Navigate to http://localhost:8000/docs
2. Click "Authorize" button (top right)
3. Enter JWT token: `Bearer <your-jwt-token>`
4. Test endpoints:
   - **POST /api/v1/{user_id}/ideas** - Create idea
   - **GET /api/v1/{user_id}/ideas** - List ideas
   - **GET /api/v1/{user_id}/ideas/{idea_id}** - Get idea
   - **PATCH /api/v1/{user_id}/ideas/{idea_id}** - Update idea
   - **DELETE /api/v1/{user_id}/ideas/{idea_id}** - Delete idea

### Using curl (Command Line)

#### Get JWT Token (from Better Auth frontend)
```bash
# Login to Better Auth frontend
# Copy JWT token from localStorage or network inspector
export JWT_TOKEN="eyJhbGc..."
export USER_ID="user_123abc"
```

#### Create Idea
```bash
curl -X POST "http://localhost:8000/api/v1/${USER_ID}/ideas" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Idea from curl",
    "notes": "This is a test idea created via command line",
    "stage": "idea",
    "priority": "medium",
    "tags": ["test", "curl"]
  }'
```

#### List Ideas
```bash
curl -X GET "http://localhost:8000/api/v1/${USER_ID}/ideas?limit=10" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Get Specific Idea
```bash
IDEA_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET "http://localhost:8000/api/v1/${USER_ID}/ideas/${IDEA_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Update Idea
```bash
curl -X PATCH "http://localhost:8000/api/v1/${USER_ID}/ideas/${IDEA_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "draft",
    "priority": "high"
  }'
```

#### Delete Idea
```bash
curl -X DELETE "http://localhost:8000/api/v1/${USER_ID}/ideas/${IDEA_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### Using httpx (Python Test Client)

```python
import httpx
import asyncio

async def test_api():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # Create idea
        response = await client.post(
            "/api/v1/user_123abc/ideas",
            json={
                "title": "Test from Python",
                "notes": "Testing with httpx",
                "tags": ["python", "test"]
            },
            headers={"Authorization": f"Bearer {JWT_TOKEN}"}
        )
        print(f"Create: {response.status_code}")
        idea = response.json()

        # List ideas
        response = await client.get(
            "/api/v1/user_123abc/ideas",
            headers={"Authorization": f"Bearer {JWT_TOKEN}"}
        )
        print(f"List: {response.status_code}")
        ideas = response.json()
        print(f"Total ideas: {ideas['total']}")

asyncio.run(test_api())
```

---

## Running Tests

### Unit Tests
```bash
# Run all unit tests
uv run pytest tests/unit/ -v

# Run with coverage report
uv run pytest tests/unit/ --cov=src --cov-report=html

# Open coverage report
open htmlcov/index.html
```

### Integration Tests
```bash
# Run integration tests (requires database)
uv run pytest tests/integration/ -v

# Run all tests
uv run pytest -v
```

### Test Coverage Target
- **Minimum**: 80% overall coverage
- **Critical paths**: 100% coverage (authentication, authorization, CRUD operations)

---

## Common Development Tasks

### Create New Database Migration

```bash
# Auto-generate migration from model changes
uv run alembic revision --autogenerate -m "Add new field to ideas"

# Review generated migration file
cat alembic/versions/<revision_id>_add_new_field_to_ideas.py

# Apply migration
uv run alembic upgrade head
```

### Rollback Migration

```bash
# Rollback one revision
uv run alembic downgrade -1

# Rollback to specific revision
uv run alembic downgrade <revision_id>

# Rollback all migrations
uv run alembic downgrade base
```

### View Database Schema

```bash
# Connect to PostgreSQL
docker exec -it backend-db-1 psql -U creator -d creatorvault

# List tables
\dt

# Describe ideas table
\d ideas

# Exit
\q
```

### Reset Database (Development Only)

```bash
# Stop containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart database
docker-compose up -d db

# Re-run migrations
uv run alembic upgrade head
```

---

## Debugging Tips

### View Server Logs

```bash
# Uvicorn logs (console output)
# Logs are printed to stdout during development

# View structured JSON logs in production
tail -f logs/app.log | jq '.'
```

### Enable SQL Query Logging

Edit `src/core/database.py`:
```python
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Enable SQL logging
    ...
)
```

### Test JWT Token Verification

```python
# Create test script: test_jwt.py
from jose import jwt
import os

PUBLIC_KEY = os.getenv("JWT_PUBLIC_KEY")
token = "your-jwt-token-here"

try:
    payload = jwt.decode(
        token,
        PUBLIC_KEY,
        algorithms=["RS256"],
        audience="creatorvault-api",
        issuer="better-auth"
    )
    print(f"✅ Valid token. User ID: {payload['sub']}")
except Exception as e:
    print(f"❌ Invalid token: {e}")
```

Run: `uv run python test_jwt.py`

### Check Database Connection

```bash
# Test connection from Python
uv run python -c "
from sqlalchemy import create_engine, text
engine = create_engine('postgresql://creator:vault_dev_pass@localhost:5432/creatorvault')
with engine.connect() as conn:
    result = conn.execute(text('SELECT 1'))
    print('✅ Database connected')
"
```

---

## Docker Development Workflow

### Build and Run with Docker

```bash
# Build Docker image
docker build -t creatorvault-backend:dev .

# Run container
docker run -d \
  --name creatorvault-api \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://creator:vault_dev_pass@host.docker.internal:5432/creatorvault" \
  -e JWT_PUBLIC_KEY="${JWT_PUBLIC_KEY}" \
  -e ALLOWED_ORIGINS="http://localhost:3000" \
  creatorvault-backend:dev

# View logs
docker logs -f creatorvault-api

# Stop container
docker stop creatorvault-api
docker rm creatorvault-api
```

### Full Stack with docker-compose

```bash
# Start all services (database + API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Scale API instances
docker-compose up -d --scale api=3

# Stop all services
docker-compose down
```

---

## Production Deployment

### Deploy to Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Link Neon database: `railway add` → Select PostgreSQL
5. Set environment variables:
   ```bash
   railway variables set JWT_PUBLIC_KEY="<key>"
   railway variables set JWT_ALGORITHM="RS256"
   railway variables set ALLOWED_ORIGINS="https://app.creatorvault.dev"
   ```
6. Deploy: `railway up`
7. Get URL: `railway domain`

### Deploy to Render

1. Connect GitHub repository to Render
2. Create new Web Service
3. Build Command: `uv sync`
4. Start Command: `uv run alembic upgrade head && uv run uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard
6. Deploy automatically on git push

### Environment Variables Checklist

- ✅ `DATABASE_URL` - Neon PostgreSQL connection string
- ✅ `JWT_PUBLIC_KEY` - Better Auth RS256 public key (PEM format)
- ✅ `JWT_ALGORITHM` - "RS256"
- ✅ `JWT_AUDIENCE` - Your app identifier
- ✅ `JWT_ISSUER` - "better-auth"
- ✅ `ALLOWED_ORIGINS` - Frontend domain (comma-separated)
- ✅ `LOG_LEVEL` - "INFO" or "DEBUG"

---

## Troubleshooting

### Issue: "Connection refused" to PostgreSQL

**Solution**:
```bash
# Check if database container is running
docker ps | grep postgres

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Issue: "Invalid token signature"

**Solution**:
- Verify JWT_PUBLIC_KEY matches Better Auth public key
- Ensure key is in PEM format with newlines preserved
- Check JWT_ALGORITHM is "RS256" (not "HS256")
- Verify token is not expired

### Issue: "Table does not exist"

**Solution**:
```bash
# Run migrations
uv run alembic upgrade head

# Verify current migration
uv run alembic current

# Check database tables
docker exec -it backend-db-1 psql -U creator -d creatorvault -c "\dt"
```

### Issue: "Port 8000 already in use"

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uv run uvicorn main:app --port 8001
```

### Issue: "Module not found" errors

**Solution**:
```bash
# Sync dependencies
uv sync

# Verify Python version
uv run python --version  # Should be 3.13+

# Reinstall dependencies
rm -rf .venv
uv sync
```

---

## Next Steps

1. ✅ Backend API running locally
2. → Integrate with Next.js frontend (separate feature)
3. → Set up E2E tests with frontend
4. → Deploy to production (Railway/Render)
5. → Configure monitoring and logging
6. → Prepare for Phase 3 (AI chatbot integration)

---

## Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com
- **Alembic Documentation**: https://alembic.sqlalchemy.org
- **uv Documentation**: https://docs.astral.sh/uv
- **Better Auth Documentation**: https://better-auth.com
- **Neon PostgreSQL**: https://neon.tech/docs

**Questions?** Check the [BACKEND_ARCHITECTURE.md](../../../BACKEND_ARCHITECTURE.md) for detailed technical design.
