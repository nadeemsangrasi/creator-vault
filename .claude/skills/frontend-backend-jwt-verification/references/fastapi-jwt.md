# FastAPI JWT Authentication

## Installation

```bash
pip install python-jwt
# Or
pip install PyJWT
```

For cryptography (for RS256):
```bash
pip install cryptography
```

## Basic Setup

### Environment Variables

Create `.env`:

```env
# Must match BETTER_AUTH_SECRET on frontend
JWT_SECRET_KEY=your-32-character-secret-key
JWT_ALGORITHM=HS256
JWT_ISSUER=https://your-domain.com
JWT_AUDIENCE=https://api.your-domain.com
```

### Config Module

```python
# app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "https://your-domain.com"
    JWT_AUDIENCE: str = "https://api.your-domain.com"
    DATABASE_URL: str

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

## JWT Verification

### Token Payload Model

```python
# app/core/auth.py
from typing import Optional, List
from pydantic import BaseModel


class TokenPayload(BaseModel):
    """JWT token payload structure"""
    sub: str  # User ID
    email: Optional[str] = None
    exp: int  # Expiration timestamp
    iat: int  # Issued at timestamp
    iss: str  # Issuer
    aud: str | List[str]  # Audience
    scopes: List[str] = []  # Optional: for RBAC
```

### User Model

```python
# app/core/auth.py
from pydantic import BaseModel


class User(BaseModel):
    """User extracted from JWT"""
    id: str
    email: str
    is_active: bool = True
    is_superuser: bool = False
```

### JWT Verification Dependency

```python
# app/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings
from app.core.auth import TokenPayload, User

security = HTTPBearer()


async def verify_jwt_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Verify JWT token from Authorization header and return user.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            key=settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
        )

        token_data = TokenPayload(**payload)

        # Validate required claims
        if not token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create user from token data
        return User(
            id=token_data.sub,
            email=token_data.email or "",
        )

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

## Current User Dependency

```python
# app/core/user.py
from fastapi import Depends, HTTPException, status
from app.core.auth import verify_jwt_token, User


async def get_current_user(
    user: User = Depends(verify_jwt_token)
) -> User:
    """
    Get the current authenticated user.
    Use this dependency in protected endpoints.
    """
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    return user


async def get_current_active_user(
    user: User = Depends(get_current_user)
) -> User:
    """
    Alias for get_current_user with explicit name.
    """
    return user
```

## Protected Routes

### Basic Protected Endpoint

```python
# app/api/tasks.py
from fastapi import APIRouter, Depends
from typing import List
from app.core.user import get_current_user
from app.models.task import Task
from app.schemas.task import TaskResponse, TaskCreate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    current_user: User = Depends(get_current_user)
) -> List[Task]:
    """
    List all tasks for the authenticated user.
    """
    tasks = await Task.filter(user_id=current_user.id).all()
    return tasks


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user)
) -> Task:
    """
    Create a new task for the authenticated user.
    """
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
    )
    await task.save()
    return task
```

### Detailed Example with Error Handling

```python
# app/api/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    completed: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
) -> List[Task]:
    """
    List tasks for the current user.
    Optionally filter by completion status.
    """
    query = Task.filter(user_id=current_user.id)

    if completed is not None:
        query = query.filter(completed=completed)

    tasks = await query.order_by("-created_at").all()
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
) -> Task:
    """
    Get a specific task owned by the current user.
    Returns 404 if task doesn't exist or doesn't belong to user.
    """
    task = await Task.get_or_none(id=task_id, user_id=current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user)
) -> Task:
    """
    Update a task owned by the current user.
    """
    task = await Task.get_or_none(id=task_id, user_id=current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = datetime.utcnow()
    await task.save()

    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Delete a task owned by the current user.
    """
    task = await Task.get_or_none(id=task_id, user_id=current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    await task.delete()

    return {"message": "Task deleted successfully"}
```

## Scopes for RBAC

### Extended Token Payload

```python
# app/core/auth.py
from typing import List
from pydantic import BaseModel, Field


class TokenPayload(BaseModel):
    sub: str
    email: Optional[str] = None
    exp: int
    iat: int
    iss: str
    aud: str | List[str]
    scopes: List[str] = Field(default_factory=list)
```

### Scope-Based Access

```python
# app/core/auth.py
from fastapi import HTTPException, status


class ScopeChecker:
    def __init__(self, required_scopes: List[str]):
        self.required_scopes = required_scopes

    async def __call__(self, user: User = Depends(verify_jwt_token)) -> User:
        # In a real implementation, you'd extract scopes from the token
        # and check against required_scopes
        # This is a simplified example
        token_scopes = []  # Extract from token

        for scope in self.required_scopes:
            if scope not in token_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required scope: {scope}",
                )

        return user


def require_scopes(*scopes: str):
    return ScopeChecker(list(scopes))


# Usage
@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(require_scopes("tasks:delete"))
) -> dict:
    ...
```

## Main App Setup

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.tasks import router as tasks_router
from app.core.config import settings

app = FastAPI(
    title="Task API",
    description="API with JWT authentication",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Testing

### Test Token Verification

```python
# tests/test_auth.py
from fastapi.testclient import TestClient
from jose import jwt
from app.main import app
from app.core.config import settings

client = TestClient(app)


def create_test_token(user_id: str = "test-user") -> str:
    """Create a test JWT token."""
    payload = {
        "sub": user_id,
        "email": "test@example.com",
        "iat": 1704067200,
        "exp": 9999999999,
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def test_unauthorized():
    """Test that endpoints require authentication."""
    response = client.get("/api/tasks/")
    assert response.status_code == 403


def test_authorized():
    """Test that authenticated requests work."""
    token = create_test_token()
    response = client.get(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
```
