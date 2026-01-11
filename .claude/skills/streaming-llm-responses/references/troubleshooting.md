# Streaming LLM Responses - Troubleshooting

## Issue 1: Stream Never Starts

**Error:** Fetch completes but no tokens arrive

**Causes:**
- Agent is hanging/slow to respond
- Endpoint not properly configured
- EventSource or ReadableStream not set up correctly

**Solution:**

```typescript
// Debug the connection
const res = await fetch('/api/stream/message', {
  method: 'POST',
  body: JSON.stringify({ message: 'test' }),
});

console.log('Status:', res.status); // Should be 200
console.log('Content-Type:', res.headers.get('content-type')); // Should include "text/event-stream"

const reader = res.body?.getReader();
console.log('Reader:', reader); // Should exist

// Set a timeout to detect if nothing arrives
const timeout = setTimeout(() => {
  console.error('No data received after 10 seconds');
}, 10000);

const { value } = await reader!.read();
clearTimeout(timeout);
console.log('First chunk:', value);
```

Backend check:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

@app.post("/api/stream/message")
async def stream_message(request: dict):
    print("Endpoint hit!")  # Verify endpoint is called
    user_input = request.get("message")
    print(f"Got message: {user_input}")

    async def event_generator():
        print("Event generator started")  # Track execution
        try:
            result = Runner.run_streamed(agent, user_input)
            print("Runner started")
            token_count = 0
            async for event in result.stream_events():
                print(f"Got event: {event.type}")
                if isinstance(event.data, ResponseTextDeltaEvent):
                    token_count += 1
                    print(f"Token {token_count}: {event.data.delta}")
                    yield f"data: {json.dumps({'token': event.data.delta})}\n\n"
        except Exception as e:
            print(f"Error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    print("Returning stream response")
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

---

## Issue 2: Stream Interrupts Mid-Response

**Error:** Connection closes before response completes

**Causes:**
- Timeout on server or client
- Network interruption
- Backend process crash
- Agent SDK hanging

**Solution:**

```typescript
// Frontend: Handle disconnection
const startStream = async (message: string) => {
  let lastSuccessfulResponse = '';

  try {
    const res = await fetch('/api/stream/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('Stream ended gracefully');
        break;
      }

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          lastSuccessfulResponse += data.token || '';
        }
      }
    }
  } catch (error) {
    console.warn('Stream interrupted, saving partial response:', error);
    setResponse(lastSuccessfulResponse);
    showNotification('Stream interrupted. Partial response saved.');
  }
};
```

Backend timeout configuration:

```python
import asyncio

@app.post("/api/stream/message")
async def stream_message(request: dict):
    timeout = 120  # 2 minutes

    async def event_generator():
        try:
            result = Runner.run_streamed(agent, user_input)
            token_count = 0

            async for event in result.stream_events():
                if isinstance(event.data, ResponseTextDeltaEvent):
                    token_count += 1
                    yield f"data: {json.dumps({'token': event.data.delta})}\n\n"

                    # Yield checkpoint for long responses
                    if token_count % 50 == 0:
                        yield f"data: {json.dumps({'type': 'checkpoint', 'tokens': token_count})}\n\n"

        except asyncio.TimeoutError:
            yield f"data: {json.dumps({'error': 'Response timeout'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

---

## Issue 3: CORS Errors on Streaming

**Error:** "Access to XMLHttpRequest blocked by CORS policy"

**Causes:**
- Missing CORS headers on streaming endpoint
- Wrong origin header
- Preflight request rejection

**Solution:**

```python
# Backend: Add CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Ensure streaming endpoint has CORS headers
@app.post("/api/stream/message")
async def stream_message(request: dict):
    async def event_generator():
        # ... streaming logic ...
        pass

    response = StreamingResponse(event_generator(), media_type="text/event-stream")
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
```

Frontend check:

```typescript
// Verify CORS headers in network tab
const res = await fetch('/api/stream/message', {
  method: 'POST',
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: 'test' }),
});

console.log('Response headers:', {
  cors: res.headers.get('access-control-allow-origin'),
  contentType: res.headers.get('content-type'),
});
```

---

## Issue 4: Tokens Arrive Too Slowly (High Latency)

**Error:** Long delays between tokens, poor user experience

**Causes:**
- Backend is slow (LLM inference time)
- Network latency
- Buffer not flushing frequently enough
- Large token batch delays

**Solution:**

```typescript
// Frontend: Monitor throughput
const startStream = async (message: string) => {
  const startTime = Date.now();
  let tokenCount = 0;
  let lastTokenTime = startTime;

  const res = await fetch('/api/stream/message', {
    method: 'POST',
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
        tokenCount++;

        const now = Date.now();
        const timeSinceLastToken = now - lastTokenTime;
        lastTokenTime = now;

        // Log if token takes > 1 second
        if (timeSinceLastToken > 1000) {
          console.warn(
            `Slow token #${tokenCount}: ${timeSinceLastToken}ms`
          );
        }

        setResponse((prev) => prev + (data.token || ''));
      }
    }
  }

  const totalTime = Date.now() - startTime;
  console.log(`Streaming complete:
    Tokens: ${tokenCount}
    Time: ${totalTime}ms
    Average: ${(totalTime / tokenCount).toFixed(1)}ms/token`);
};
```

Backend optimization:

```python
# Reduce overhead in token generation
@app.post("/api/stream/message")
async def stream_message(request: dict):
    async def event_generator():
        result = Runner.run_streamed(agent, user_input)

        async for event in result.stream_events():
            if isinstance(event.data, ResponseTextDeltaEvent):
                # Minimal JSON - avoid extra processing
                token = event.data.delta
                yield f"data: {json.dumps({'t': token})}\n\n"  # Shorter keys

    # Disable internal buffering
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable proxy buffering
        }
    )
