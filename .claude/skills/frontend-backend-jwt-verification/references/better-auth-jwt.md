# Better Auth JWT Configuration

## Installation

Better Auth includes the JWT plugin in the main package:

```bash
npm install better-auth
```

## Basic Configuration

### Simple JWT Setup

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt(),
  ],
});
```

### Full JWT Configuration

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      algorithm: "HS256",           // HMAC SHA-256 (default)
      expiresIn: "7d",              // Token expiration
      issuer: "https://your-app.com",  // Token issuer
      audience: ["https://api.your-app.com"],  // Expected audience
    }),
  ],
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `algorithm` | string | `"HS256"` | Signing algorithm (HS256, RS256) |
| `expiresIn` | string | `"7d"` | Token validity period |
| `issuer` | string | - | Token issuer claim |
| `audience` | string[] | - | Expected audience(s) |
| `jwks` | object | - | Remote JWKS configuration |

## Bearer Plugin (Optional)

For stateless API authentication, add the bearer plugin:

```typescript
import { betterAuth } from "better-auth";
import { jwt, bearer } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt(),
    bearer({
      expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    }),
  ],
});
```

## Environment Variables

Create `.env.local`:

```env
# Required: Shared secret for signing/verifying tokens
BETTER_AUTH_SECRET=your-32-character-secret-key

# Optional: Cookie configuration
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_COOKIE_NAME=session

# Production settings
BETTER_AUTH_SECURE=true  # HTTPS only cookies
BETTER_AUTH_TRUSTED_HOSTS=your-domain.com
```

## Getting the Token

### Using getSession

```typescript
import { auth } from "@/auth";

async function getToken() {
  const session = await auth.api.getSession();

  if (session?.token) {
    console.log("JWT Token:", session.token);
    return session.token;
  }

  return null;
}
```

### Using Bearer Client

```typescript
// auth-client.ts
import { createAuthClient } from "better-auth/client";
import { bearerClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [bearerClient()],
});

// Generate access token
const { data, error } = await authClient.bearer.generate();

if (data) {
  console.log("Access Token:", data.accessToken);
  console.log("Refresh Token:", data.refreshToken);
}
```

## Token Structure

JWT tokens from Better Auth contain:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704672000,
  "iss": "https://your-app.com",
  "aud": "https://api.your-app.com"
}
```

| Claim | Description |
|-------|-------------|
| `sub` | User ID |
| `email` | User email (if available) |
| `iat` | Issued at timestamp |
| `exp` | Expiration timestamp |
| `iss` | Issuer (configured in jwt plugin) |
| `aud` | Audience (configured in jwt plugin) |

## Client-Side Usage

### Fetch with Authorization Header

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
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

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = "/sign-in";
    }
    const error = await response.json();
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

// Usage examples
const tasks = await authenticatedFetch("/api/tasks");
const task = await authenticatedFetch(`/api/tasks/${taskId}`);
```

### React Query Integration

```typescript
// hooks/useTasks.ts
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/api";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => authenticatedFetch("/api/tasks"),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => authenticatedFetch(`/api/tasks/${taskId}`),
    enabled: !!taskId,
  });
}
```

## Next.js API Routes

```typescript
// app/api/proxy/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession();

  if (!session?.token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const response = await fetch("http://localhost:8000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

## Troubleshooting

### Token not included in session

Ensure JWT plugin is configured and user is signed in:

```typescript
const session = await auth.api.getSession({
  headers: {
    // Required for server-side calls
    cookie: "some-cookie=value",
  },
});
```

### Invalid signature errors

1. Verify `BETTER_AUTH_SECRET` is set
2. Ensure backend uses the same secret
3. Check algorithm matches (HS256)

### Token expired

Implement refresh flow or redirect to login on 401.
