---
name: chatkit-custom-backend
description: Adapt ChatKit UI to work with custom backend servers instead of OpenAI ChatKit. Configure session endpoints, API proxies, message handlers, and streaming for graceful custom server integration.
version: 1.0.0
allowed-tools: Read, Write, Edit, Bash
author: Claude Code
tags: [chatkit, custom-backend, integration, streaming, authentication]
---

# ChatKit Custom Backend Integration

Integrate ChatKit UI with custom backend servers, replacing OpenAI ChatKit endpoints with your own API servers. Configure session management, message routing, streaming, and error handling.

## When to Use This Skill

**Activate when:**
- Integrating ChatKit with custom AI backends (LLaMA, Ollama, vLLM)
- Building hybrid solutions (ChatKit frontend + custom backend)
- Migrating from OpenAI ChatKit to in-house models
- Adding custom preprocessing/postprocessing to messages
- Implementing custom authentication schemes
- Building multi-model solutions with model selection

**Trigger keywords:** "custom backend ChatKit", "ChatKit with custom server", "replace ChatKit backend", "adapt ChatKit for my API"

## Prerequisites

**Required:**
- Existing ChatKit UI implementation (from `chatkit-ui` skill)
- Custom backend API (REST or WebSocket)
- Understanding of ChatKit session flow
- Backend API authentication method

**Optional:**
- Streaming support (SSE or WebSocket)
- Message preprocessing logic
- Custom error handling

## Instructions

### Phase 1: Understand Custom Backend Integration

**Key Concept:**
ChatKit expects a session endpoint (`/api/chatkit/session`) that returns a `client_secret`. You'll replace this flow with a custom backend proxy.

**Flow Comparison:**
```
OpenAI ChatKit:
  ChatKit → /api/chatkit/session → OpenAI API → Response

Custom Backend:
  ChatKit → /api/custom/session → Your Backend → Response
```

**Two Integration Patterns:**
1. **Proxy Pattern**: ChatKit talks to your session endpoint, which proxies to your backend
2. **Direct Pattern**: ChatKit sends to your custom endpoint directly

**See:** `references/architecture-patterns.md#integration-patterns`

### Phase 2: Create Custom Session Endpoint

**Step 1: Define Session Response Format**

Your custom backend must return a response ChatKit understands:

```typescript
// Session endpoint response (same format as OpenAI)
interface SessionResponse {
  client_secret: string;        // Any unique session token
  expires_at?: string;          // Optional expiry timestamp
  model?: string;               // Optional: which model to use
  metadata?: Record<string, any>; // Optional: custom data
}
```

**Step 2: Implement Session Endpoint**

```typescript
// /api/custom/session - Custom backend session creation
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call your backend to create session
    const response = await fetch(
      `${process.env.CUSTOM_BACKEND_URL}/api/sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          model: 'custom-model-v1',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Backend session failed: ${response.statusText}`);
    }

    const session = await response.json();

    return Response.json({
      client_secret: session.session_id, // Map to ChatKit format
      expires_at: session.expires_at,
      model: session.model,
    });
  } catch (error) {
    console.error('Session creation failed:', error);
    return Response.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

**See:** `references/examples.md#backend-session-endpoints`

### Phase 3: Configure Message Routing

**Step 1: Intercept Messages**

ChatKit sends messages to the configured endpoint. You'll intercept and route to your backend:

```typescript
const [messageLog, setMessageLog] = useState<any[]>([]);

const { control, sendUserMessage } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
  onMessageSent: async ({ message }) => {
    // Your custom message handling
    try {
      // Send to your backend for logging/processing
      await fetch('/api/custom/log-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  },
});
```

**Step 2: Handle Custom Response Format**

If your backend returns different message formats:

```typescript
// Transform your backend response to ChatKit format
interface BackendMessage {
  id: string;
  content: string;
  timestamp: number;
}

interface ChatKitMessage {
  id: string;
  text: string;
  timestamp: Date;
}

const adaptBackendMessage = (msg: BackendMessage): ChatKitMessage => {
  return {
    id: msg.id,
    text: msg.content,
    timestamp: new Date(msg.timestamp),
  };
};
```

