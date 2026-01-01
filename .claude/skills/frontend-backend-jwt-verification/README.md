# Frontend-Backend JWT Verification

A comprehensive Claude Code skill for implementing JWT token authentication between Next.js (Better Auth) frontend and FastAPI backend. Verify user identity across services using shared secrets and Bearer tokens.

## Overview

This skill provides a complete implementation guide for JWT-based authentication:

- **Better Auth (Frontend)**: Issues JWT tokens on user login
- **FastAPI (Backend)**: Verifies JWT tokens on API requests
- **Shared Secret**: Both services use the same key for signing/verification

### Authentication Flow

```
1. User logs in on Frontend
   → Better Auth creates session + issues JWT token

2. Frontend makes API call
   → Sends JWT in Authorization: Bearer <token> header

3. Backend receives request
   → Extracts token from header, verifies signature using shared secret

4. Backend identifies user
   → Decodes token to get user ID, email, etc.

5. Backend filters data
   → Returns only data belonging to authenticated user
```

## Features

### Better Auth Configuration
- JWT plugin setup with algorithm, expiry, issuer, audience
- Bearer token support for stateless API authentication
- Session token retrieval for API calls

### Frontend API Client
- Authenticated fetch wrapper
- React Query integration
- Error handling with automatic sign-out

### FastAPI Authentication
- JWT verification dependency
- Current user extraction
- Protected route decorators
- Scope-based access control

### Shared Secret Management
- Environment variable configuration
- Secret generation script
- Security best practices

## Installation

```bash
# Copy to project skills
cp -r frontend-backend-jwt-verification /path/to/project/.claude/skills/

# Or copy to global skills
cp -r frontend-backend-jwt-verification ~/.claude/skills/
```

## Usage

### Activation

The skill activates with trigger keywords:
- "better-auth jwt"
- "fastapi jwt"
- "frontend backend auth"
- "bearer token"
- "token verification"
- "cross-service auth"
- "BETTER_AUTH_SECRET"

### Example Prompts

**Basic Setup:**
- "Configure JWT plugin in Better Auth"
- "Set up JWT verification in FastAPI"
- "Create authenticated API client in Next.js"

**Implementation:**
- "Protect FastAPI endpoints with JWT"
- "Send Bearer token from frontend to backend"
- "Filter database queries by user ID"

**Troubleshooting:**
- "Fix invalid signature error"
- "Token not included in session"
- "401 Unauthorized on API calls"

## Documentation Structure

```
frontend-backend-jwt-verification/
├── SKILL.md (507 lines)              # Main workflow
├── README.md                          # This file
├── references/
│   ├── better-auth-jwt.md            # Better Auth JWT config
│   ├── frontend-client.md            # Frontend API patterns
│   ├── fastapi-jwt.md                # FastAPI verification
│   ├── shared-secret.md              # Secret configuration
│   ├── examples.md                   # Complete examples
│   ├── troubleshooting.md            # Common issues
│   └── project-structure.md          # Directory layouts
├── assets/
│   └── templates/
│       ├── auth.ts                   # Better Auth config
│       ├── api.ts                    # Authenticated fetch
│       ├── .env.local                # Frontend env template
│       ├── config.py                 # FastAPI settings
│       ├── auth.py                   # JWT verification
│       ├── .env                      # Backend env template
│       └── requirements.txt          # Python dependencies
└── scripts/
    └── generate-secrets.sh           # Secret generator
```

## Key Concepts

### JWT Token Structure

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704672000,
  "iss": "https://your-domain.com",
  "aud": "https://api.your-domain.com"
}
```

### Bearer Token Flow

```typescript
// Frontend: Get session and token
const session = await auth.api.getSession();
const token = session?.token;

// Send in API call
fetch("/api/tasks", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

```python
# Backend: Verify token
from fastapi import Depends
from fastapi.security import HTTPBearer

async def get_current_user(token = Depends(HTTPBearer())):
    payload = jwt.decode(token.credentials, SECRET, algorithms=["HS256"])
    return payload["sub"]
```

### User-Scoped Data

All database queries should filter by the authenticated user's ID:

```python
@router.get("/tasks")
async def list_tasks(user_id = Depends(get_current_user)):
    tasks = await Task.filter(user_id=user_id).all()
    return tasks
```

## Common Use Cases

### Task Management API
- User-specific task lists
- Create/read/update/delete own tasks only
- React Query hooks for frontend

### Protected Endpoints
- JWT verification middleware
- Automatic 401 handling
- Redirect to login on expiry

### Multi-Service Auth
- Single sign-on across services
- Stateless authentication
- No shared session storage

## Integration with Other Skills

### With better-auth-nextjs
- JWT plugin is part of Better Auth configuration
- Extends auth capabilities to FastAPI backend

### With scaffolding-fastapi
- JWT verification integrates with FastAPI endpoints
- Use as authentication layer for FastAPI projects

### With docker-containerization
- Containerize both frontend and backend
- Share secret via environment variables

## Best Practices

1. **Shared secret** - Use the same value in both frontend and backend
2. **HTTPS only** - Never transmit tokens over HTTP
3. **Secure storage** - Store tokens in httpOnly cookies or memory
4. **Reasonable expiry** - 7 days is common for web applications
5. **User scoping** - Always filter queries by authenticated user ID
6. **Error handling** - Handle 401 gracefully with redirect to login
7. **Audit logging** - Log authentication events for security

## Tools Covered

**Frontend:**
- Better Auth JWT plugin
- Bearer client plugin
- React Query integration

**Backend:**
- FastAPI security
- python-jwt / PyJWT
- Dependency injection

**Utilities:**
- Secret generator script
- Token decoder
- Environment configuration

## Requirements

**Frontend:**
- Next.js 14+
- Better Auth installed
- JWT plugin configured

**Backend:**
- FastAPI installed
- python-jwt or PyJWT
- Shared secret configuration

**Knowledge:**
- JWT token structure
- HTTP Bearer authentication
- Environment variables

## Resources

**Official Documentation:**
- [Better Auth JWT Plugin](https://www.better-auth.com/docs/plugins/jwt)
- [FastAPI Security Tutorial](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT.io](https://jwt.io)

**Local Documentation:**
- Better Auth JWT: `references/better-auth-jwt.md`
- FastAPI JWT: `references/fastapi-jwt.md`
- Examples: `references/examples.md`
- Troubleshooting: `references/troubleshooting.md`

## Version History

**v1.0.0 (2026-01-01)**
- Initial release
- Better Auth JWT configuration
- FastAPI verification dependencies
- Bearer token flow
- User-scoped data filtering
- Secret generation script
- Progressive disclosure structure (507 lines)

## Support

- [Better Auth Discord](https://discord.gg/better-auth)
- [FastAPI Discussions](https://github.com/tiangolo/fastapi/discussions)

## Contributing

Improvements welcome! Please ensure:
- SKILL.md stays under 500 lines
- Examples follow modern best practices
- Templates are production-ready
- References are accurate

---

**Created with:** Claude Code + skill-creator + Context7 MCP
**Documentation Quality:** Production-ready
**Maintenance:** Self-contained, version 1.0.0
