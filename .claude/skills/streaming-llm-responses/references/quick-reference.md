# Streaming LLM Responses - Quick Reference

## Backend Setup

### Basic FastAPI Streaming Endpoint

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent
import json

@app.post("/api/stream/message")
async def stream_message(request: dict):
    user_input = request.get("message")

    async def event_generator():
        result = Runner.run_streamed(agent, user_input)
        async for event in result.stream_events():
            if isinstance(event.data, ResponseTextDeltaEvent):
                yield f"data: {json.dumps({'token': event.data.delta})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### Express.js Streaming Endpoint

```typescript
app.post('/api/stream/message', async (req, res) => {
  const userInput = req.body.message;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await agentRunner.streamResponse(userInput);

  for await (const token of stream) {
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
  }

  res.end();
});
```

## Frontend Consumption

### EventSource API (Simple SSE)

```typescript
const eventSource = new EventSource('/api/stream/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userInput }),
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setResponse((prev) => prev + data.token);
};

eventSource.onerror = () => {
  setError('Stream error');
  eventSource.close();
};
```

### ReadableStream API (Modern Fetch)

```typescript
const res = await fetch('/api/stream/message', {
  method: 'POST',
  body: JSON.stringify({ message: userInput }),
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
      setResponse((prev) => prev + data.token);
    }
  }
}
```

## React Hooks

### useStreamingResponse Hook

```typescript
import { useState } from 'react';

export function useStreamingResponse() {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = async (message: string) => {
    setIsStreaming(true);
    setResponse('');
    setError(null);

    try {
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
            setResponse((prev) => prev + (data.token || ''));
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsStreaming(false);
    }
  };

  return { response, isStreaming, error, startStream };
}
```

### useWebSocketStreaming Hook

```typescript
import { useEffect, useRef, useState } from 'react';

export function useWebSocketStreaming(url: string) {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const startStream = (message: string) => {
    setIsStreaming(true);
    setResponse('');

    wsRef.current?.send(JSON.stringify({ command: 'start', message }));
  };

  const stopStream = () => {
    wsRef.current?.send(JSON.stringify({ command: 'stop' }));
    setIsStreaming(false);
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsRef.current = new WebSocket(`${protocol}//${url}`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.token) {
        setResponse((prev) => prev + data.token);
      }
    };

    return () => wsRef.current?.close();
  }, [url]);

  return { response, isStreaming, startStream, stopStream };
}
```

## Token Buffering Patterns

### Simple Token Accumulator

```typescript
const [buffer, setBuffer] = useState('');
const BUFFER_SIZE = 5;

const addToken = (token: string) => {
  const newBuffer = buffer + token;

  if (newBuffer.length >= BUFFER_SIZE) {
    setResponse((prev) => prev + newBuffer);
    setBuffer('');
  } else {
    setBuffer(newBuffer);
  }
};

// On stream end
if (buffer) {
  setResponse((prev) => prev + buffer);
  setBuffer('');
}
```

### Time-Based Buffering

```typescript
const [buffer, setBuffer] = useState('');
const bufferTimeoutRef = useRef<NodeJS.Timeout>();

const addToken = (token: string) => {
  const newBuffer = buffer + token;
  setBuffer(newBuffer);

  // Clear existing timeout
  if (bufferTimeoutRef.current) {
    clearTimeout(bufferTimeoutRef.current);
  }

  // Flush after 100ms of inactivity
  bufferTimeoutRef.current = setTimeout(() => {
    if (buffer) {
      setResponse((prev) => prev + newBuffer);
      setBuffer('');
    }
  }, 100);
};
```

## Error Handling Patterns

### Retry with Exponential Backoff

```typescript
const streamWithRetry = async (
  message: string,
  maxRetries = 3
): Promise<boolean> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch('/api/stream/message', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Stream handling...
      return true;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
};
```

### Error Boundary for Streaming

```typescript
interface StreamError {
  type: 'timeout' | 'network' | 'parse' | 'unknown';
  message: string;
  recoverable: boolean;
}

const handleStreamError = (error: unknown): StreamError => {
  if (error instanceof TypeError) {
    if (error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Connection failed',
        recoverable: true,
      };
    }
  }

  if (error instanceof SyntaxError) {
    return {
      type: 'parse',
      message: 'Failed to parse response',
      recoverable: false,
    };
  }

  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'Unknown error',
    recoverable: false,
  };
};
```

## ChatKit Integration Patterns

### Session Creation

```typescript
const getClientSecret = async (): Promise<string> => {
  const res = await fetch('/api/chatkit/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Session creation failed');

  const data = await res.json();
  return data.client_secret;
};
```

### Backend Session Endpoint

```python
@app.post("/api/chatkit/session")
async def create_session(request: Request):
    user = await get_current_user(request)

    session = await openai.chatkit.sessions.create({
        "user_id": user.id,
        "model": "gpt-4o",
    })

    return {
        "client_secret": session.client_secret,
        "expires_at": session.expires_at,
    }