**See:** `references/examples.md#message-routing`

### Phase 4: Implement Streaming

**Step 1: Handle Streaming Responses**

If your backend supports streaming (SSE or WebSocket):

```typescript
// Stream handler for server-sent events
async function* streamCustomBackendResponse(sessionId: string, message: string) {
  const response = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/api/chat/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionId}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    throw new Error('Streaming request failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    yield chunk;
  }
}

// Use in component
const handleStream = async () => {
  for await (const chunk of streamCustomBackendResponse(sessionId, message)) {
    console.log('Received:', chunk);
  }
};
```

**Step 2: WebSocket for Real-time Chat**

For persistent connections:

```typescript
const useCustomWebSocket = (sessionId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/chat/${sessionId}`
    );

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => wsRef.current?.close();
  }, [sessionId]);

  const sendMessage = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', text }));
    }
  };

  return { messages, sendMessage };
};
```

**See:** `references/examples.md#streaming-implementations`

### Phase 5: Handle Authentication & Authorization

**Step 1: Custom Auth Headers**

If your backend requires specific authentication:

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      // Get custom auth token
      const authToken = await getCustomAuthToken();

      const res = await fetch('/api/custom/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Auth': authToken,
          'X-Client-Version': '1.0.0',
        },
      });

      return (await res.json()).client_secret;
    },
  },
});
```

**Step 2: Token Refresh for Custom Backend**

```typescript
const getCustomAuthToken = async () => {
  const cached = sessionStorage.getItem('custom_auth_token');
  const expiresAt = sessionStorage.getItem('custom_token_expires');

  if (cached && expiresAt && Date.now() < parseInt(expiresAt)) {
    return cached;
  }

  // Fetch new token from your backend
  const res = await fetch('/api/custom/auth/token', {
    method: 'POST',
    credentials: 'include',
  });

  const { token, expires_in } = await res.json();

  sessionStorage.setItem('custom_auth_token', token);
  sessionStorage.setItem(
    'custom_token_expires',
    String(Date.now() + expires_in * 1000)
  );

  return token;
};
```

**See:** `references/examples.md#authentication-patterns`

### Phase 6: Error Handling & Fallbacks

**Step 1: Graceful Backend Errors**

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      try {
        // Try custom backend
        const res = await fetch('/api/custom/session', { method: 'POST' });

        if (res.status === 503) {
          // Backend down, try fallback
          console.warn('Custom backend unavailable, trying fallback');
          return await getFallbackSession();
        }

        if (!res.ok) throw new Error(`Session failed: ${res.status}`);
        return (await res.json()).client_secret;
      } catch (error) {
        console.error('Session creation failed:', error);
        // Show user-friendly error
        showNotification(
          'Chat service temporarily unavailable. Please try again.',
          'error'
        );
        throw error;
      }
    },
  },
  onError: ({ error }) => {
    if (error.message?.includes('backend')) {
      showNotification('Unable to reach your backend service', 'error');
    }
  },
});
```

**Step 2: Retry Logic**

```typescript
async function createSessionWithRetry(maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      if (res.ok) return (await res.json()).client_secret;
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
}
```

**See:** `references/examples.md#error-handling`

### Phase 7: Custom Features & Extensions

**Step 1: Model Selection**

```typescript
const [selectedModel, setSelectedModel] = useState('gpt2');

const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      });

      return (await res.json()).client_secret;
    },
  },
});

// UI for model selection
<select
  value={selectedModel}
  onChange={(e) => setSelectedModel(e.target.value)}
>
  <option value="gpt2">GPT-2</option>
  <option value="custom-v1">Custom v1</option>
  <option value="custom-v2">Custom v2</option>
</select>;
```

