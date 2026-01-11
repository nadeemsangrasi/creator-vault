# Streaming LLM Responses: Agent SDK to ChatKit

Build real-time streaming of LLM responses from OpenAI Agent SDK backend to ChatKit UI frontend.

## What is Streaming?

Streaming displays language model responses token-by-token as they're generated, instead of waiting for the complete response. This creates a more interactive, responsive user experience.

**Without Streaming:**
```
User: "Tell me about AI"
[Waiting 5 seconds...]
Assistant: "Artificial Intelligence is the simulation of human intelligence processes by computer systems..."
```

**With Streaming:**
```
User: "Tell me about AI"
Assistant: "Artificial " → "Intelligence " → "is " → "the " → ...
```

## Quick Start

### 1. Backend Setup (FastAPI + Agent SDK)

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent
import json

app = FastAPI()

agent = Agent(
    name="Assistant",
    instructions="You are a helpful AI assistant.",
    model="gpt-4o"
)

@app.post("/api/stream/message")
async def stream_message(request: dict):
    user_input = request.get("message")

    async def event_generator():
        result = Runner.run_streamed(agent, user_input)
        async for event in result.stream_events():
            if isinstance(event.data, ResponseTextDeltaEvent):
                yield f"data: {json.dumps({'token': event.data.delta})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/chatkit/session")
async def create_session(request: dict):
    session = await openai.chatkit.sessions.create({"user_id": "user-123"})
    return {"client_secret": session.client_secret}
```

Run the backend:
```bash
cd backend && uv run uvicorn main:app --reload
```

### 2. Frontend Setup (Next.js + ChatKit)

```typescript
// frontend/components/StreamingChat.tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export function StreamingChat() {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    onMessageSent: async ({ message }) => {
      setIsStreaming(true);
      setStreamingText('');

      const res = await fetch('/api/stream/message', {
        method: 'POST',
        body: JSON.stringify({ message: message.text }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            setStreamingText((prev) => prev + data.token);
          }
        }
      }

      setIsStreaming(false);
    },
  });

  return (
    <div className="flex flex-col h-screen gap-4">
      <ChatKit control={control} className="flex-1" />
      {isStreaming && (
        <div className="p-4 bg-blue-50 border-t">
          <p className="text-sm text-gray-600">Streaming:</p>
          <p className="mt-2">{streamingText}</p>
        </div>
      )}
    </div>
  );
}
```

Run the frontend:
```bash
cd frontend && npm run dev
```

Visit `http://localhost:3000` and start chatting!

## Key Concepts

### Server-Sent Events (SSE)

One-way streaming protocol using HTTP chunked transfer:

```
Server sends:
data: {"token":"Hello"}\n\n
data: {"token":" "}\n\n
data: {"token":"world"}\n\n
```

Client receives and displays tokens in real-time.

**Pros:** Simple HTTP, easy CORS, browser-native support
**Cons:** One-way only, no client control

### WebSocket

Bidirectional persistent connection:

```
Client: {"command":"start","message":"Hi"}
Server: {"type":"token","token":"Hello"}
Client: {"command":"stop"}
```

**Pros:** Two-way communication, full control
**Cons:** More complex, requires server support

### Choosing Between SSE and WebSocket

| Need | SSE | WebSocket |
|------|-----|-----------|
| Simple streaming | ✅ | - |
| Pause/resume | - | ✅ |
| Bidirectional | - | ✅ |
| No server changes | ✅ | - |
| Production UI | ✅ | ✅ |

## Core Architecture

