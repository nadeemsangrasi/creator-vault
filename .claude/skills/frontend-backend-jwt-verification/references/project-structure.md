# Project Structure Reference

## Full Stack Project Layout

```
project/
├── frontend/                          # Next.js with Better Auth
│   ├── .env.local                     # Environment variables
│   ├── auth.ts                        # Better Auth configuration
│   ├── auth-client.ts                 # Client with bearer plugin
│   ├── lib/
│   │   ├── api.ts                     # Authenticated fetch wrapper
│   │   ├── axios.ts                   # Axios interceptor
│   │   └── utils.ts                   # Utility functions
│   ├── hooks/
│   │   ├── useApi.ts                  # React Query hooks
│   │   └── useAuth.ts                 # Authentication hooks
│   ├── components/
│   │   ├── TaskList.tsx
│   │   └── TaskForm.tsx
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       └── proxy/
│   │           └── route.ts           # API proxy routes
│   └── package.json
│
├── backend/                           # FastAPI
│   ├── .env                           # Environment variables
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                    # FastAPI app entry
│   │   ├── __init__.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Settings
│   │   │   ├── auth.py                # JWT verification
│   │   │   └── user.py                # Current user dependency
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── tasks.py               # Task routes
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── task.py                # Task model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── task.py                # Pydantic schemas
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # SQLAlchemy base
│   │   │   └── session.py             # Database session
│   │   └── deps.py                    # Dependencies
│   └── tests/
│       ├── __init__.py
│       └── test_auth.py
│
└── docker/
    ├── frontend/
    │   ├── Dockerfile
    │   └── .dockerignore
    ├── backend/
    │   ├── Dockerfile
    │   └── .dockerignore
    └── docker-compose.yml
```

## Frontend Structure

### Key Files

**auth.ts (Better Auth configuration):**
```typescript
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

**lib/api.ts (API client):**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const session = await auth.api.getSession();

  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

## Backend Structure

### Key Files

**app/core/config.py:**
```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "https://myapp.com"
    JWT_AUDIENCE: str = "https://api.myapp.com"
    DATABASE_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
```

**app/core/auth.py:**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from pydantic import BaseModel

security = HTTPBearer()


class TokenPayload(BaseModel):
    sub: str
    email: str | None = None
    exp: int
    iat: int
    iss: str
    aud: str | list[str]


class User(BaseModel):
    id: str
    email: str


async def verify_jwt_token(
    credentials=Depends(security),
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            key=settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
        )
        return User(**payload)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

**app/api/tasks.py:**
```python
from fastapi import APIRouter, Depends
from typing import List
from app.core.auth import User, verify_jwt_token
from app.models.task import Task
from app.schemas.task import TaskResponse, TaskCreate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    current_user: User = Depends(verify_jwt_token),
) -> List[Task]:
    return await Task.filter(user_id=current_user.id).all()


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(verify_jwt_token),
) -> Task:
    task = Task(user_id=current_user.id, **task_data.dict())
    await task.save()
    return task
```

## Environment Files

### Frontend .env.local
```env
# Required
BETTER_AUTH_SECRET=your-32-character-secret-key

# Optional
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECURE=true
```

### Backend .env
```env
# Required (must match BETTER_AUTH_SECRET)
JWT_SECRET_KEY=your-32-character-secret-key

# Configuration (must match Better Auth)
JWT_ALGORITHM=HS256
JWT_ISSUER=https://myapp.com
JWT_AUDIENCE=https://api.myapp.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/app
```

## Docker Structure

### Frontend Dockerfile
```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=production /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
```

### Backend Dockerfile
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base
WORKDIR /app

FROM base AS deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS production
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
RUN useradd -m appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - JWT_ISSUER=https://myapp.com
      - JWT_AUDIENCE=https://api.myapp.com
      - DATABASE_URL=postgresql://db:5432/app
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql

volumes:
  postgres-data:
```