**Step 2: Custom Metadata**

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            temperature: 0.7,
            max_tokens: 500,
            context: 'customer_support',
          },
        }),
      });

      return (await res.json()).client_secret;
    },
  },
});
```

**See:** `references/examples.md#custom-features`

### Phase 8: Testing & Validation

**Step 1: Test Session Endpoint**

```bash
# Test custom session endpoint
curl -X POST http://localhost:3000/api/custom/session \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json"

# Response should have: { "client_secret": "..." }
```

**Step 2: Test Message Routing**

```typescript
// In browser console
async function testMessageFlow() {
  // 1. Get session
  const session = await fetch('/api/custom/session', {
    method: 'POST',
  }).then((r) => r.json());
  console.log('Session:', session);

  // 2. Send test message
  const msg = await fetch('/api/custom/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.client_secret}`,
    },
    body: JSON.stringify({ text: 'Hello' }),
  }).then((r) => r.json());
  console.log('Response:', msg);
}

testMessageFlow();
```

**See:** `references/examples.md#testing`

## Common Patterns

### Pattern 1: Simple Custom Backend (No Streaming)
Backend returns complete responses. ChatKit displays after full response received.

**See:** `references/examples.md#simple-custom-backend`

### Pattern 2: Streaming Backend (SSE)
Backend sends streaming responses using Server-Sent Events. ChatKit displays tokens as they arrive.

**See:** `references/examples.md#streaming-custom-backend`

### Pattern 3: Multi-Model with Custom Backend
User selects model, custom backend handles routing to appropriate model.

**See:** `references/examples.md#multi-model-custom-backend`

### Pattern 4: Hybrid (OpenAI + Custom Backend)
Falls back to OpenAI if custom backend unavailable.

**See:** `references/examples.md#hybrid-backend`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid auth token | Check auth headers, verify credentials |
| 503 Service Unavailable | Backend down | Implement fallback or retry logic |
| Timeout | Backend slow | Increase timeout, optimize backend |
| Invalid client_secret | Session creation failed | Verify backend session endpoint response format |
| Streaming interrupted | Connection lost | Implement reconnection logic |
| Message format mismatch | Backend returns different format | Add adapter/transform layer |

**See:** `references/troubleshooting.md` for detailed solutions

## Decision Trees

### Which Integration Pattern?

```
Do you have backend streaming? → Yes → Use Pattern 2 (SSE/WebSocket)
                               → No → Use Pattern 1 (Simple)

Need multi-model support? → Yes → Use Pattern 3 (Multi-Model)
                          → No → Use Pattern 1 or 2

Need fallback to OpenAI? → Yes → Use Pattern 4 (Hybrid)
                        → No → Use Pattern 1, 2, or 3
```

### Authentication Method?

```
Using API keys? → Implement via headers
Using JWT? → Store in session, refresh as needed
Using OAuth? → Get token from backend
Custom scheme? → See references/examples.md#authentication-patterns
```

## References

**Detailed Guides:**
- Architecture patterns: `references/architecture-patterns.md`
- Complete examples: `references/examples.md`
- Backend integration: `references/backend-setup.md`
- Streaming implementation: `references/streaming-guide.md`
- Troubleshooting: `references/troubleshooting.md`
- Quick reference: `references/quick-reference.md`

**Related Skills:**
- `chatkit-ui` - Base ChatKit UI skill
- `scaffolding-fastapi` - Build custom backend
- `nextjs16` - Frontend framework

## Tips for Success

1. **Start simple** - Get basic session endpoint working first
2. **Test endpoints** - Use curl/Postman before integrating
3. **Handle errors** - Always have fallback or error handling
4. **Monitor logs** - Log all backend calls for debugging
5. **Version your API** - Plan for backend API evolution
6. **Document formats** - Keep session/message formats documented
7. **Security first** - Always validate auth tokens

## Version History

**v1.0.0 (2026-01-11)**
- Initial release
- 8-phase integration workflow
- Support for streaming and non-streaming backends
- Error handling and fallbacks
- Multi-model support

