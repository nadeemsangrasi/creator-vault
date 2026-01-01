# JWT Verification Troubleshooting

## Frontend Issues

### Token not included in session

**Symptoms:** `session.token` is undefined

**Causes:**
1. JWT plugin not configured
2. User not signed in
3. Session not loaded yet

**Solutions:**
```typescript
// Check if JWT plugin is configured
const session = await auth.api.getSession({
  headers: {
    // Required for server-side
    cookie: "session=...",
  },
});

console.log("Session:", session);
console.log("Token:", session?.token);
```

### 401 Unauthorized on API calls

**Symptoms:** API calls return 401 even after login

**Causes:**
1. Token not sent in header
2. Token expired
3. Backend using different secret

**Solutions:**
```typescript
// Verify token is being sent
const session = await auth.api.getSession();
console.log("Token:", session?.token);

// Check token format
if (session?.token) {
  const parts = session.token.split(".");
  console.log("Token parts:", parts.length); // Should be 3
}
```

### Session not persisting

**Symptoms:** User logged out on page refresh

**Causes:**
1. Cookie not set
2. Session storage issue

**Solutions:**
```typescript
// Ensure cookies are configured
export const auth = betterAuth({
  // ... other config
  advanced: {
    cookiePrefix: "better-auth",
  },
});
```

## Backend Issues

### Invalid signature error

**Error:** `jwt.exceptions.InvalidSignatureError`

**Causes:**
1. JWT_SECRET_KEY doesn't match BETTER_AUTH_SECRET
2. Key has trailing/leading whitespace
3. Different algorithms used

**Solutions:**
```python
# Check environment variables
import os
print("JWT_SECRET_KEY:", os.getenv("JWT_SECRET_KEY"))
print("Length:", len(os.getenv("JWT_SECRET_KEY", "")))

# Ensure no whitespace
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "").strip()
```

### Issuer mismatch

**Error:** `jwt.exceptions.InvalidIssuerError`

**Solutions:**
```python
# Verify issuer configuration
# Frontend
jwt({
  issuer: "https://myapp.com",
})

# Backend
settings.JWT_ISSUER = "https://myapp.com"  # Must match exactly
```

### Audience mismatch

**Error:** `jwt.exceptions.InvalidAudienceError`

**Solutions:**
```python
# Verify audience configuration
# Frontend
jwt({
  audience: ["https://api.myapp.com"],
})

# Backend
settings.JWT_AUDIENCE = "https://api.myapp.com"  # Must match
```

### Algorithm not allowed

**Error:** `jwt.exceptions.AlgorithmNotAllowedError`

**Solutions:**
```python
# Ensure algorithm is in allowed list
payload = jwt.decode(
    token,
    key=settings.JWT_SECRET_KEY,
    algorithms=[settings.JWT_ALGORITHM],  # Must be same as signing
    options={"verify_aud": settings.JWT_AUDIENCE is not None}
)
```

### Token expired

**Error:** `jwt.exceptions.ExpiredSignatureError`

**Solutions:**
```python
# Handle expired token gracefully
from fastapi import HTTPException, status

try:
    payload = jwt.decode(...)
except jwt.ExpiredSignatureError:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Signature verification failed" | Wrong secret | Match JWT_SECRET_KEY with BETTER_AUTH_SECRET |
| "Token has expired" | Token too old | Implement refresh or re-login |
| "Invalid issuer" | Issuer mismatch | Match issuer config |
| "Invalid audience" | Audience mismatch | Match audience config |
| "Missing subject claim" | Malformed token | Check token structure |
| "Credentials not provided" | No Authorization header | Add Bearer token to request |
| "Could not validate credentials" | Invalid token | Check token format/expiry |

## Debugging Tools

### Decode JWT Token

**Frontend (Node.js):**
```javascript
const jwt = require('jsonwebtoken');

// Decode without verification
const decoded = jwt.decode('your-token-here');
console.log(JSON.stringify(decoded, null, 2));
```

**Backend (Python):**
```python
import jwt

# Decode without verification
decoded = jwt.decode('your-token-here', options={"verify_signature": False})
print(decoded)
```

### Verify Token Manually

**Test with curl:**
```bash
# Get token from frontend console
# Then test backend endpoint
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/tasks

# Expected: 200 with task data
# If 401: Check error message
```

### Log Token Details

**Frontend:**
```typescript
// Add to API client
const session = await auth.api.getSession();
if (session?.token) {
  const parts = session.token.split('.');
  console.log('Token header:', atob(parts[0]));
  console.log('Token payload:', atob(parts[1]));
}
```

**Backend:**
```python
# Add to verification dependency
import jwt

payload = jwt.decode(token, options={"verify_signature": False})
print("Decoded payload:", payload)
```

## Environment Variables Checklist

### Frontend (.env.local)
```env
BETTER_AUTH_SECRET=32+ character secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
JWT_SECRET_KEY=Same 32+ character secret
JWT_ALGORITHM=HS256
JWT_ISSUER=https://your-domain.com
JWT_AUDIENCE=https://api.your-domain.com
```

### Verification Steps
```bash
# Compare secrets
echo "Frontend: $BETTER_AUTH_SECRET"
echo "Backend: $JWT_SECRET_KEY"

# Should be identical
diff <(echo $BETTER_AUTH_SECRET) <(echo $JWT_SECRET_KEY)
```

## Request/Response Flow Debug

### Frontend Request
```typescript
// Log request details
async function authFetch(endpoint, options = {}) {
  const session = await auth.api.getSession();

  console.log("Token:", session?.token?.substring(0, 20) + "...");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session?.token}`,
      ...options.headers,
    },
  });

  console.log("Response:", response.status, response.statusText);

  return response;
}
```

### Backend Verification
```python
# Add logging to dependency
async def verify_jwt_token(credentials = Depends(security)):
    token = credentials.credentials
    print(f"Received token: {token[:20]}...")

    try:
        payload = jwt.decode(
            token,
            key=settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        print("Decoded payload:", payload)
        return payload
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise
```
