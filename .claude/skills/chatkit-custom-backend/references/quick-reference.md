# ChatKit Custom Backend - Quick Reference

## Session Endpoint Template

```typescript
// /api/custom/session
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const response = await fetch(`${process.env.CUSTOM_BACKEND_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: user.id }),
  });

  const session = await response.json();
  return Response.json({ client_secret: session.session_id });
}
```

## Frontend Integration

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
});

return <ChatKit control={control} className="h-screen w-full" />;
```

## Streaming Response Handler

```typescript
async function* streamResponse(sessionId: string, message: string) {
  const res = await fetch('/api/custom/stream', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Authorization': `Bearer ${sessionId}` },
  });

  const reader = res.body?.getReader();
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    yield new TextDecoder().decode(value);
  }
}
```

## Error Handling

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      try {
        const res = await fetch('/api/custom/session', { method: 'POST' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()).client_secret;
      } catch (error) {
        console.error('Session failed:', error);
        showNotification('Chat service unavailable', 'error');
        throw error;
      }
    },
  },
  onError: ({ error }) => {
    console.error('Chat error:', error.message);
  },
});
```

## Retry Logic

```typescript
async function createSessionWithRetry(maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      if (res.ok) return (await res.json()).client_secret;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw new Error('Session creation failed');
}
```

## Custom Authentication

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const token = await getAuthToken();
      const res = await fetch('/api/custom/session', {
        method: 'POST',
        headers: { 'X-Auth-Token': token },
      });
      return (await res.json()).client_secret;
    },
  },
});
```

## Multi-Model Support

```typescript
const [model, setModel] = useState('default');

const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', {
        method: 'POST',
        body: JSON.stringify({ model }),
      });
      return (await res.json()).client_secret;
    },
  },
});
```

## WebSocket Connection

```typescript
const useWebSocketChat = (sessionId: string) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(
      `ws://localhost:3000/api/ws/chat/${sessionId}`
    );

    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // Handle message
    };

    return () => wsRef.current?.close();
  }, [sessionId]);

  const send = (msg: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'message', text: msg }));
  };

  return { send };
};
```

## Fallback Pattern

```typescript
async function getClientSecret() {
  try {
    const res = await fetch('/api/custom/session', { method: 'POST' });
    if (res.ok) return (await res.json()).client_secret;
  } catch (error) {
    console.warn('Custom backend failed, using OpenAI');
  }

  const res = await fetch('/api/chatkit/session', { method: 'POST' });
  return (await res.json()).client_secret;
}
```

## Backend FastAPI Session

```python
from fastapi import FastAPI
import uuid

app = FastAPI()

@app.post("/api/sessions")
async def create_session(user_id: str):
    session_id = str(uuid.uuid4())
    return {
        "session_id": session_id,
        "expires_at": "2024-12-31T23:59:59Z"
    }
```

## Backend Express Session

```javascript
app.post('/api/sessions', (req, res) => {
  const sessionId = crypto.randomUUID();
  res.json({
    session_id: sessionId,
    expires_at: new Date(Date.now() + 3600000).toISOString()
  });
});
```

## Test Endpoint

```bash
curl -X POST http://localhost:3000/api/custom/session \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json"
```

## Environment Variables

```bash
CUSTOM_BACKEND_URL=https://api.example.com
CUSTOM_BACKEND_KEY=your-api-key
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## TypeScript Types

```typescript
interface SessionRequest {
  user_id: string;
  model?: string;
  metadata?: Record<string, any>;
}

interface SessionResponse {
  client_secret: string;
  expires_at?: string;
  model?: string;
  metadata?: Record<string, any>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
```

## Common Headers

```typescript
// Authentication
'Authorization': `Bearer ${token}`

// Content type
'Content-Type': 'application/json'

// Streaming
'Content-Type': 'text/event-stream'
'Cache-Control': 'no-cache'
'Connection': 'keep-alive'

// CORS
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Credentials': 'true'
```

## Response Format

```typescript
// Success
{
  "client_secret": "session-123",
  "expires_at": "2024-12-31T23:59:59Z",
  "model": "custom-v1"
}

// Error
{
  "error": "Session creation failed",
  "code": "SESSION_ERROR",
  "details": "Backend unreachable"
}
```

## Debugging Tips

```typescript
// Log all API calls
const fetch = async (...args) => {
  console.log('[API]', args[0]);
  return globalThis.fetch(...args);
};

// Monitor session creation
onMessageSent: ({ message }) => {
  console.log('Session ID:', message.session_id);
  console.log('Timestamp:', new Date());
};

// Check backend response
const res = await fetch('/api/custom/session', { method: 'POST' });
console.log('Status:', res.status);
console.log('Response:', await res.json());
```

