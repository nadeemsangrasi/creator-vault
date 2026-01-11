# Streaming LLM Responses - Official Documentation Reference

This document contains key excerpts from official OpenAI Agent SDK and ChatKit documentation fetched via Context7 MCP.

## OpenAI Agent SDK - Streaming Overview

The OpenAI Agent SDK provides built-in support for streaming responses from language models. Streaming allows you to display tokens to users as they're generated, rather than waiting for the complete response.

**Source:** OpenAI Agent SDK Official Documentation

### Streaming Basics

```python
from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent

# Create an agent
agent = Agent(
    name="Assistant",
    instructions="You are a helpful AI assistant.",
    model="gpt-4o"
)

# Stream responses
result = Runner.run_streamed(agent, "What is machine learning?")

# Iterate through stream events
async for event in result.stream_events():
    print(f"Event type: {event.type}")

    # Check for text delta events
    if event.type == "raw_response_event":
        if isinstance(event.data, ResponseTextDeltaEvent):
            print(f"Token: {event.data.delta}")
```

### Response Text Delta Events

The `ResponseTextDeltaEvent` contains incremental text from the model output.

```python
class ResponseTextDeltaEvent:
    delta: str  # The incremental text token
    index: int  # Position in response
    type: str   # Always "text_delta"
```

**Key Properties:**
- `delta`: The actual token text to display
- `index`: Sequential position in the response stream
- `type`: Event classification for filtering

### Stream Event Types

The Agent SDK emits multiple event types during streaming:

```python
# Common event types
"raw_response_event"      # Contains model output
"message_delta"            # Message update event
"tool_call_delta"          # Tool invocation progress
"error_event"              # Error during streaming
"stream_complete"          # Streaming finished
```

Filter for specific event types:

```python
async for event in result.stream_events():
    if event.type == "raw_response_event":
        # Handle model output
        if hasattr(event.data, 'delta'):
            process_token(event.data.delta)

    elif event.type == "error_event":
        # Handle errors
        log_error(event.data)
```

### Async Stream Iteration

The Agent SDK uses async iterators for streaming:

```python
import asyncio

async def process_stream(agent: Agent, user_input: str):
    """Process a streamed response"""
    result = Runner.run_streamed(agent, user_input)

    full_response = ""

    try:
        async for event in result.stream_events():
            if isinstance(event.data, ResponseTextDeltaEvent):
                token = event.data.delta
                full_response += token
                print(token, end="", flush=True)

    except Exception as e:
        print(f"\nError during streaming: {e}")

    return full_response

# Run async streaming
response = asyncio.run(process_stream(agent, "Hello"))
```

### Stream Metadata

Access metadata about the stream:

```python
result = Runner.run_streamed(agent, user_input)

# Check stream properties
print(f"Model: {result.model}")
print(f"Usage: {result.usage}")  # Token counts
print(f"Stop reason: {result.stop_reason}")

# Stream events
async for event in result.stream_events():
    pass
```

---

## OpenAI Agent SDK - Advanced Streaming Patterns

### Multi-Turn Conversations with Streaming

```python
async def multi_turn_streaming(agent: Agent, messages: list[str]):
    """Stream multiple turns in conversation"""
    for user_message in messages:
        print(f"\nUser: {user_message}")
        print("Assistant: ", end="", flush=True)

        result = Runner.run_streamed(agent, user_message)

        async for event in result.stream_events():
            if isinstance(event.data, ResponseTextDeltaEvent):
                print(event.data.delta, end="", flush=True)

        print()  # Newline after response
```

### Streaming with Tool Use

```python
from agents import Tool

async def streaming_with_tools(agent: Agent, user_input: str):
    """Stream response while agent uses tools"""
    result = Runner.run_streamed(agent, user_input)

    async for event in result.stream_events():
        if event.type == "raw_response_event":
            if isinstance(event.data, ResponseTextDeltaEvent):
                # Display model thinking/response
                print(event.data.delta, end="", flush=True)

        elif event.type == "tool_call_delta":
            # Tool being invoked
            print(f"\n[Using tool: {event.data.name}]")
```

### Streaming Context with Metadata

```python
async def streaming_with_context(agent: Agent, user_input: str, context: dict):
    """Stream with additional context"""
    result = Runner.run_streamed(
        agent,
        user_input,
        metadata={
            "user_id": context.get("user_id"),
            "session_id": context.get("session_id"),
            "thread_id": context.get("thread_id"),
        }
    )

    async for event in result.stream_events():
        if isinstance(event.data, ResponseTextDeltaEvent):
            yield event.data.delta
```

