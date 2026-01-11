---
name: streaming-llm-responses
description: Implement real-time LLM streaming responses from OpenAI Agent SDK backend to ChatKit UI frontend. Configure async streaming, token-by-token output, Server-Sent Events, and error handling for low-latency AI chat experiences.
version: 1.0.0
allowed-tools: Read, Write, Edit, Bash
author: Claude Code
tags: [streaming, llm, agent-sdk, chatkit, real-time, sse, async]
---

# Streaming LLM Responses: Agent SDK to ChatKit

Implement real-time streaming of LLM responses from OpenAI Agent SDK backend to ChatKit UI frontend. Connect streaming events, configure Server-Sent Events (SSE), handle async operations, and optimize for low-latency chat experiences.

## When to Use This Skill

**Activate when:**
- Building real-time streaming from Agent SDK to frontend
- Implementing token-by-token LLM output display
- Setting up Server-Sent Events or WebSocket streaming
- Connecting custom Agent backend to ChatKit UI
- Handling streaming errors and recovery
- Optimizing for low-latency responses
- Building production chat applications

**Trigger keywords:** "stream LLM responses", "real-time streaming Agent SDK", "ChatKit streaming backend", "token streaming", "Agent SDK streaming"

## Prerequisites

**Required:**
- OpenAI Agent SDK (Python backend with streaming)
- ChatKit UI (React/TypeScript frontend)
- Next.js or Express backend (middleware/proxy layer)
- Understanding of async/await and streams
- Basic knowledge of Server-Sent Events (SSE)

**Optional:**
- WebSocket support (for bidirectional)
- Event tracking and monitoring
- Performance profiling tools

## Instructions

### Phase 1: Understand Streaming Architecture

**Key Concept:**
Streaming creates a persistent connection where the LLM generates tokens one-by-one, and each token is immediately sent to the frontend for display.

**Flow:**
```
Frontend (ChatKit)
    ↓ User message
Backend (Agent SDK)
    ↓ Start streaming
Stream events (tokens)
    ↓ Each event
Frontend displays token
    ↓ Accumulate
Complete response
```

**Streaming Methods:**
1. **Server-Sent Events (SSE)** - One-way streaming, HTTP-based
2. **WebSocket** - Bidirectional, persistent connection
3. **Chunked Transfer** - HTTP streaming with multipart

**See:** `references/architecture-guide.md#streaming-patterns`

### Phase 2: Setup Agent SDK Streaming Backend

**Step 1: Create Streaming Function**

```python
# backend/agent_handler.py
from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent
import asyncio

async def stream_agent_response(user_input: str, agent: Agent):
    """Stream response from Agent SDK token-by-token"""
    result = Runner.run_streamed(agent, user_input)

    async for event in result.stream_events():
        if event.type == "raw_response_event":
            if isinstance(event.data, ResponseTextDeltaEvent):
                yield event.data.delta  # Yield each token

agent = Agent(
    name="ChatBot",
    instructions="You are a helpful AI assistant."
)
```

**Step 2: Create Backend Streaming Endpoint**

```python
# backend/main.py (FastAPI)
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

@app.post("/api/stream/message")
async def stream_message(request: dict):
    user_input = request.get("message")

    async def event_generator():
        async for token in stream_agent_response(user_input, agent):
            yield f"data: {json.dumps({'token': token})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

**See:** `references/examples.md#backend-streaming`

### Phase 3: Configure Frontend Streaming Handler

**Step 1: Create Streaming Hook**

```typescript
// frontend/hooks/useStreamingResponse.ts
const useStreamingResponse = () => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async (message: string) => {
    setIsStreaming(true);
    setResponse('');

    const res = await fetch('/api/stream/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
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
          setResponse(prev => prev + data.token);
        }
      }
    }

    setIsStreaming(false);
  };

  return { response, isStreaming, startStream };
};
```

**Step 2: Integrate with ChatKit**

```typescript
const { control, sendUserMessage } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
  onMessageSent: async ({ message }) => {
    await startStream(message.text);
  },
});
```

**See:** `references/examples.md#frontend-streaming`

### Phase 4: Handle ChatKit Events and Streaming State

**Step 1: Integrate Event Handlers**

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => {} },
  onResponseStart: () => {
    console.log('Stream started');
    setIsLoading(true);
  },
  onResponseEnd: () => {
    console.log('Stream completed');
    setIsLoading(false);
  },
  onError: ({ error }) => {
    console.error('Streaming error:', error);
    showNotification(error.message, 'error');
  },
});
```

**Step 2: Handle Streaming Errors**

```typescript
const startStream = async (message: string) => {
  try {
    setIsStreaming(true);
    const res = await fetch('/api/stream/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    if (res.status === 503) {
      throw new Error('Streaming backend unavailable');
    }

    // Handle streaming...
  } catch (error) {
    console.error('Stream error:', error);
    showErrorNotification(error.message);
  } finally {
    setIsStreaming(false);
  }
};
```

**See:** `references/examples.md#error-handling`

### Phase 5: Optimize for Performance

**Step 1: Add Stream Buffering**

```typescript
const startStream = async (message: string) => {
  let buffer = '';
  const BUFFER_SIZE = 5; // Tokens

  async for (const token of streamTokens()) {
    buffer += token;

    if (buffer.length >= BUFFER_SIZE) {
      setResponse(prev => prev + buffer);
      buffer = '';
    }
  }

  // Flush remaining
  if (buffer) setResponse(prev => prev + buffer);
};
```

**Step 2: Implement Timeout Protection**

```typescript
const startStream = async (message: string, timeout = 120000) => {
  const timeoutId = setTimeout(() => {
    setIsStreaming(false);
    showNotification('Stream timeout', 'error');
  }, timeout);

  try {
    // Streaming logic...
  } finally {
    clearTimeout(timeoutId);
  }
};
```