```

---

## Issue 5: ChatKit Not Displaying Streamed Content

**Error:** Messages stream but ChatKit UI doesn't update

**Causes:**
- Streaming data format doesn't match ChatKit expectations
- Not properly integrating with ChatKit control
- Thread ID mismatch

**Solution:**

```typescript
// Verify ChatKit integration
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      const data = await res.json();
      console.log('Session created:', data.client_secret ? 'OK' : 'FAIL');
      return data.client_secret;
    },
  },
  onMessageSent: async ({ message }) => {
    console.log('User sent:', message.text);

    // Stream and accumulate
    let fullResponse = '';
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
          fullResponse += data.token || '';
        }
      }
    }

    // Send accumulated response
    console.log('Sending response to ChatKit:', fullResponse.length);
    await control?.sendMessage({
      role: 'assistant',
      content: fullResponse,
    });
  },
});
```

---

## Issue 6: WebSocket Connection Fails

**Error:** WebSocket connection refused or times out

**Causes:**
- WebSocket endpoint not configured
- Nginx/load balancer not passing upgrade headers
- Firewall blocking WebSocket

**Solution:**

```typescript
// Frontend: Better WebSocket error handling
const ws = new WebSocket(wsUrl);

ws.onerror = (event) => {
  console.error('WebSocket error:', event);
};

ws.onclose = (event) => {
  if (!event.wasClean) {
    console.error('Connection closed unexpectedly:', {
      code: event.code,
      reason: event.reason,
    });
  }
};

// Try to reconnect
const reconnect = () => {
  setTimeout(() => {
    ws = new WebSocket(wsUrl);
  }, 3000);
};
```

Nginx configuration:

```nginx
location /ws/stream {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 86400;
}
```

---

## Issue 7: Memory Leak with Streaming

**Error:** Browser memory usage grows unbounded

**Causes:**
- Event listeners not cleaned up
- Response string concatenation creating copies
- AbortController not implemented

**Solution:**

```typescript
import { useEffect, useRef } from 'react';

const useStreamingResponseSafe = () => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController>();

  const startStream = async (message: string) => {
    // Cancel previous request
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    setIsStreaming(true);
    setResponse('');

    try {
      const res = await fetch('/api/stream/message', {
        method: 'POST',
        signal: controllerRef.current.signal,
        body: JSON.stringify({ message }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (reader && !controllerRef.current?.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            // Append to existing string, don't create copies
            setResponse((prev) => prev + (data.token || ''));
          }
        }
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Stream error:', error);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    controllerRef.current?.abort();
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { response, isStreaming, startStream, stopStream };
};
```

---

## Issue 8: Agent SDK Not Streaming

**Error:** Runner.run_streamed() returns non-iterable or events don't emit

**Causes:**
- Agent configured without streaming
- Wrong model doesn't support streaming
- OpenAI API key invalid

**Solution:**

```python
# Verify Agent SDK setup
from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent

# Test directly
async def test_streaming():
    agent = Agent(
        name="TestAgent",
        instructions="You are helpful.",
        model="gpt-4o",  # Ensure streaming-capable model
    )

    result = Runner.run_streamed(agent, "Say hello")

    print("Result type:", type(result))
    print("Has stream_events:", hasattr(result, 'stream_events'))

    token_count = 0
    async for event in result.stream_events():
        print(f"Event: {event.type}")
        if isinstance(event.data, ResponseTextDeltaEvent):
            token_count += 1
            print(f"  Token {token_count}: {event.data.delta}")

    print(f"Total tokens: {token_count}")

# Run the test
import asyncio
asyncio.run(test_streaming())
```

Verify OpenAI API key:

```python
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")
print(f"API Key set: {'sk_...' if openai.api_key else 'NOT SET'}")

# Test model availability
try:
    response = openai.models.retrieve("gpt-4o")
    print(f"Model available: {response.id}")
except Exception as e:
    print(f"Model error: {e}")
```

---

## Debug Checklist

```python
# Backend checklist
□ Agent SDK installed: pip list | grep agents
□ Streaming model enabled: model = "gpt-4o"
□ OpenAI API key: echo $OPENAI_API_KEY
□ Streaming endpoint responds: curl -X POST http://localhost:8000/api/stream/message
□ Content-Type header correct: "text/event-stream"
□ No hanging in Runner.run_streamed()
□ Events iterate properly
□ Tokens contain data
□ JSON encoding works
```

```typescript
// Frontend checklist
□ Endpoint URL correct: console.log(new URL('/api/stream/message', location.href))
□ Fetch reaches server: check backend logs
□ Response status 200: console.log(res.status)
□ Content-Type "text/event-stream": console.log(res.headers.get('content-type'))
□ ReadableStream exists: console.log(res.body)
□ Data format correct: console.log(line.slice(6)) before parse
□ CORS headers present: check Network tab
□ No JavaScript errors: open DevTools console
□ ChatKit initialized: console.log(control)
```