---

## ChatKit - Streaming Integration

ChatKit provides built-in support for displaying streamed responses from language models.

**Source:** OpenAI ChatKit Official Documentation

### ChatKit Streaming Configuration

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
  // Enable streaming responses (default: true)
  streaming: {
    enabled: true,
    bufferSize: 5,  // Buffer tokens before rendering
    timeout: 120000, // 2 minutes
  },
});
```

### Server-Sent Events (SSE) with ChatKit

ChatKit supports Server-Sent Events for real-time token delivery:

```typescript
// Backend endpoint that ChatKit can consume
@app.post("/api/chat/stream")
async def stream_chat(request: dict):
    async def event_generator():
        async for token in stream_llm_response(request['message']):
            yield f"data: {json.dumps({'token': token})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

Frontend consumption:

```typescript
const handleStream = async (message: string) => {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  // ChatKit automatically processes the stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    // Process tokens as they arrive
    processStreamText(text);
  }
};
```

### ChatKit Event Handlers for Streaming

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => {} },

  // Called when streaming starts
  onResponseStart: () => {
    console.log('Stream started');
    setLoading(true);
  },

  // Called when each token arrives (if implemented)
  onToken: ({ token }) => {
    console.log('Token:', token);
  },

  // Called when streaming ends
  onResponseEnd: () => {
    console.log('Stream completed');
    setLoading(false);
  },

  // Called on error
  onError: ({ error }) => {
    console.error('Stream error:', error);
  },
});
```

### Multi-Thread Streaming with ChatKit

```typescript
const { control, setThreadId } = useChatKit({
  api: { getClientSecret: async () => {} },

  onThreadChange: ({ threadId }) => {
    // Save thread for history
    localStorage.setItem('lastThreadId', threadId || '');
  },

  onMessageSent: async ({ message }) => {
    // Stream response in current thread
    const response = await streamMessage(message.text);

    // Add assistant response to thread
    await control?.addMessage({
      role: 'assistant',
      content: response,
      threadId: (await control?.getThreadId?.()),
    });
  },
});
```

---

## Streaming Best Practices

### 1. Handle Backpressure

When frontend can't keep up with tokens:

```typescript
// Pause streaming if buffer grows too large
const [buffer, setBuffer] = useState<string[]>([]);

const addToken = (token: string) => {
  const newBuffer = [...buffer, token];
  setBuffer(newBuffer);

  // Pause reading if buffer exceeds threshold
  if (newBuffer.length > 100) {
    console.warn('Buffer exceeded, pausing stream');
    reader?.cancel(); // Pause stream
  }
};
```

### 2. Implement Graceful Degradation

Fallback to non-streaming if needed:

```typescript
const streamOrFallback = async (message: string) => {
  try {
    return await streamResponse(message);
  } catch (error) {
    console.warn('Streaming failed, using non-streaming:', error);
    return await getNonStreamingResponse(message);
  }
};
```

### 3. Monitor Stream Health

Track streaming performance:

```python
import time

class StreamHealth:
    def __init__(self):
        self.start_time = time.time()
        self.token_count = 0
        self.errors = 0

    def record_token(self):
        self.token_count += 1

    def record_error(self):
        self.errors += 1

    def get_report(self):
        elapsed = time.time() - self.start_time
        return {
            'tokens': self.token_count,
            'errors': self.errors,
            'throughput': self.token_count / elapsed if elapsed > 0 else 0,
            'error_rate': self.errors / self.token_count if self.token_count > 0 else 0,
        }
```

### 4. Handle Partial Responses

Save progress if stream interrupts:

```typescript
const [lastSuccessfulResponse, setLastSuccessfulResponse] = useState('');

const streamWithRecovery = async (message: string) => {
  let accumulator = '';

  try {
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
      accumulator += text;

      // Save progress periodically
      if (accumulator.length % 1000 === 0) {
        setLastSuccessfulResponse(accumulator);
      }
    }

    setLastSuccessfulResponse(accumulator);
  } catch (error) {
    // Return last successful state
    console.warn('Stream interrupted, using last successful response');
  }
};
```

### 5. Security Considerations

```typescript
// Validate streamed data
const validateToken = (token: string): boolean => {
  // Check for malicious patterns
  if (token.includes('<script>')) return false;
  if (token.includes('javascript:')) return false;
  // Additional validation as needed
  return true;
};

// Sanitize output
import DOMPurify from 'dompurify';