**See:** `references/examples.md#performance-optimization`

### Phase 6: Add Session and Auth Management

**Step 1: Session Endpoint with Streaming**

```python
# backend/session.py
@app.post("/api/chatkit/session")
async def create_session(request: dict):
    user = await verify_user(request)

    session = await openai.chatkit.sessions.create({
        user_id=user.id,
        model="gpt-4o",
        stream_enabled=True,
    })

    return {
        "client_secret": session.client_secret,
        "stream_enabled": True,
    }
```

**Step 2: Token Refresh for Long-Running Streams**

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      if (existing) {
        // Refresh for long-running stream
        const res = await fetch('/api/chatkit/refresh', {
          method: 'POST',
          body: JSON.stringify({ token: existing }),
        });
        if (res.ok) {
          return (await res.json()).client_secret;
        }
      }

      // Create new session
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
});
```

**See:** `references/examples.md#session-management`

### Phase 7: Monitor and Debug Streaming

**Step 1: Add Stream Logging**

```typescript
const startStream = async (message: string) => {
  const startTime = Date.now();
  let tokenCount = 0;

  async for (const token of streamTokens()) {
    tokenCount++;
    const elapsed = Date.now() - startTime;
    const tokensPerSecond = (tokenCount / elapsed) * 1000;

    console.log(`Token ${tokenCount}: ${token}`);
    console.log(`Speed: ${tokensPerSecond.toFixed(2)} tokens/sec`);
  }
};
```

**Step 2: Stream Health Check**

```typescript
const checkStreamHealth = async () => {
  const res = await fetch('/api/stream/health');
  const health = await res.json();

  console.log('Stream health:', {
    backend_status: health.status,
    avg_latency: health.avg_latency_ms,
    error_rate: health.error_rate,
  });
};
```

**See:** `references/examples.md#monitoring`

### Phase 8: Handle Edge Cases and Fallbacks

**Step 1: Implement Fallback to Non-Streaming**

```typescript
const startStream = async (message: string) => {
  try {
    // Try streaming
    return await streamResponse(message);
  } catch (error) {
    if (error.message.includes('stream')) {
      console.warn('Streaming failed, falling back to non-streaming');
      return await getNonStreamingResponse(message);
    }
    throw error;
  }
};
```

**Step 2: Handle Partial Responses**

```typescript
const startStream = async (message: string) => {
  let lastSuccessfulResponse = '';

  try {
    async for (const token of streamTokens()) {
      setResponse(prev => {
        lastSuccessfulResponse = prev + token;
        return lastSuccessfulResponse;
      });
    }
  } catch (error) {
    // Keep last successful response
    console.warn('Stream interrupted, keeping partial response');
    return lastSuccessfulResponse;
  }
};
```

**See:** `references/examples.md#edge-cases`

## Common Patterns

### Pattern 1: Simple SSE Streaming
One-way streaming from backend to frontend using Server-Sent Events. Simple and HTTP-based.

**See:** `references/examples.md#simple-sse`

### Pattern 2: Bidirectional WebSocket Streaming
Two-way streaming using WebSocket for real-time control and interruption.

**See:** `references/examples.md#websocket-streaming`

### Pattern 3: Hybrid Streaming + Polling
Streaming for responses, polling for acknowledgments and errors.

**See:** `references/examples.md#hybrid-streaming`

### Pattern 4: Multi-Token Buffering
Buffer tokens before rendering for better performance.

**See:** `references/examples.md#token-buffering`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Stream disconnects | Network issue, timeout | Implement reconnect logic, increase timeout |
| 503 Backend unavailable | Backend down | Add fallback endpoint, show user message |
| Incomplete response | Early disconnect | Save partial, allow retry |
| Slow token rate | Backend slow | Add metrics, check backend performance |
| Memory leak | Event listeners not cleaned | Cleanup streams, remove listeners |

**See:** `references/troubleshooting.md` for detailed solutions

## Decision Trees

### Which Streaming Method?

```
Need bidirectional? → Yes → Use WebSocket
                   → No → Use SSE

Need interruption? → Yes → Use WebSocket
                  → No → Use SSE or Polling

Simple setup? → Yes → Use SSE
             → No → Use WebSocket
```

### Buffering Strategy?

```
High latency network? → Yes → Buffer 10-20 tokens
                     → No → Buffer 2-5 tokens

Mobile device? → Yes → Buffer more
              → No → Buffer less
```

## References

**Detailed Guides:**
- Architecture patterns: `references/architecture-guide.md`
- Complete examples: `references/examples.md`
- Performance tuning: `references/performance-guide.md`
- Quick reference: `references/quick-reference.md`
- Troubleshooting: `references/troubleshooting.md`
- Official docs: `references/official-docs.md`

**Related Skills:**
- `openai-agent-sdk` - OpenAI Agent SDK skill
- `chatkit-ui` - ChatKit UI skill
- `chatkit-custom-backend` - Custom backend integration

## Tips for Success

1. **Start simple** - Get basic SSE working first
2. **Test streaming** - Use curl/Postman to test backend streaming
3. **Monitor latency** - Track token arrival times
4. **Handle errors** - Always have fallback or retry logic
5. **Buffer tokens** - Don't render every single token
6. **Clean up** - Close streams and remove listeners
7. **Performance test** - Test with various network speeds
8. **User feedback** - Show loading states, error messages

## Version History

**v1.0.0 (2026-01-11)**
- Initial release
- 8-phase streaming implementation workflow
- Support for SSE and WebSocket streaming
- Error handling and fallbacks
- Performance optimization patterns
- Complete examples with official docs