```
┌─────────────────────────────────────────────────┐
│                ChatKit Frontend                  │
│  (Next.js + React + ChatKit UI Components)      │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Streaming Response Hook               │     │
│  │  - Fetch /api/stream/message           │     │
│  │  - ReadableStream consumption          │     │
│  │  - Token accumulation & display        │     │
│  └────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
              ↓ fetch /api/stream/message ↓
        ↑ Server-Sent Events (SSE) ↑
┌─────────────────────────────────────────────────┐
│                FastAPI Backend                   │
│  (Python + OpenAI Agent SDK)                    │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Streaming Endpoint                    │     │
│  │  - Receives user message               │     │
│  │  - Calls Runner.run_streamed()         │     │
│  │  - Iterates ResponseTextDeltaEvent     │     │
│  │  - Yields tokens as SSE                │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │  Agent                                 │     │
│  │  - LLM: gpt-4o (streaming-enabled)     │     │
│  │  - Instructions: Custom prompt         │     │
│  │  - Tools: Optional external actions    │     │
│  └────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

## Implementation Phases

This skill guides you through 8 phases:

1. **Understand Streaming Architecture** - Learn SSE vs WebSocket
2. **Setup Agent SDK Streaming Backend** - Create streaming endpoints
3. **Configure Frontend Streaming Handler** - Build React hooks
4. **Handle ChatKit Events** - Integrate with ChatKit UI
5. **Optimize for Performance** - Buffering and timeouts
6. **Add Session & Auth** - Secure streaming with authentication
7. **Monitor & Debug** - Track performance and errors
8. **Handle Edge Cases** - Fallbacks and recovery

See `SKILL.md` for detailed 8-phase workflow.

## Reference Documentation

### `SKILL.md` (440 lines)
Complete 8-phase workflow with mini code examples and decision trees.

### `references/examples.md` (500+ lines)
8 production-ready examples:
1. Simple SSE Streaming
2. WebSocket Bidirectional Streaming
3. Multi-Token Buffering
4. Error Recovery with Retry
5. ChatKit Integration
6. Performance Monitoring
7. Hybrid Streaming + Polling
8. Markdown Rendering in Real-Time

### `references/quick-reference.md` (350+ lines)
40+ code snippets covering:
- Backend streaming endpoints
- Frontend consumption patterns
- React hooks (useStreamingResponse, useWebSocketStreaming)
- Token buffering strategies
- Error handling patterns
- ChatKit integration
- Performance optimization
- Timeout patterns
- State management
- Testing patterns

### `references/troubleshooting.md` (400+ lines)
8 common issues with detailed solutions:
1. Stream never starts
2. Stream interrupts mid-response
3. CORS errors on streaming
4. Slow token arrival (high latency)
5. ChatKit not displaying content
6. WebSocket connection fails
7. Memory leak with streaming
8. Agent SDK not streaming

### `references/official-docs.md` (400+ lines)
Official documentation excerpts:
- OpenAI Agent SDK streaming overview
- ResponseTextDeltaEvent structure
- Stream event types and filtering
- Async stream iteration patterns
- ChatKit streaming configuration
- Best practices and performance tuning
- Error codes and recovery
- Deployment considerations

## Common Patterns

### Pattern 1: Simple SSE (Recommended Start)
Best for: Getting started, basic chat interfaces
See: `references/examples.md` - Example 1

### Pattern 2: WebSocket Bidirectional
Best for: Advanced control, pause/resume, real-time UI
See: `references/examples.md` - Example 2

### Pattern 3: Streaming with Error Recovery
Best for: Production apps, unreliable networks
See: `references/examples.md` - Example 4

### Pattern 4: Multi-Token Buffering
Best for: Performance optimization, high throughput
See: `references/examples.md` - Example 3

### Pattern 5: ChatKit Integration
Best for: Full-featured chat UI, professional apps
See: `references/examples.md` - Example 5

## Performance Tips

### 1. Buffer Tokens

Don't render every single token - batch them:

```typescript
// Instead of rendering each token immediately
// Buffer and render every N tokens
const BUFFER_SIZE = 5;
```

**Impact:** 30-50% performance improvement

### 2. Use ReadableStream API

Modern fetch API for better performance than EventSource:

```typescript
const reader = res.body?.getReader();
```

### 3. Monitor Throughput

Track tokens/second to detect bottlenecks:

```typescript
const throughput = tokenCount / (elapsedTime / 1000);
console.log(`${throughput.toFixed(2)} tokens/sec`);
```

### 4. Lazy Load Components

```typescript
const StreamingChat = lazy(() => import('./StreamingChat'));
```

### 5. Debounce Render Updates

Batch state updates for better React performance.

## Security Considerations

### 1. Validate Sessions

Always validate user before creating stream:

```python
@app.post("/api/stream/message")
async def stream_message(request: Request):
    user = await get_current_user(request)
    if not user:
        return Response(status_code=401)
