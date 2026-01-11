# Streaming LLM Responses - Complete Examples

## Example 1: Simple SSE Streaming with Agent SDK

Basic server-sent events streaming from Agent SDK backend to frontend.

### Backend (FastAPI)

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
        try:
            result = Runner.run_streamed(agent, user_input)
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        token = event.data.delta
                        yield f"data: {json.dumps({'token': token, 'type': 'token'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'type': 'error'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/chatkit/session")
async def create_session(request: dict):
    user_id = request.get("user_id", "default-user")
    session = await openai.chatkit.sessions.create({"user_id": user_id})
    return {"client_secret": session.client_secret}
```

### Frontend (React + ChatKit)

```typescript
// frontend/components/ChatWithStreaming.tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export function ChatWithStreaming() {
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
      await startStreaming(message.text);
    },
  });

  const startStreaming = async (userMessage: string) => {
    setIsStreaming(true);
    setStreamingText('');

    const res = await fetch('/api/stream/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              setStreamingText((prev) => prev + data.token);
            } else if (data.type === 'error') {
              console.error('Stream error:', data.error);
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }

    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatKit control={control} className="flex-1" />
      {isStreaming && (
        <div className="p-4 bg-gray-100 border-t">
          <p className="text-sm text-gray-600">Streaming response:</p>
          <p className="mt-2 text-gray-900">{streamingText}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Example 2: WebSocket Bidirectional Streaming

Full-duplex streaming with client control (pause, resume, stop).

### Backend (FastAPI + WebSocket)

```python
# backend/websocket_handler.py
from fastapi import FastAPI, WebSocket
from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent
import asyncio
import json

app = FastAPI()

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    current_task = None

    try:
        while True:
            data = await websocket.receive_json()
            command = data.get("command")

            if command == "start":
                user_input = data.get("message")

                async def stream_with_control():
                    try:
                        result = Runner.run_streamed(agent, user_input)
                        async for event in result.stream_events():
                            if event.type == "raw_response_event":
                                if isinstance(event.data, ResponseTextDeltaEvent):
                                    await websocket.send_json({
                                        "type": "token",
                                        "token": event.data.delta
                                    })
                    except Exception as e:
                        await websocket.send_json({
                            "type": "error",
                            "error": str(e)
                        })

                current_task = asyncio.create_task(stream_with_control())

            elif command == "stop":
                if current_task:
                    current_task.cancel()
                    current_task = None
                await websocket.send_json({"type": "stopped"})

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if current_task:
            current_task.cancel()
```

### Frontend (React Hook)

```typescript
// frontend/hooks/useWebSocketStreaming.ts
import { useEffect, useRef, useState } from 'react';

export function useWebSocketStreaming() {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsRef.current = new WebSocket(`${protocol}//${window.location.host}/ws/stream`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'token') {
        setResponse((prev) => prev + data.token);
      } else if (data.type === 'error') {
        setError(data.error);
        setIsStreaming(false);
      } else if (data.type === 'stopped') {
        setIsStreaming(false);
      }
    };

    wsRef.current.onerror = () => {
      setError('WebSocket connection failed');
      setIsStreaming(false);
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const startStream = (message: string) => {
    setIsStreaming(true);
    setResponse('');
    setError(null);

    wsRef.current?.send(JSON.stringify({
      command: 'start',
      message,
    }));
  };

  const stopStream = () => {
    wsRef.current?.send(JSON.stringify({ command: 'stop' }));
    setIsStreaming(false);
  };

  return { response, isStreaming, error, startStream, stopStream };
}
```

---

## Example 3: Streaming with Multi-Token Buffering

Optimized streaming that buffers multiple tokens before rendering.

### Backend

```python
# backend/buffered_streaming.py
@app.post("/api/stream/buffered")
async def stream_with_buffer(request: dict):
    user_input = request.get("message")
    buffer_size = request.get("buffer_size", 5)

    async def event_generator():
        buffer = []
        try:
            result = Runner.run_streamed(agent, user_input)
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        buffer.append(event.data.delta)

                        if len(buffer) >= buffer_size:
                            combined = ''.join(buffer)
                            yield f"data: {json.dumps({'tokens': combined, 'count': len(buffer)})}\n\n"
                            buffer = []

            # Flush remaining
            if buffer:
                combined = ''.join(buffer)
                yield f"data: {json.dumps({'tokens': combined, 'count': len(buffer), 'final': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### Frontend

```typescript
// frontend/hooks/useBufferedStreaming.ts
const useBufferedStreaming = () => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async (message: string) => {
    setIsStreaming(true);
    setResponse('');

    const res = await fetch('/api/stream/buffered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, buffer_size: 10 }),
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
          setResponse((prev) => prev + data.tokens);
        }
      }
    }

    setIsStreaming(false);
  };

  return { response, isStreaming, startStream };
};
```

---

## Example 4: Streaming with Error Recovery

Robust streaming with automatic reconnection and state recovery.

### Backend

```python
# backend/resilient_streaming.py
@app.post("/api/stream/resilient")
async def resilient_stream(request: dict):
    user_input = request.get("message")
    message_id = request.get("message_id")

    async def event_generator():
        try:
            result = Runner.run_streamed(agent, user_input)
            token_count = 0

            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        token_count += 1
                        yield f"data: {json.dumps({
                            'token': event.data.delta,
                            'token_count': token_count,
                            'message_id': message_id
                        })}\n\n"
        except asyncio.CancelledError:
            # Client disconnected
            yield f"data: {json.dumps({'type': 'cancelled', 'message_id': message_id})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({
                'type': 'error',
                'error': str(e),
                'message_id': message_id
            })}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### Frontend

```typescript
// frontend/hooks/useResilientStreaming.ts
const useResilientStreaming = () => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageIdRef = useRef<string | null>(null);

  const startStream = async (message: string, maxRetries = 3) => {
    messageIdRef.current = `msg_${Date.now()}`;
    setIsStreaming(true);
    setResponse('');
    setError(null);

    let retries = 0;

    const attemptStream = async (): Promise<boolean> => {
      try {
        const res = await fetch('/api/stream/resilient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            message_id: messageIdRef.current,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'error') {
                setError(data.error);
                return false;
              }
              setResponse((prev) => prev + (data.token || ''));
            }
          }
        }

        return true;
      } catch (err) {
        console.error(`Stream attempt ${retries + 1} failed:`, err);
        retries++;

        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
          return attemptStream();
        }

        return false;
      }
    };

    const success = await attemptStream();
    setIsStreaming(false);

    if (!success && !error) {
      setError('Failed to stream response after retries');
    }
  };

  return { response, isStreaming, error, startStream };
};
```

---

## Example 5: Streaming with ChatKit Integration

Full integration with ChatKit UI component and streaming backend.

### Backend

```python
# backend/chatkit_streaming.py
@app.post("/api/stream/chatkit")
async def stream_for_chatkit(request: dict):
    user_input = request.get("message")
    thread_id = request.get("thread_id")

    async def event_generator():
        try:
            # Create agent with thread context
            result = Runner.run_streamed(
                agent,
                user_input,
                metadata={"thread_id": thread_id}
            )

            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        # Stream tokens as ChatKit expects
                        yield f"data: {json.dumps({
                            'token': event.data.delta,
                            'thread_id': thread_id
                        })}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({
                'error': str(e),
                'thread_id': thread_id
            })}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### Frontend (ChatKit Integration)

