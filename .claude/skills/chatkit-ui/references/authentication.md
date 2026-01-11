# ChatKit Authentication Guide

## Overview

ChatKit authentication is session-based using client secrets. Your backend creates sessions, and ChatKit uses them to communicate with OpenAI APIs securely.

## Authentication Flow

```
User requests chat
    ↓
Frontend calls /api/chatkit/session
    ↓
Backend creates ChatKit session with user context
    ↓
Backend returns client_secret
    ↓
Frontend passes client_secret to ChatKit
    ↓
ChatKit authenticates all requests with secret
    ↓
Session expires after TTL
    ↓
Frontend calls /api/chatkit/refresh
    ↓
Backend creates new session
    ↓
Process repeats
```

## Backend Session Endpoint

### Basic Implementation

```typescript
// /api/chatkit/session
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  // Verify user is authenticated
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create ChatKit session
    const session = await openai.chatkit.sessions.create({
      user_id: user.id,
      model: 'gpt-4o',
    });

    return Response.json({
      client_secret: session.client_secret,
      expires_at: session.expires_at,
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return Response.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

### With User Context

```typescript
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const session = await openai.chatkit.sessions.create({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      metadata: {
        subscription_tier: user.tier,
        organization: user.org_id,
        region: req.headers.get('x-region') || 'us-east-1',
      },
    });

    return Response.json({ client_secret: session.client_secret });
  } catch (error) {
    console.error('Session error:', error);
    return Response.json({ error: 'Session failed' }, { status: 500 });
  }
}
```

## Token Refresh Endpoint

### Basic Refresh

```typescript
// /api/chatkit/refresh
export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return Response.json({ error: 'Token required' }, { status: 400 });
  }

  try {
    // Create new session when token expires
    const user = await getSessionUser(req);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newSession = await openai.chatkit.sessions.create({
      user_id: user.id,
    });

    return Response.json({
      client_secret: newSession.client_secret,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return Response.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
```

## Frontend Configuration

### Basic Setup

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      if (!res.ok) throw new Error('Session failed');
      const { client_secret } = await res.json();
      return client_secret;
    },
  },
});
```

### With Token Refresh

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      if (existing) {
        try {
          // Try to refresh existing token
          const res = await fetch('/api/chatkit/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: existing }),
          });

          if (res.ok) {
            const { client_secret } = await res.json();
            return client_secret;
          }
        } catch (error) {
          console.warn('Token refresh failed, creating new session');
        }
      }

      // Create new session if refresh fails or no existing token
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      if (!res.ok) throw new Error('Session creation failed');
      const { client_secret } = await res.json();
      return client_secret;
    },
  },
});
```

## Security Best Practices

### 1. Protect Session Endpoints

```typescript
// Verify authentication before creating session
async function protectedEndpoint(req: Request) {
  const user = await verifyAuth(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Continue with session creation
}
```

### 2. Use HTTPS Only

```typescript
// Reject non-HTTPS requests in production
if (process.env.NODE_ENV === 'production' && req.url.protocol !== 'https:') {
  return Response.json({ error: 'HTTPS required' }, { status: 403 });
}
```

### 3. Validate User Input

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request format
    if (typeof body !== 'object') {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Continue with session creation
  } catch (error) {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
```

### 4. Rate Limit Session Creation

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60s'),
});

export async function POST(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit per user
  const { limit, reset, pending, success } = await ratelimit.limit(user.id);

  if (!success) {
    return Response.json(
      { error: 'Too many requests', retryAfter: reset },
      { status: 429, headers: { 'Retry-After': String(reset) } }
    );
  }

  // Create session
  const session = await openai.chatkit.sessions.create({ user_id: user.id });
  return Response.json({ client_secret: session.client_secret });
}
```

### 5. Log Authentication Events

```typescript
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  try {
    const session = await openai.chatkit.sessions.create({ user_id: user.id });

    // Log successful session creation
    await logAuthEvent({
      type: 'SESSION_CREATED',
      user_id: user.id,
      timestamp: new Date(),
      ip: req.headers.get('x-forwarded-for'),
    });

    return Response.json({ client_secret: session.client_secret });
  } catch (error) {
    // Log failed attempt
    await logAuthEvent({
      type: 'SESSION_FAILED',
      user_id: user.id,
      error: error instanceof Error ? error.message : 'Unknown',
      timestamp: new Date(),
      ip: req.headers.get('x-forwarded-for'),
    });

    throw error;
  }
}
```

## Session Management

### Session Storage

```typescript
// Store in localStorage (simple case)
localStorage.setItem('chatkit_session', JSON.stringify({
  client_secret: secret,
  created_at: Date.now(),
  expires_at: expiryTime,
}));