```

### Streaming Message Handler

```typescript
const handleStreamingMessage = async (
  message: string,
  threadId: string
) => {
  const res = await fetch('/api/stream/chatkit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, thread_id: threadId }),
  });

  let fullResponse = '';
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
        fullResponse += data.token || '';
      }
    }
  }

  return fullResponse;
};
```

## Performance Optimization

### Lazy Loading Streaming Component

```typescript
import { lazy, Suspense } from 'react';

const StreamingChat = lazy(() => import('./StreamingChat'));

export function App() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <StreamingChat />
    </Suspense>
  );
}
```

### Memoized Streaming Component

```typescript
import { memo, useCallback } from 'react';

const StreamingChatComponent = memo(function StreamingChat() {
  const handleMessage = useCallback(async (message: string) => {
    // Handle message
  }, []);

  return <div>{/* Chat UI */}</div>;
});
```

### Request Debouncing

```typescript
import { useRef, useState } from 'react';

export function useDebouncedStream(delay: number = 300) {
  const [response, setResponse] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const stream = (message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Actual streaming call
    }, delay);
  };

  return { response, stream };
}
```

## Timeout Patterns

### Request Timeout

```typescript
const streamWithTimeout = async (
  message: string,
  timeout: number = 120000
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch('/api/stream/message', {
      method: 'POST',
      signal: controller.signal,
      body: JSON.stringify({ message }),
    });

    // Handle response...
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Stream timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
```

### Heartbeat Timeout (WebSocket)

```typescript
const heartbeatInterval = setInterval(() => {
  ws.send(JSON.stringify({ type: 'heartbeat' }));
}, 30000);

const heartbeatTimeout = setTimeout(() => {
  ws.close();
  throw new Error('Stream timeout - no heartbeat');
}, 60000);

ws.onmessage = (event) => {
  clearTimeout(heartbeatTimeout);
  // Reset timeout on each message
};
```

## Streaming State Management

### Zustand Store

```typescript
import { create } from 'zustand';

interface StreamStore {
  response: string;
  isStreaming: boolean;
  error: string | null;
  addToken: (token: string) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useStreamStore = create<StreamStore>((set) => ({
  response: '',
  isStreaming: false,
  error: null,

  addToken: (token) =>
    set((state) => ({
      response: state.response + token,
    })),

  setStreaming: (streaming) =>
    set({ isStreaming: streaming }),

  setError: (error) =>
    set({ error }),

  reset: () =>
    set({ response: '', isStreaming: false, error: null }),
}));
```

## Environment Configuration

```bash
# Backend
AGENT_MODEL=gpt-4o
STREAM_TIMEOUT=120
BUFFER_SIZE=5
LOG_LEVEL=info

# Frontend
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STREAM_TIMEOUT=120000
NEXT_PUBLIC_BUFFER_SIZE=5
```

## TypeScript Types

```typescript
interface StreamToken {
  token: string;
  type?: 'token' | 'error' | 'complete';
}

interface StreamOptions {
  timeout?: number;
  bufferSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface StreamMetrics {
  totalTokens: number;
  elapsedSeconds: number;
  throughputTokensPerSec: number;
}

interface StreamEvent {
  type: 'start' | 'token' | 'error' | 'complete';
  data: StreamToken | string;
  timestamp: number;
}
```

## Testing Patterns

### Mock Streaming Response

```typescript
// __mocks__/fetch.ts
global.fetch = jest.fn((url: string) => {
  if (url.includes('/api/stream')) {
    return Promise.resolve({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"token":"Hello"}\n\n'),
            })
            .mockResolvedValueOnce({
              done: true,
              value: undefined,
            }),
        }),
      },
    });
  }
  return Promise.reject(new Error('Not mocked'));
});
```

### Test Streaming Hook

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamingResponse } from './useStreamingResponse';

describe('useStreamingResponse', () => {
  it('should stream tokens', async () => {
    const { result } = renderHook(() => useStreamingResponse());

    act(() => {
      result.current.startStream('test message');
    });

    await waitFor(() => {
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.response).toContain('Hello');
    });
  });
});
```

## Debugging

### Enable Stream Logging

```typescript
const streamWithLogging = async (message: string) => {
  console.log('[Stream] Starting:', message);
  const startTime = Date.now();

  const res = await fetch('/api/stream/message', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let tokenCount = 0;

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        tokenCount++;
        const data = JSON.parse(line.slice(6));
        console.log(`[Stream] Token ${tokenCount}:`, data.token);
      }
    }
  }

  const duration = Date.now() - startTime;
  console.log('[Stream] Complete:', {
    tokens: tokenCount,
    duration: `${duration}ms`,
    throughput: `${(tokenCount / (duration / 1000)).toFixed(2)} tokens/sec`,
  });
};
```

### Chrome DevTools Network Tab

1. Open DevTools → Network tab
2. Filter by "stream" or "ws"
3. Select request → Response tab
4. See SSE messages in real-time
5. Check Headers for proper CORS and content-type

### Firefox Developer Tools

1. Developer Tools → Storage → Cookies (for auth)
2. Network tab → Filter → XHR
3. Select streaming request
4. Response tab shows event stream
5. Use console for debugging