```typescript
// frontend/components/ChatKitWithStreaming.tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useCallback, useState } from 'react';

export function ChatKitWithStreaming() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [streamingStatus, setStreamingStatus] = useState('idle');

  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          const res = await fetch('/api/chatkit/refresh', {
            method: 'POST',
            body: JSON.stringify({ token: existing }),
          });
          if (res.ok) {
            return (await res.json()).client_secret;
          }
        }

        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    onThreadChange: ({ threadId: newThreadId }) => {
      setThreadId(newThreadId || null);
    },
    onMessageSent: useCallback(
      async ({ message }) => {
        if (!threadId) return;

        setStreamingStatus('streaming');

        const res = await fetch('/api/stream/chatkit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message.text,
            thread_id: threadId,
          }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                fullResponse += data.token;
              }
            }
          }
        }

        // Send accumulated response as assistant message
        await control?.sendMessage({
          role: 'assistant',
          content: fullResponse,
        });

        setStreamingStatus('idle');
      },
      [threadId, control]
    ),
  });

  return (
    <div className="flex flex-col h-screen gap-4">
      <ChatKit control={control} className="flex-1" />
      {streamingStatus === 'streaming' && (
        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-sm">
          ✨ Streaming response...
        </div>
      )}
    </div>
  );
}
```

---

## Example 6: Streaming with Performance Monitoring

Streaming with metrics collection and performance tracking.

### Backend

```python
# backend/monitored_streaming.py
import time
from collections import deque

class StreamMetrics:
    def __init__(self, message_id: str):
        self.message_id = message_id
        self.start_time = time.time()
        self.token_times = deque(maxlen=100)
        self.total_tokens = 0

    def record_token(self):
        self.total_tokens += 1
        self.token_times.append(time.time())

    def get_throughput(self):
        if len(self.token_times) < 2:
            return 0
        elapsed = self.token_times[-1] - self.token_times[0]
        return len(self.token_times) / elapsed if elapsed > 0 else 0

    def get_metrics(self):
        return {
            'total_tokens': self.total_tokens,
            'elapsed_seconds': time.time() - self.start_time,
            'throughput_tokens_per_sec': self.get_throughput(),
        }

@app.post("/api/stream/monitored")
async def monitored_stream(request: dict):
    user_input = request.get("message")
    message_id = request.get("message_id", f"msg_{int(time.time())}")
    metrics = StreamMetrics(message_id)

    async def event_generator():
        try:
            result = Runner.run_streamed(agent, user_input)
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        metrics.record_token()
                        yield f"data: {json.dumps({
                            'token': event.data.delta,
                            'metrics': metrics.get_metrics()
                        })}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({
                'error': str(e),
                'metrics': metrics.get_metrics()
            })}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### Frontend with Metrics Display

```typescript
// frontend/components/StreamingWithMetrics.tsx
'use client';

