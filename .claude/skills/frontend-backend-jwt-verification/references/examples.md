# JWT Verification Examples

## Example 1: Basic JWT Verification

### Frontend (Better Auth)

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "https://myapp.com",
      audience: ["https://api.myapp.com"],
    }),
  ],
});
```

### Backend (FastAPI)

```python
# app/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from pydantic import BaseModel
from app.core.config import settings

security = HTTPBearer()

class User(BaseModel):
    id: str
    email: str

async def verify_token(credentials = Depends(security)) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            key=settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
        )
        return User(id=payload["sub"], email=payload.get("email", ""))
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

## Example 2: Bearer Token Flow

### Frontend with Bearer Client

```typescript
// auth-client.ts
import { createAuthClient } from "better-auth/client";
import { bearerClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [bearerClient()],
});

// Generate and use token
const { data } = await authClient.bearer.generate();

// API call with token
fetch("/api/protected", {
  headers: {
    Authorization: `Bearer ${data.accessToken}`,
  },
});
```

### Backend Verification

```python
# app/api/protected.py
from fastapi import APIRouter, Depends
from app.core.auth import verify_token

router = APIRouter()

@router.get("/protected")
async def protected_route(user = Depends(verify_token)):
    return {
        "message": "Access granted",
        "user_id": user.id,
        "email": user.email,
    }
```

## Example 3: User-Scoped Data

### Database Model (SQLAlchemy)

```python
# app/models/task.py
from sqlalchemy import Column, String, Boolean, ForeignKey
from app.db.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    completed = Column(Boolean, default=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
```

### Protected Routes with User Scoping

```python
# app/api/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy import select
from app.db.session import AsyncSession
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse
from app.core.auth import User, verify_token

router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    user: User = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
) -> List[Task]:
    """List only tasks belonging to the authenticated user."""
    result = await db.execute(
        select(Task).where(Task.user_id == user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    user: User = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
) -> Task:
    """Create a task owned by the authenticated user."""
    task = Task(
        user_id=user.id,
        title=task_data.title,
        description=task_data.description,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user: User = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Delete a task only if owned by the authenticated user."""
    result = await db.execute(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == user.id
        )
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    await db.delete(task)
    await db.commit()

    return {"message": "Task deleted"}
```

## Example 4: Token Refresh

### Frontend: Handle 401 and Refresh

```typescript
// lib/api.ts
const MAX_RETRIES = 1;

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const session = await auth.api.getSession();

  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...options.headers,
    },
  });

  if (response.status === 401 && retryCount < MAX_RETRIES) {
    // Try to refresh session
    const refreshed = await auth.refreshSession();
    if (refreshed) {
      return fetchWithAuth(endpoint, options, retryCount + 1);
    }
    // Redirect to login
    await auth.signOut();
    window.location.href = "/sign-in";
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}
```

## Example 5: Multiple Scopes (RBAC)

### Extended JWT Payload

```typescript
// auth.ts
export const auth = betterAuth({
  plugins: [
    jwt({
      algorithm: "HS256",
      expiresIn: "7d",
    }),
  ],
});

// Add scopes when creating token (custom implementation)
function createTokenWithScopes(user, scopes) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      scopes: scopes,
    },
    process.env.BETTER_AUTH_SECRET,
    { algorithm: "HS256", expiresIn: "7d" }
  );
}
```

### FastAPI Scope Verification

```python
# app/core/auth.py
from typing import List
from pydantic import BaseModel, Field


class TokenPayload(BaseModel):
    sub: str
    email: Optional[str] = None
    scopes: List[str] = Field(default_factory=list)


async def verify_token_with_scopes(
    credentials = Depends(security),
    required_scopes: List[str] = [],
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            key=settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        token_data = TokenPayload(**payload)

        # Check scopes
        for scope in required_scopes:
            if scope not in token_data.scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing scope: {scope}",
                )

        return User(id=token_data.sub, email=token_data.email or "")

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


# Usage with scope requirement
def require_scope(*scopes: str):
    async def scope_checker(
        user: User = Depends(verify_token_with_scopes),
    ) -> User:
        token = get_token_from_request()  # Extract token
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])

        if not any(s in payload.get("scopes", []) for s in scopes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return user

    return scope_checker


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user: User = Depends(require_scope("tasks:delete")),
):
    ...
```

## Example 6: Full Stack Integration

### Frontend Component

```typescript
// components/TaskDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskDashboard() {
  const [newTask, setNewTask] = useState("");

  // Fetch tasks
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const session = await auth.api.getSession();
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json() as Promise<Task[]>;
    },
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (title: string) => {
      const session = await auth.api.getSession();
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTask("");
    },
  });

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <div>
      <h1>My Tasks</h1>

      <div>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..."
        />
        <button onClick={() => createTask.mutate(newTask)}>
          Add Task
        </button>
      </div>

      <ul>
        {tasks?.map((task) => (
          <li key={task.id}>
            {task.title} - {task.completed ? "Done" : "Pending"}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Backend API

```python
# app/api/tasks.py
from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy import select, insert
from app.db.session import AsyncSession
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse
from app.core.auth import User, verify_token

router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    current_user: User = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
) -> List[Task]:
    """Get all tasks for the authenticated user."""
    result = await db.execute(
        select(Task).where(Task.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
) -> Task:
    """Create a new task for the authenticated user."""
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task
```
