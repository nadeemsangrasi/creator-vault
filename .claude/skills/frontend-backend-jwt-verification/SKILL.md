---
name: frontend-backend-jwt-verification
description: Implement JWT token verification between Next.js Better Auth frontend and FastAPI backend. Use when configuring JWT authentication, setting up Bearer token validation, or implementing cross-service authentication between Better Auth and Python backends.
version: 1.0.0
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
author: Claude Code
tags: [jwt, authentication, better-auth, fastapi, nextjs, python, bearer-token, api-security, session, token-verification]
---

# Frontend-Backend JWT Verification

Implement secure JWT token authentication between Next.js (Better Auth) frontend and FastAPI backend. Verify user identity across services using shared secrets and Bearer tokens.

## Overview

Better Auth issues JWT tokens that FastAPI can verify to authenticate requests. This enables seamless authentication across your Next.js frontend and Python backend without shared session storage.

**Flow:**
1. User logs in → Better Auth creates session + issues JWT
2. Frontend calls API → Sends JWT in Authorization header
3. Backend verifies JWT → Extracts user info, validates signature
4. Backend processes request → Returns user-specific data

## When to Use This Skill

**Activate when:**
- Configuring Better Auth JWT plugin
- Setting up FastAPI JWT authentication
- Creating API clients that send tokens
- Implementing protected FastAPI endpoints
- Connecting Next.js frontend to FastAPI backend

**Trigger keywords:** "better-auth jwt", "fastapi jwt", "frontend backend auth", "bearer token", "token verification", "cross-service auth", "BETTER_AUTH_SECRET"

**NOT for:**
- Single-service authentication only
- OAuth/OIDC provider setup (use provider-specific skills)
- Session-based auth (use cookie session skills)

## Prerequisites

**Frontend (Next.js + Better Auth):**
- Next.js 14+ project
- Better Auth installed
- JWT plugin configured

**Backend (FastAPI):**
- FastAPI installed
- python-jwt or PyJWT library
- Shared secret with frontend

**Both:**
- Environment variables configured
- Consistent JWT algorithm (HS256 recommended)

## Instructions

### Phase 1: Better Auth Configuration

#### Step 1: Install JWT Plugin

**Install:**
```bash
npm install better-auth
# JWT plugin is included in better-auth package
```

**See:** `references/better-auth-jwt.md#installation`

#### Step 2: Configure JWT Plugin

**Create/Update `auth.ts`:**
```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "https://your-domain.com",
      audience: ["https://api.your-domain.com"],
    }),
  ],
});
```

**Critical:** Set `BETTER_AUTH_SECRET` environment variable - same value on frontend and backend.

**See:** `references/better-auth-jwt.md#configuration`

#### Step 3: Configure Bearer Plugin (Optional)

For stateless API authentication:
```typescript
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt(),
    bearer({
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    }),
  ],
});
```

**See:** `references/better-auth-jwt.md#bearer`

### Phase 2: Frontend API Client

#### Step 4: Create Authenticated API Client

**Using fetch with Bearer token:**
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await auth.api.getSession();

  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

// Usage
const tasks = await authFetch("/api/tasks");
```

**See:** `references/frontend-client.md#fetch`

#### Step 5: Use Better Auth Client Plugin

**Client configuration:**
```typescript
// auth-client.ts
import { createAuthClient } from "better-auth/client";
import { bearerClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [bearerClient()],
});

// Generate Bearer token
const { data } = await authClient.bearer.generate();

// Use in API calls
fetch("/api/protected", {
  headers: {
    Authorization: `Bearer ${data.accessToken}`,
  },
});
```

**See:** `references/frontend-client.md#client-plugin`

### Phase 3: FastAPI Backend Setup

#### Step 6: Install JWT Library

```bash
pip install python-jwt
# Or
pip install PyJWT
```

**See:** `references/fastapi-jwt.md#installation`

#### Step 7: Create JWT Verification Dependency

**Create `app/core/auth.py`:**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import jwt

security = HTTPBearer()

class TokenPayload(BaseModel):
    sub: str; email: str | None = None
    exp: int; iat: int; iss: str; aud: str | list[str]

class User(BaseModel):
    id: str; email: str; is_active: bool = True

async def verify_jwt_token(
    credentials=Depends(security)
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            key=settings.JWT_SECRET_KEY,
            algorithms=["HS256"],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
        )
        return User(id=payload["sub"], email=payload.get("email"))
    except jwt.PyJWTError as e:
        raise HTTPException(401, detail=f"Invalid token: {e}")
```

**See:** `references/fastapi-jwt.md#verification`

#### Step 8: Create Current User Dependency

```python
from app.core.auth import verify_jwt_token, User

async def get_current_user(user=Depends(verify_jwt_token)) -> User:
    if not user.is_active:
        raise HTTPException(403, detail="User disabled")
    return user
```

**See:** `references/fastapi-jwt.md#current-user`

### Phase 4: Protect API Endpoints

#### Step 9: Create Protected Routes

**Create `app/api/tasks.py`:**
```python
from fastapi import APIRouter, Depends
from typing import List
from app.core.user import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
async def list_tasks(current_user=Depends(get_current_user)):
    return await Task.filter(user_id=current_user.id).all()

@router.post("/", response_model=TaskResponse)
async def create_task(task_data: TaskCreate, current_user=Depends(get_current_user)):
    task = Task(user_id=current_user.id, **task_data.dict())
    await task.save()
    return task

@router.get("/{task_id}")
async def get_task(task_id: str, current_user=Depends(get_current_user)):
    task = await Task.get(id=task_id)
    if task.user_id != current_user.id:
        raise HTTPException(404, detail="Task not found")
    return task
```