import { useState } from 'react';

export function StreamingWithMetrics() {
  const [response, setResponse] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async (message: string) => {
    setIsStreaming(true);
    setResponse('');
    setMetrics(null);

    const res = await fetch('/api/stream/monitored', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        message_id: `msg_${Date.now()}`,
      }),
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
          if (data.token) {
            setResponse((prev) => prev + data.token);
          }
          if (data.metrics) {
            setMetrics(data.metrics);
          }
        }
      }
    }

    setIsStreaming(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              startStream((e.target as HTMLInputElement).value);
            }
          }}
          disabled={isStreaming}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p>{response}</p>
      </div>

      {metrics && (
        <div className="p-4 bg-blue-50 rounded text-sm">
          <h3 className="font-semibold mb-2">Performance Metrics</h3>
          <ul className="space-y-1">
            <li>Tokens: {metrics.total_tokens}</li>
            <li>Time: {metrics.elapsed_seconds.toFixed(2)}s</li>
            <li>
              Throughput:{' '}
              {metrics.throughput_tokens_per_sec.toFixed(2)}{' '}
              tokens/sec
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Example 7: Hybrid Streaming + Polling Fallback

Streaming with automatic fallback to polling if streaming fails.

### Backend

```python
# backend/hybrid_streaming.py
from fastapi import BackgroundTasks

# In-memory message store
messages_cache: dict[str, list[str]] = {}

@app.post("/api/stream/hybrid")
async def hybrid_stream(request: dict, background_tasks: BackgroundTasks):
    user_input = request.get("message")
    message_id = request.get("message_id", f"msg_{int(time.time())}")
    messages_cache[message_id] = []

    async def event_generator():
        try:
            result = Runner.run_streamed(agent, user_input)
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        token = event.data.delta
                        messages_cache[message_id].append(token)
                        yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    # Cleanup after stream
    def cleanup():
        if message_id in messages_cache:
            del messages_cache[message_id]

    background_tasks.add_task(cleanup)
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/message/{message_id}")
async def get_message(message_id: str):
    """Polling endpoint for non-streaming clients"""
    tokens = messages_cache.get(message_id, [])
    return {"message_id": message_id, "tokens": tokens, "complete": message_id not in messages_cache}
```

### Frontend with Fallback

```typescript
// frontend/hooks/useHybridStreaming.ts
const useHybridStreaming = () => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [method, setMethod] = useState<'streaming' | 'polling'>('streaming');

  const pollForMessage = async (messageId: string) => {
    const startTime = Date.now();
    const maxDuration = 120000; // 2 minutes

    while (Date.now() - startTime < maxDuration) {
      const res = await fetch(`/api/message/${messageId}`);
      const data = await res.json();

      const newTokens = data.tokens.slice(
        response.length / 2 // Approximate token count
      );
      setResponse((prev) => prev + newTokens.join(''));

      if (data.complete) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return false;
  };

  const startStream = async (message: string) => {
    setIsStreaming(true);
    setResponse('');
    setMethod('streaming');

    const messageId = `msg_${Date.now()}`;

    try {
      const res = await fetch('/api/stream/hybrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, message_id: messageId }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No streaming support');

      const decoder = new TextDecoder();

      while (true) {
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
      console.warn('Streaming failed, falling back to polling:', err);
      setMethod('polling');
      await pollForMessage(messageId);
    }

    setIsStreaming(false);
  };

  return { response, isStreaming, method, startStream };
};
```

---

## Example 8: Streaming with Markdown Rendering

Real-time markdown parsing and rendering as tokens arrive.

### Frontend

```typescript
// frontend/components/StreamingMarkdown.tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export function StreamingMarkdown() {
  const [markdown, setMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async (message: string) => {
    setIsStreaming(true);
    setMarkdown('');

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
          setMarkdown((prev) => prev + (data.token || ''));
        }
      }
    }

    setIsStreaming(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Ask a question..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            startStream((e.target as HTMLInputElement).value);
          }
        }}
        disabled={isStreaming}
        className="w-full p-2 border rounded mb-4"
      />

      <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded text-white">
        <ReactMarkdown
          components={{
            code: ({ inline, className, children }) =>
              inline ? (
                <code className="bg-gray-800 px-1 rounded">{children}</code>
              ) : (
                <SyntaxHighlighter
                  language={
                    className?.replace('language-', '') || 'text'
                  }
                  style={{ margin: 0 }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {isStreaming && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Streaming...
        </div>
      )}
    </div>
  );
}
```