```

### 2. Sanitize Streamed Content

```typescript
import DOMPurify from 'dompurify';
const safeToken = DOMPurify.sanitize(token);
```

### 3. Rate Limit Streaming

```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/stream/message")
@limiter.limit("10/minute")
async def stream_message(request: dict):
```

### 4. HTTPS Only

Always use HTTPS for production streaming.

### 5. Timeout Protection

Prevent long-running streams from consuming resources:

```python
@app.post("/api/stream/message")
async def stream_message(request: dict):
    timeout = 120  # 2 minutes
```

## Deployment Checklist

- [ ] Backend accepts streaming requests
- [ ] Agent SDK configured with gpt-4o or streaming model
- [ ] OpenAI API key set and valid
- [ ] Frontend can consume streaming responses
- [ ] ChatKit session endpoint working
- [ ] CORS configured for streaming
- [ ] Timeouts set appropriately
- [ ] Error handling in place
- [ ] Logging enabled
- [ ] Tests passing
- [ ] Docker image builds
- [ ] Kubernetes manifests ready

## Testing

### Backend Test

```bash
curl -X POST http://localhost:8000/api/stream/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

You should see tokens streaming in real-time.

### Frontend Test

```typescript
// Test with mock
jest.mock('fetch', () => jest.fn());

const { result } = renderHook(() => useStreamingResponse());

act(() => {
  result.current.startStream('test');
});

await waitFor(() => {
  expect(result.current.response).toContain('mocked response');
});
```

## Troubleshooting

**Stream never starts:**
- Check backend logs for errors
- Verify Agent SDK is installed
- Ensure OpenAI API key is valid
- Check CORS configuration

**Stream stops mid-response:**
- Increase timeout values
- Check network connectivity
- Review backend error logs
- Implement retry logic

**ChatKit not showing streamed content:**
- Verify session endpoint returns correct format
- Check ChatKit initialization
- Ensure event handlers are registered
- Review console for errors

See `references/troubleshooting.md` for detailed solutions.

## When to Use This Skill

Use this skill when you need to:

- ✅ Stream LLM responses to users
- ✅ Build real-time chat interfaces
- ✅ Connect Agent SDK to ChatKit UI
- ✅ Display tokens as they generate
- ✅ Optimize for low-latency UX
- ✅ Handle streaming errors gracefully
- ✅ Integrate with custom backends

## What You'll Build

By following this skill, you'll create:

1. **Streaming Backend** - FastAPI endpoint serving tokens via SSE/WebSocket
2. **React Streaming Hook** - Reusable `useStreamingResponse` hook
3. **ChatKit Integration** - Full chat UI with streaming support
4. **Error Handling** - Graceful fallbacks and recovery
5. **Performance** - Optimized for low-latency, high-throughput scenarios
6. **Monitoring** - Metrics and logging for production
7. **Security** - Authentication, validation, rate limiting

## Next Steps

1. Read `SKILL.md` for the complete 8-phase workflow
2. Follow Example 1 in `references/examples.md` to get started
3. Use `references/quick-reference.md` for code snippets
4. Consult `references/troubleshooting.md` if issues arise
5. Review `references/official-docs.md` for detailed API information

## Get Help

- **Questions?** Check `references/troubleshooting.md`
- **Code examples?** See `references/examples.md`
- **Quick snippets?** Use `references/quick-reference.md`
- **Official docs?** Read `references/official-docs.md`
- **Full workflow?** Follow `SKILL.md`

## Related Skills

- [`openai-agent-sdk`](../openai-agent-sdk/) - Agent SDK foundations
- [`chatkit-ui`](../chatkit-ui/) - ChatKit UI implementation
- [`chatkit-custom-backend`](../chatkit-custom-backend/) - Custom backend integration
- [`chatkit-widgets`](../chatkit-widgets/) - Building chat widgets
- [`scaffolding-fastapi`](../scaffolding-fastapi/) - FastAPI setup
- [`nextjs16`](../nextjs16/) - Next.js development

## Skill Info

| Attribute | Value |
|-----------|-------|
| **Name** | streaming-llm-responses |
| **Category** | Backend Integration |
| **Level** | Intermediate to Advanced |
| **Time to Learn** | 1-2 hours |
| **Complexity** | Medium |
| **Version** | 1.0.0 |
| **Last Updated** | 2026-01-11 |

## License

This skill is part of the CreatorVault project. See LICENSE for details.