// Or in sessionStorage (more secure, cleared on tab close)
sessionStorage.setItem('chatkit_session', JSON.stringify({
  client_secret: secret,
  expires_at: expiryTime,
}));
```

### Session Expiry Handling

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      const stored = JSON.parse(
        sessionStorage.getItem('chatkit_session') || '{}'
      );

      // Check if token is expired
      if (stored.expires_at && Date.now() > stored.expires_at) {
        sessionStorage.removeItem('chatkit_session');
        existing = null;
      }

      if (existing) {
        // Token still valid, try refresh
        const res = await fetch('/api/chatkit/refresh', {
          method: 'POST',
          body: JSON.stringify({ token: existing }),
        });

        if (res.ok) {
          const { client_secret } = await res.json();
          sessionStorage.setItem('chatkit_session', JSON.stringify({
            client_secret,
            expires_at: Date.now() + 3600000, // 1 hour
          }));
          return client_secret;
        }
      }

      // Create new session
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      const { client_secret } = await res.json();

      sessionStorage.setItem('chatkit_session', JSON.stringify({
        client_secret,
        expires_at: Date.now() + 3600000,
      }));

      return client_secret;
    },
  },
});
```

## Error Handling

### Session Creation Errors

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      try {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });

        if (res.status === 401) {
          // User not authenticated
          window.location.href = '/login';
          throw new Error('Authentication required');
        }

        if (res.status === 429) {
          // Rate limited
          const data = await res.json();
          throw new Error(`Too many requests. Retry after ${data.retryAfter}s`);
        }

        if (!res.ok) {
          throw new Error(`Session creation failed: ${res.statusText}`);
        }

        const { client_secret } = await res.json();
        return client_secret;
      } catch (error) {
        console.error('Session error:', error);
        throw error;
      }
    },
  },
  onError: ({ error }) => {
    if (error.message?.includes('401')) {
      // Handle unauthorized
      window.location.href = '/login';
    }
  },
});
```

## Testing

### Mock Session Creation

```typescript
// In tests
jest.mock('fetch');

beforeEach(() => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({
      client_secret: 'test_secret_123',
    }),
  });
});

test('creates session on mount', async () => {
  const { result } = renderHook(() => useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
  }));

  await waitFor(() => {
    expect(result.current.control).toBeDefined();
  });
});
```

## Common Issues

### Issue: "Invalid client_secret"

**Cause:** Session endpoint returning wrong format or invalid secret

**Solution:**
```typescript
// Verify response includes client_secret
const data = await res.json();
console.log('Response:', data);
if (!data.client_secret) {
  throw new Error('Missing client_secret in response');
}
```

### Issue: "Session expired"

**Cause:** Token TTL exceeded

**Solution:**
```typescript
// Implement proper refresh logic
async getClientSecret(existing) {
  if (existing) {
    try {
      const res = await fetch('/api/chatkit/refresh', {
        method: 'POST',
        body: JSON.stringify({ token: existing }),
      });
      if (res.ok) {
        return (await res.json()).client_secret;
      }
    } catch (error) {
      console.warn('Refresh failed, creating new session');
    }
  }

  const res = await fetch('/api/chatkit/session', { method: 'POST' });
  return (await res.json()).client_secret;
}
```

### Issue: "Unauthorized access"

**Cause:** User not authenticated or session endpoint not protected

**Solution:**
```typescript
// Protect endpoint with authentication check
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Continue with session creation
}
```
