# ChatKit Custom Backend - Troubleshooting

## Issue 1: "client_secret undefined" Error

**Error:**
```
Error: Cannot read property 'client_secret' of undefined
```

**Causes:**
- Backend session endpoint not returning correct format
- API response is null
- Endpoint not returning JSON

**Solution:**

```typescript
// Verify backend response format
const debugSession = async () => {
  const res = await fetch('/api/custom/session', { method: 'POST' });
  console.log('Status:', res.status);
  const json = await res.json();
  console.log('Full response:', json);
  console.log('Has client_secret:', 'client_secret' in json);
};

// Backend must return this format
Response.json({
  client_secret: session.session_id,  // ✅ This is required
  expires_at: session.expires_at,
});

// Not this
Response.json({
  session_id: session.session_id,  // ❌ Wrong key
  expires_at: session.expires_at,
});
```

---

## Issue 2: "401 Unauthorized" on Backend Calls

**Error:**
```
Error: 401 Unauthorized from custom backend
```

**Causes:**
- Missing authentication header
- Invalid API key
- Expired token
- Wrong authorization format

**Solution:**

```typescript
// Verify auth headers
const debugAuth = async () => {
  const res = await fetch('/api/custom/session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
    },
  });
  console.log('Status:', res.status);
};

// Ensure backend validates correctly
export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization');
  console.log('Auth header:', authHeader);

  const token = authHeader?.split(' ')[1];
  if (token !== process.env.CUSTOM_BACKEND_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Continue...
}
```

---

## Issue 3: "CORS Blocked" Error

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Causes:**
- Custom backend doesn't return CORS headers
- Frontend making direct call instead of through proxy
- Wrong origin in CORS configuration

**Solution:**

```typescript
// ❌ Wrong - direct call to custom backend
fetch('https://custom-backend.com/api/sessions', { method: 'POST' });

// ✅ Correct - go through NextJS proxy
fetch('/api/custom/session', { method: 'POST' });

// Backend CORS configuration (if making direct calls)
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:3000'],
  credentials: true,
}));
```

---

## Issue 4: "Backend Not Responding" or Timeout

**Error:**
```
Error: The operation timed out
```

**Causes:**
- Backend is down
- Network connectivity issue
- Request takes too long
- Backend URL is wrong

**Solution:**

```typescript
// Add timeout to requests
const createSessionWithTimeout = async (timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch('/api/custom/session', {
      method: 'POST',
      signal: controller.signal,
    });
    return (await res.json()).client_secret;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Check backend connectivity
async function healthCheck() {
  try {
    const res = await fetch(
      `${process.env.CUSTOM_BACKEND_URL}/health`,
      { signal: AbortSignal.timeout(5000) }
    );
    return res.ok;
  } catch (error) {
    console.error('Backend unreachable:', error);
    return false;
  }
}
```

---

## Issue 5: "Streaming Not Working"

**Error:**
```
Message appears all at once, not streaming
```

**Causes:**
- Backend not returning streaming response
- Frontend not handling event stream
- Content-Type header incorrect

**Solution:**

```typescript
// Backend must set correct headers
export async function POST(req: Request) {
  const backendRes = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/chat/stream`,
    { body: JSON.stringify({ message }) }
  );

  // Forward streaming response with correct headers
  return new Response(backendRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',  // ✅ Required
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Frontend streaming handler
async function handleStream(message: string) {
  const res = await fetch('/api/custom/stream', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const text = decoder.decode(value);
    // Process streaming data
    console.log('Chunk:', text);
  }
}
```

---

## Issue 6: "Model Not Available" or "Model Selection Not Working"

**Error:**
```
Selected model not being used
Model parameter ignored
```

**Causes:**
- Model parameter not passed to backend
- Backend not handling model selection
- Wrong model names

**Solution:**

```typescript
// Pass model in request
export async function POST(req: Request) {
  const { model } = await req.json();
  console.log('Requested model:', model);

  const response = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/sessions`,
    {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        model: model || 'default',  // ✅ Include model
      }),
    }
  );

  const session = await response.json();
  return Response.json({
    client_secret: session.session_id,
    model: model,  // ✅ Include in response
  });
}

// Frontend must send model
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,  // ✅ Send model
        }),
      });
      return (await res.json()).client_secret;
    },
  },
});
```

---

## Issue 7: "Session Expires Immediately"

**Error:**
```
Session works briefly then expires
```

**Causes:**
- Session TTL is too short
- Expiry time is in the past
- Not handling token refresh

**Solution:**

```typescript
// Ensure reasonable expiry
export async function POST(req: Request) {
  const session = await createBackendSession(user.id);

  // ✅ Expiry should be in future
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  return Response.json({
    client_secret: session.session_id,
    expires_at: expiresAt.toISOString(),
  });
}

// Implement refresh endpoint
export async function POST(req: Request) {
  const { token } = await req.json();

  // Validate existing token
  const isValid = await validateToken(token);
  if (!isValid) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Create new session
  const newSession = await createBackendSession(user.id);

  return Response.json({
    client_secret: newSession.session_id,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  });
}

// Frontend refresh logic
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      // Check if token expired
      const stored = JSON.parse(
        sessionStorage.getItem('chatkit_session') || '{}'
      );

      if (stored.expires_at && Date.now() > new Date(stored.expires_at).getTime()) {
        sessionStorage.removeItem('chatkit_session');
        existing = null;
      }

      if (existing) {
        // Try refresh
        try {
          const res = await fetch('/api/custom/refresh', {
            method: 'POST',
            body: JSON.stringify({ token: existing }),
          });
          if (res.ok) {
            const { client_secret } = await res.json();
            return client_secret;
          }
        } catch (error) {
          console.warn('Refresh failed, creating new session');
        }
      }

      // Create new session
      const res = await fetch('/api/custom/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
});
```

---

## Issue 8: "Memory Leaks with WebSocket"

**Error:**
```
Memory increasing over time
Multiple WebSocket connections not closing
```

**Causes:**
- WebSocket not closed on unmount
- Event listeners not cleaned up
- Message buffer growing unbounded

**Solution:**

```typescript
// Proper WebSocket cleanup
const useWebSocketChat = (sessionId: string) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(`ws://localhost/chat/${sessionId}`);

    wsRef.current.onmessage = (e) => {
      // Handle message
    };

    wsRef.current.onerror = (e) => {
      console.error('WebSocket error:', e);
    };

    // ✅ Cleanup on unmount
    return () => {
      wsRef.current?.close();
    };
  }, [sessionId]);

  return wsRef;
};

