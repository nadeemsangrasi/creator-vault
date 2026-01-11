# ChatKit Custom Backend Integration Skill

Adapt ChatKit UI to work with custom backend servers instead of OpenAI ChatKit. Configure session endpoints, API proxies, message handlers, streaming, and error handling for seamless integration.

## What This Skill Provides

- Session endpoint configuration for custom backends
- Message routing and transformation
- Streaming support (SSE and WebSocket)
- Authentication and authorization patterns
- Error handling and fallbacks
- Multi-model support
- Complete working examples

## Quick Start

### 1. Understand Your Backend

Your custom backend must support:
- Session creation endpoint that returns a session token
- Message receiving and response generation
- Optional: Streaming responses (SSE or WebSocket)

### 2. Create Custom Session Endpoint

```typescript
// /api/custom/session
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  const response = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/api/sessions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
      },
      body: JSON.stringify({ user_id: user.id }),
    }
  );

  const session = await response.json();

  return Response.json({
    client_secret: session.session_id,
    expires_at: session.expires_at,
  });
}
```

### 3. Configure ChatKit

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

### 4. Done!

Your ChatKit UI now works with your custom backend.

## Installation

```bash
cp -r chatkit-custom-backend ~/.claude/skills/
claude reload
```

## Usage Examples

### Basic Custom Backend

```bash
"Integrate ChatKit with my custom backend API at https://api.example.com"
```

### With Streaming

```bash
"Set up ChatKit to work with my backend that supports SSE streaming"
```

### Multi-Model Support

```bash
"Add model selection to ChatKit that routes to different custom backends"
```

### With Authentication

```bash
"Configure ChatKit with custom authentication tokens from my backend"
```

## Key Features

### 1. Session Management
- Create sessions with your backend
- Handle token refresh
- Manage session expiry

### 2. Message Routing
- Route messages to your backend
- Transform message formats
- Handle custom metadata

### 3. Streaming Support
- Server-Sent Events (SSE) streaming
- WebSocket connections
- Fallback to non-streaming

### 4. Authentication
- API key authentication
- JWT tokens
- OAuth integration
- Custom auth schemes

### 5. Error Handling
- Graceful error recovery
- Fallback endpoints
- Retry logic
- User-friendly error messages

### 6. Custom Features
- Model selection
- Custom metadata
- Temperature control
- Token limits
- Context management

## Architecture Patterns

### Simple Pattern (No Streaming)
```
ChatKit UI
    ↓
/api/custom/session (gets session)
    ↓
Your Backend
    ↓
Response
```

### Streaming Pattern (SSE)
```
ChatKit UI
    ↓
/api/custom/session (gets session)
    ↓
Your Backend (streaming response)
    ↓
Tokens stream in real-time
```

### Hybrid Pattern (OpenAI Fallback)
```
ChatKit UI
    ↓
Try /api/custom/session
    ↓
If fails → Try /api/chatkit/session (OpenAI)
    ↓
Response from whichever works
```

## Configuration

### Backend URL
```typescript
process.env.CUSTOM_BACKEND_URL = 'https://api.example.com';
```

### Authentication
```typescript
process.env.CUSTOM_BACKEND_KEY = 'your-api-key';
```

### Model Configuration
```typescript
process.env.CUSTOM_MODEL = 'gpt2'; // or your model name
```

## Common Patterns

### Pattern 1: Simple Custom Backend
Backend returns complete responses. ChatKit displays after full response received.

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
});
```

### Pattern 2: Streaming Custom Backend
Backend sends streaming responses. ChatKit displays tokens as they arrive.

```typescript
// Configure streaming in your backend
async function* streamBackendResponse(prompt) {
  const response = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/chat/stream`,
    { body: JSON.stringify({ prompt }) }
  );

  const reader = response.body?.getReader();
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    yield new TextDecoder().decode(value);
  }
}
```

### Pattern 3: Multi-Model Routing
User selects model, routed to appropriate backend.

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

### Pattern 4: Hybrid (OpenAI + Custom)
Falls back to OpenAI if custom backend unavailable.

```typescript
async function getClientSecret() {
  try {
    // Try custom backend first
    const res = await fetch('/api/custom/session', { method: 'POST' });
    if (res.ok) return (await res.json()).client_secret;
  } catch (error) {
    console.warn('Custom backend unavailable:', error);
  }

  // Fallback to OpenAI
  const res = await fetch('/api/chatkit/session', { method: 'POST' });
  return (await res.json()).client_secret;
}
```

## Authentication Methods

### API Key

```typescript
headers: {
  'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
}
```

### JWT Token

```typescript
const token = await getJWTToken();
headers: {
  'Authorization': `Bearer ${token}`,
}
```

### Custom Headers

```typescript
headers: {
  'X-Custom-Auth': customAuthValue,
  'X-Client-Version': '1.0.0',
}
```

## Error Handling

### Graceful Fallback

```typescript
try {
  const session = await fetch('/api/custom/session', { method: 'POST' });
  if (!session.ok) throw new Error('Session creation failed');
  return (await session.json()).client_secret;
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error
  showNotification('Chat service unavailable', 'error');
  throw error;
}
```

### Retry Logic

```typescript
async function createSessionWithRetry(maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      if (res.ok) return (await res.json()).client_secret;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
}
```

## Documentation

### Detailed Guides
- **Architecture Patterns** - `references/architecture-patterns.md`
- **Complete Examples** - `references/examples.md`
- **Backend Setup** - `references/backend-setup.md`
- **Streaming Guide** - `references/streaming-guide.md`
- **Quick Reference** - `references/quick-reference.md`
- **Troubleshooting** - `references/troubleshooting.md`

### Related Skills
- `chatkit-ui` - Base ChatKit UI skill
- `scaffolding-fastapi` - Build custom backend
- `nextjs16` - Frontend framework

## Testing

### Test Session Endpoint

```bash
curl -X POST http://localhost:3000/api/custom/session \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json"
```

### Test Message Flow

```typescript
async function testMessageFlow() {
  const session = await fetch('/api/custom/session', {
    method: 'POST',
  }).then((r) => r.json());

  console.log('Session:', session);

  const message = await fetch('/api/custom/message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.client_secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: 'Hello' }),
  }).then((r) => r.json());

  console.log('Response:', message);
}
```

## Performance Tips

1. **Cache sessions** - Don't create new session for every message
2. **Use connection pooling** - Keep backend connections alive
3. **Implement streaming** - For better perceived performance
4. **Monitor latency** - Track backend response times
5. **Optimize payloads** - Send only necessary data

## Security Checklist

- [ ] Use HTTPS for all backend calls
- [ ] Validate all responses from backend
- [ ] Don't expose backend URLs in frontend
- [ ] Rotate API keys regularly
- [ ] Implement rate limiting
- [ ] Log all backend requests
- [ ] Handle sensitive data securely
- [ ] Validate user permissions

## Support

For issues or questions:
1. Check `references/troubleshooting.md`
2. Review examples in `references/examples.md`
3. See `references/backend-setup.md` for backend implementation
4. Check your backend logs for errors
5. Test endpoints with curl/Postman first

## Version

**v1.0.0 (2026-01-11)**
- Initial release
- 8-phase integration workflow
- Support for streaming and non-streaming backends
- Error handling and fallbacks
- Multi-model support
- Production-ready examples

## License

This skill follows the same license as Claude Code.