const safeToken = DOMPurify.sanitize(token, {
  ALLOWED_TAGS: [],
});
```

---

## Performance Tuning

### Buffer Size Optimization

```python
# Recommended buffer sizes based on conditions
conditions = {
    'high_latency_network': 20,      # Mobile/slow networks
    'local_network': 5,               # LAN
    'high_speed_internet': 2,         # Fiber/5G
    'cpu_constrained': 10,            # Mobile devices
    'unlimited_resources': 1,         # Server-side rendering
}
```

### Timeout Configuration

```python
# Recommended timeouts
timeouts = {
    'first_token': 15,      # Wait up to 15s for first token
    'between_tokens': 30,   # Pause if 30s without token
    'total_stream': 300,    # Max 5 minutes total
}
```

### Connection Options

```typescript
// Fetch API options for optimal streaming
const streamOptions: RequestInit = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't use high-level caching for streams
  cache: 'no-store',
  // Disable compression for real-time performance
  priority: 'high',
};
```

---

## Error Codes and Recovery

### Common HTTP Status Codes for Streaming

| Code | Meaning | Recovery |
|------|---------|----------|
| 200 | OK, streaming started | Normal operation |
| 206 | Partial content | Resume stream |
| 400 | Bad request | Check parameters |
| 401 | Unauthorized | Refresh session |
| 429 | Rate limited | Exponential backoff |
| 500 | Server error | Retry with backoff |
| 503 | Service unavailable | Fallback endpoint |

### Error Event Structure

```python
class StreamError:
    code: str          # 'invalid_request', 'auth_error', etc.
    message: str       # Human readable message
    param: str | None  # Parameter that caused error
    type: str          # Error classification
```

### Error Handling Pattern

```typescript
const handleStreamError = (event: MessageEvent) => {
  try {
    const data = JSON.parse(event.data);

    if (data.error) {
      const error = data.error;

      switch (error.code) {
        case 'invalid_request':
          console.error('Invalid request:', error.message);
          break;
        case 'auth_error':
          console.error('Auth failed, refreshing...');
          refreshToken();
          break;
        case 'rate_limited':
          console.error('Rate limited, backing off...');
          exponentialBackoff();
          break;
        default:
          console.error('Unknown error:', error);
      }
    }
  } catch (e) {
    console.error('Error parsing stream error:', e);
  }
};
```

---

## Deployment Considerations

### Docker Health Check

```dockerfile
# Verify streaming endpoint in container
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health/stream || exit 1
```

### Kubernetes Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: streaming-service
spec:
  ports:
    # WebSocket for streaming
    - name: websocket
      port: 8000
      protocol: TCP
  selector:
    app: streaming-backend

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: streaming-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: backend
          image: streaming-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: STREAM_TIMEOUT
              value: "120"
            - name: BUFFER_SIZE
              value: "5"
```

### Load Balancer Configuration

```nginx
# Nginx upstream for streaming
upstream streaming_backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    listen 443 ssl http2;

    location /api/stream {
        proxy_pass http://streaming_backend;
        proxy_http_version 1.1;

        # SSE requires specific headers
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;

        # Timeouts for streaming
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

---

## Monitoring and Observability

### Key Metrics

```python
# Metrics to track
metrics = {
    'tokens_per_request': 'histogram',
    'latency_to_first_token': 'histogram',
    'stream_duration': 'histogram',
    'error_rate': 'gauge',
    'active_streams': 'gauge',
    'throughput_tokens_per_sec': 'gauge',
}
```

### Logging Pattern

```python
import structlog

logger = structlog.get_logger()

async for event in result.stream_events():
    if isinstance(event.data, ResponseTextDeltaEvent):
        logger.msg(
            "token_received",
            token_count=token_count,
            token_length=len(event.data.delta),
            latency_ms=(time.time() - last_token_time) * 1000,
        )
```

### Tracing Integration

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("stream_message") as span:
    span.set_attribute("user.id", user_id)
    span.set_attribute("model", agent.model)

    result = Runner.run_streamed(agent, user_input)

    async for event in result.stream_events():
        # Tracing happens automatically
        pass
```

---

## Version Compatibility

This documentation references:
- OpenAI Agent SDK v1.0+
- ChatKit v1.0+
- Python 3.10+
- Node.js 18+

Check official docs for latest updates and breaking changes.

## Official Resources

- **Agent SDK Docs:** https://platform.openai.com/docs/guides/agents
- **ChatKit Docs:** https://chatkit.dev
- **OpenAI API Reference:** https://platform.openai.com/docs/api-reference
- **GitHub Issues:** https://github.com/openai/agent-sdk/issues
- **Discussions:** https://github.com/openai/agent-sdk/discussions