**See:** `references/fastapi-jwt.md#protected-routes`

#### Step 10: Add to Main App

```python
from fastapi import FastAPI
from app.api.tasks import router as tasks_router

app = FastAPI(title="Task API")
app.include_router(tasks_router)
```

### Phase 5: Shared Secret Configuration

#### Step 11: Environment Variables

**Frontend `.env.local`:**
```env
BETTER_AUTH_SECRET=your-32-character-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend `.env`:**
```env
JWT_SECRET_KEY=your-32-character-secret-key
JWT_ALGORITHM=HS256
JWT_ISSUER=https://your-domain.com
JWT_AUDIENCE=https://api.your-domain.com
```

**Important:** Both services must use the **same secret key**.

**See:** `references/shared-secret.md`

## Common Patterns

### Pattern 1: Basic JWT Verification
**Quick:** Better Auth JWT → FastAPI dependency

**See:** `references/examples.md#basic-verification`

### Pattern 2: Bearer Token Flow
**Quick:** Generate access token on client → Send in header → Verify on server

**See:** `references/examples.md#bearer-flow`

### Pattern 3: User-Scoped Data
**Quick:** Filter database queries by user ID from token

**See:** `references/examples.md#user-scoped`

### Pattern 4: Token Refresh
**Quick:** Handle expired tokens gracefully

**See:** `references/examples.md#token-refresh`

### Pattern 5: Multiple Scopes
**Quick:** Add role-based access control

**See:** `references/examples.md#scopes`

## Project Structure Reference

```
project/
├── frontend/                    # Next.js
│   ├── .env.local
│   ├── auth.ts                 # Better Auth config
│   ├── lib/
│   │   └── api.ts              # Authenticated fetch
│   └── app/
│       └── api/
│           └── route.ts        # API routes
│
└── backend/                    # FastAPI
    ├── .env
    ├── app/
    │   ├── main.py
    │   ├── core/
    │   │   ├── auth.py         # JWT verification
    │   │   └── user.py         # Current user dep
    │   ├── api/
    │   │   └── tasks.py        # Protected routes
    │   ├── models/
    │   │   └── task.py
    │   └── schemas/
    │       └── task.py
    └── requirements.txt
```

**See:** `references/project-structure.md`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/missing token | Check Authorization header |
| 403 Forbidden | User disabled | Check user status |
| 400 Invalid signature | Wrong secret | Verify JWT_SECRET_KEY |
| 401 Token expired | Token too old | Implement refresh flow |
| 400 Wrong issuer | Issuer mismatch | Check issuer config |

**See:** `references/troubleshooting.md`

## Best Practices

1. **Shared secret** - Same value on both services
2. **HTTPS only** - Never send tokens over HTTP
3. **Short expiry** - 7 days for web is reasonable
4. **Secure storage** - Cookies (httponly) or memory
5. **Error handling** - Graceful token expiry
6. **User scoping** - Filter all queries by user ID
7. **Audit logging** - Log authentication events

## Validation Checklist

**Better Auth:**
- [ ] JWT plugin configured
- [ ] BETTER_AUTH_SECRET set
- [ ] Issuer/audience configured

**Frontend:**
- [ ] API client sends Bearer token
- [ ] Token extracted from session
- [ ] Error handling for 401

**FastAPI:**
- [ ] JWT dependency created
- [ ] Shared secret configured
- [ ] Endpoints protected with Depends
- [ ] User ID extracted from token

## Quick Commands

**Frontend:**
```bash
# Get session and token
const session = await auth.api.getSession()
const token = session?.token
```

**Backend:**
```bash
# Install dependencies
pip install python-jwt fastapi
```

**Testing:**
```bash
# Verify token manually
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/tasks
```

## References

**Local Documentation:**
- Better Auth JWT: `references/better-auth-jwt.md`
- Frontend client: `references/frontend-client.md`
- FastAPI JWT: `references/fastapi-jwt.md`
- Shared secret: `references/shared-secret.md`
- Examples: `references/examples.md`
- Troubleshooting: `references/troubleshooting.md`
- Project structure: `references/project-structure.md`

**External Resources:**
- [Better Auth JWT Plugin](https://www.better-auth.com/docs/plugins/jwt)
- [Better Auth Bearer Plugin](https://www.better-auth.com/docs/plugins/bearer)
- [FastAPI Security Tutorial](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT.io](https://jwt.io)

## Tips for Success

1. **Test token generation** - Use jwt.io to decode and verify
2. **Match algorithms** - Both must use HS256 (or same)
3. **Shared secret** - Use same key everywhere
4. **Debug with logs** - Print decoded payload during dev
5. **Handle 401 gracefully** - Redirect to login
6. **User ID consistency** - Use same ID format in both services
7. **Refresh tokens** - Plan for token expiry

## Version History

**v1.0.0 (2026-01-01)** - Initial release with Better Auth JWT configuration, FastAPI verification dependencies, Bearer token flow, user-scoped data filtering, and Context7 MCP integration

## Sources

- [Better Auth Documentation](https://www.better-auth.com)
- [Better Auth JWT Plugin](https://www.better-auth.com/docs/plugins/jwt)
- [FastAPI Security Tutorial](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT.io](https://jwt.io)
- [Better Auth on Context7](https://context7.com/better-auth/better-auth)
- [FastAPI on Context7](https://context7.com/fastapi/fastapi)