// Limit message history
const [messages, setMessages] = useState<ChatMessage[]>([]);

const addMessage = (msg: ChatMessage) => {
  setMessages((prev) => {
    const updated = [...prev, msg];
    // Keep only last 1000 messages
    if (updated.length > 1000) {
      return updated.slice(-1000);
    }
    return updated;
  });
};
```

---

## Issue 9: "Custom Backend Response Format Mismatch"

**Error:**
```
ChatKit doesn't understand backend response
```

**Causes:**
- Backend returning different message format
- Field names don't match ChatKit expectations
- Missing required fields

**Solution:**

```typescript
// Transform backend response to ChatKit format
interface BackendResponse {
  id: string;
  content: string;
  created_at: number;
}

interface ChatKitFormat {
  id: string;
  text: string;
  timestamp: Date;
}

const transformBackendMessage = (msg: BackendResponse): ChatKitFormat => {
  return {
    id: msg.id,
    text: msg.content,  // Map 'content' to 'text'
    timestamp: new Date(msg.created_at),
  };
};

// Use in message handler
const { control, sendUserMessage } = useChatKit({
  onMessageSent: async ({ message }) => {
    const backendRes = await fetch('/api/custom/message', {
      method: 'POST',
      body: JSON.stringify({ text: message.text }),
    });

    const backendMsg = await backendRes.json();
    const chatKitMsg = transformBackendMessage(backendMsg);

    // Send to ChatKit in correct format
    await sendUserMessage({
      text: chatKitMsg.text,
    });
  },
});
```

---

## Issue 10: "Rate Limiting or Quota Errors"

**Error:**
```
Error: Rate limit exceeded
429 Too Many Requests
```

**Causes:**
- Too many requests to backend
- Rate limit on custom backend
- Not respecting quota

**Solution:**

```typescript
// Implement rate limiting on frontend
const createSessionWithRateLimit = (() => {
  let lastCall = 0;
  const minInterval = 1000; // Minimum 1 second between calls

  return async () => {
    const now = Date.now();
    if (now - lastCall < minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, minInterval - (now - lastCall))
      );
    }

    lastCall = Date.now();
    const res = await fetch('/api/custom/session', { method: 'POST' });
    return (await res.json()).client_secret;
  };
})();

// Handle 429 responses
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      try {
        const res = await fetch('/api/custom/session', { method: 'POST' });

        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After');
          const waitTime = parseInt(retryAfter || '60') * 1000;

          showNotification(
            `Rate limited. Please wait ${waitTime / 1000} seconds.`,
            'warning'
          );

          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return createSessionWithRateLimit();
        }

        return (await res.json()).client_secret;
      } catch (error) {
        console.error('Session creation failed:', error);
        throw error;
      }
    },
  },
});
```

---

## Debug Checklist

```typescript
async function debugCustomBackend() {
  console.log('=== ChatKit Custom Backend Debug ===');

  // 1. Check backend connectivity
  console.log('1. Backend URL:', process.env.CUSTOM_BACKEND_URL);
  try {
    const health = await fetch(
      `${process.env.CUSTOM_BACKEND_URL}/health`
    );
    console.log('   Status:', health.status, health.ok ? '✅' : '❌');
  } catch (e) {
    console.log('   Backend unreachable ❌');
  }

  // 2. Check session endpoint
  console.log('2. Session endpoint:');
  try {
    const res = await fetch('/api/custom/session', { method: 'POST' });
    console.log('   Status:', res.status);
    const data = await res.json();
    console.log('   Response:', data);
    console.log('   Has client_secret:', !!data.client_secret);
  } catch (e) {
    console.log('   Error:', e);
  }

  // 3. Check authentication
  console.log('3. Authentication:');
  console.log('   API Key present:', !!process.env.CUSTOM_BACKEND_KEY);

  // 4. Check environment
  console.log('4. Environment:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   Frontend URL:', window.location.href);
}

// Run in browser console
debugCustomBackend();
```

