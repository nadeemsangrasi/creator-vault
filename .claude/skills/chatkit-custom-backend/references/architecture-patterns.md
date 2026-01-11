# ChatKit Custom Backend - Architecture Patterns

## Pattern 1: Simple Non-Streaming Backend

### Use Case
Backend returns complete responses. ChatKit displays after full response received. Best for simple AI APIs.

### Architecture Flow

```
Frontend (React)
    ↓
ChatKit Component
    ↓
/api/custom/session (NextJS proxy)
    ↓
Your Backend API
    ↓
AI Model / Logic
    ↓
Response (complete)
    ↓
ChatKit displays
```

### Implementation

```typescript
// Backend: FastAPI
@app.post("/api/chat")
async def chat(message: str, session_id: str):
    response = model.generate(message)  # Wait for complete response
    return {"response": response}

// Frontend: NextJS Proxy
export async function POST(req: Request) {
  const { message } = await req.json();

  const response = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/api/chat`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );

  const data = await response.json();
  return Response.json({ response: data.response });
}

// Frontend: React Component
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
});
```

### Advantages
- ✅ Simplest to implement
- ✅ No streaming complexity
- ✅ Works with any backend

### Disadvantages
- ❌ Full response delay (model thinking time)
- ❌ Poor perceived performance
- ❌ No token-by-token feedback

### Best For
- Simple backends (classification, short responses)
- APIs with fast response times
- Internal tools

---

## Pattern 2: Streaming Backend (SSE)

### Use Case
Backend streams responses using Server-Sent Events. Tokens appear in real-time as generated.

### Architecture Flow

```
Frontend
    ↓
ChatKit Component
    ↓
/api/custom/stream (NextJS proxy)
    ↓
Your Backend (Streaming)
    ↓
data: token1
data: token2
data: token3
    ↓
ChatKit streams display
```

### Implementation

```typescript
// Backend: FastAPI with Streaming
from fastapi.responses import StreamingResponse

@app.post("/api/chat/stream")
async def chat_stream(message: str):
    async def generate():
        for token in model.generate_stream(message):
            yield f"data: {token}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

// Frontend: NextJS Proxy
export async function POST(req: Request) {
  const { message } = await req.json();

  const response = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/api/chat/stream`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );

  // Forward streaming response
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Frontend: React Component
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/custom/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
  onMessageSent: async ({ message }) => {
    const res = await fetch('/api/custom/stream', {
      method: 'POST',
      body: JSON.stringify({ text: message.text }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const text = decoder.decode(value);
      // Process streaming tokens
      console.log('Token:', text);
    }
  },
});
```

### Advantages
- ✅ Better perceived performance
- ✅ Real-time token feedback
- ✅ Progressive response display
- ✅ Better UX for large responses

### Disadvantages
- ❌ More complex implementation
- ❌ Backend must support streaming
- ❌ Network overhead per token

### Best For
- LLM responses (GPT, LLaMA)
- Large response generation
- Production chat applications

---

## Pattern 3: WebSocket Real-time Communication

### Use Case
Persistent bidirectional connection for real-time chat, streaming, and low-latency interactions.

### Architecture Flow

```
Frontend
    ↓
WebSocket Connection ← → Backend
    ↓                      ↓
Bidirectional            AI Model / Logic
    ↓
Real-time messages
```

### Implementation

```typescript
// Backend: FastAPI WebSocket
from fastapi import WebSocket

@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()

            if data['type'] == 'message':
                response = model.generate(data['text'])

                await websocket.send_json({
                    'type': 'response',
                    'text': response,
                })
    finally:
        await websocket.close()

// Frontend: React WebSocket Hook
const useWebSocketChat = (sessionId: string) => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsRef.current = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/chat/${sessionId}`
    );

    wsRef.current.onopen = () => setConnected(true);
    wsRef.current.onclose = () => setConnected(false);

    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // Handle response
    };

    return () => wsRef.current?.close();
  }, [sessionId]);

  const sendMessage = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'message', text })
      );
    }
  };

  return { connected, sendMessage };
};
```

### Advantages
- ✅ True bidirectional communication
- ✅ Lowest latency
- ✅ Persistent connection
- ✅ Real-time streaming

### Disadvantages
- ❌ Most complex implementation
- ❌ Backend must support WebSocket
- ❌ Connection management required
- ❌ More server resources

### Best For
- Real-time multiplayer chat
- High-frequency updates
- Long-running conversations
- Interactive applications

---

## Pattern 4: Hybrid Backend (OpenAI + Custom Fallback)

### Use Case
Use custom backend primarily, fallback to OpenAI if unavailable for reliability.

### Architecture Flow

```
Frontend
    ↓
Try: Custom Backend
    ↓
Success? → Yes → Use Custom Response
    ↓ No
Try: OpenAI ChatKit
    ↓
Success? → Yes → Use OpenAI Response
    ↓ No
Show Error
```

### Implementation

```typescript
export function HybridChatComponent() {
  const [backendStatus, setBackendStatus] = useState<'custom' | 'openai' | 'error'>(
    'custom'
  );

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // Priority 1: Custom backend
        try {
          const res = await fetch('/api/custom/session', {
            method: 'POST',
            signal: AbortSignal.timeout(3000),
          });

          if (res.ok) {
            setBackendStatus('custom');
            return (await res.json()).client_secret;
          }

          if (res.status === 503 || res.status === 502) {
            throw new Error('Backend unavailable');
          }
        } catch (error) {
          console.warn('Custom backend unavailable:', error);
        }

        // Priority 2: OpenAI fallback
        try {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            signal: AbortSignal.timeout(3000),
          });

          if (res.ok) {
            setBackendStatus('openai');
            return (await res.json()).client_secret;
          }
        } catch (error) {
          console.error('All backends failed:', error);
        }

        setBackendStatus('error');
        throw new Error('No backend available');
      },
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="p-3 bg-gray-100 border-b text-sm">
        Backend: {backendStatus === 'custom' ? '🟢 Custom' : backendStatus === 'openai' ? '🟡 OpenAI' : '🔴 Error'}
      </div>
      <ChatKit control={control} className="flex-1" />
    </div>
  );
}
```

### Advantages
- ✅ High reliability
- ✅ Graceful degradation
- ✅ Cost optimization (use custom first)
- ✅ No single point of failure

### Disadvantages
- ❌ OpenAI costs if used as fallback
- ❌ Inconsistent responses (different models)
- ❌ More complex error handling

### Best For
- Production systems requiring reliability
- Gradual migration from OpenAI
- Cost-sensitive applications

---

## Pattern 5: Multi-Model Custom Backend

### Use Case
Router that selects different backend models based on user choice or request type.

### Architecture Flow

```
Frontend (Model Selection)
    ↓
/api/custom/session?model=gpt2
    ↓
Router Logic
    ↓
Model A Backend / Model B Backend / Model C Backend
    ↓
Response
```

### Implementation

```typescript
const MODELS = {
  'fast': {
    name: 'GPT-2 (Fast)',
    url: 'https://fast-api.example.com',
  },
  'balanced': {
    name: 'GPT-3.5 (Balanced)',
    url: 'https://balanced-api.example.com',
  },
  'quality': {
    name: 'GPT-4 (Quality)',
    url: 'https://quality-api.example.com',
  },
};

// Frontend: Model Selection UI
export function MultiModelChat() {
  const [model, setModel] = useState<keyof typeof MODELS>('balanced');

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/custom/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model }),
        });

        return (await res.json()).client_secret;
      },
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <label>Model:</label>
        <select value={model} onChange={(e) => setModel(e.target.value as any)}>
          {Object.entries(MODELS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
      </div>
      <ChatKit control={control} className="flex-1" />
    </div>
  );
}

// Backend: Router
export async function POST(req: Request) {
  const { model } = await req.json();
  const selectedBackend = MODELS[model] || MODELS['balanced'];

  const response = await fetch(`${selectedBackend.url}/sessions`, {
    method: 'POST',
    body: JSON.stringify({ user_id: user.id }),
  });

  const session = await response.json();
  return Response.json({
    client_secret: session.session_id,
    model: model,
  });
}
```

### Advantages
- ✅ User choice and control
- ✅ Cost optimization (fast default)
- ✅ A/B testing capability
- ✅ Gradual model rollout

### Disadvantages
- ❌ More backend management
- ❌ User confusion with options
- ❌ Inconsistent responses

### Best For
- Research and experimentation
- Cost-sensitive applications
- A/B testing deployments

---

## Pattern 6: Custom Backend with Message Preprocessing

### Use Case
Transform or enrich user messages before sending to backend AI model.

### Architecture Flow

```
User Message
    ↓
Preprocessing (normalize, context, filters)
    ↓
Backend AI Model
    ↓
Postprocessing (format, sanitize)
    ↓
ChatKit Display
```

### Implementation

```typescript
interface Message {
  text: string;
  context?: string;
  userId?: string;
}

const preprocessMessage = (msg: Message): Message => {
  // Normalize
  let processed = msg.text.trim().toLowerCase();

  // Filter (remove sensitive info)
  processed = processed.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

  // Add context
  return {
    text: processed,
    context: msg.context || 'general',
    userId: msg.userId,
  };
};

const postprocessResponse = (text: string): string => {
  // Sanitize HTML
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');
};

// Backend endpoint with preprocessing
export async function POST(req: Request) {
  const { message } = await req.json();

  // Preprocess
  const processed = preprocessMessage({
    text: message,
    userId: user.id,
  });

  // Send to model
  const response = await fetch(
    `${process.env.CUSTOM_BACKEND_URL}/chat`,
    {
      method: 'POST',
      body: JSON.stringify(processed),
    }
  );

  let result = await response.json();

  // Postprocess
  result.text = postprocessResponse(result.text);

  return Response.json(result);
}
```

### Advantages
- ✅ Data privacy (filter sensitive info)
- ✅ Consistent formatting
- ✅ Content safety
- ✅ Context enrichment

### Disadvantages
- ❌ Performance overhead
- ❌ More complex logic
- ❌ Potential data loss

### Best For
- Production applications
- Data privacy requirements
- Content moderation needed

---

## Decision Matrix

| Pattern | Complexity | Performance | Cost | Reliability | Best For |
|---------|-----------|-------------|------|-------------|----------|
| Simple | Low | Poor | Low | Low | Prototypes |
| Streaming | Medium | Good | Low | Medium | Production |
| WebSocket | High | Excellent | Medium | High | Real-time apps |
| Hybrid | Medium | Good | Medium | High | Reliability needed |
| Multi-Model | High | Variable | High | Medium | Experimentation |
| Preprocessing | Medium | Fair | Low | Medium | Data privacy |

