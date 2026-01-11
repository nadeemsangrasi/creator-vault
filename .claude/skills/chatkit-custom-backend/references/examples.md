# ChatKit Custom Backend Examples

## Example 1: Simple Custom Backend Integration

Basic setup routing ChatKit to a custom Python/FastAPI backend.

### Backend (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid

app = FastAPI()

class SessionRequest(BaseModel):
    user_id: str

class SessionResponse(BaseModel):
    session_id: str
    expires_at: str

@app.post("/api/sessions")
async def create_session(req: SessionRequest):
    session_id = str(uuid.uuid4())
    return SessionResponse(
        session_id=session_id,
        expires_at="2024-12-31T23:59:59Z"
    )

class MessageRequest(BaseModel):
    message: str
    session_id: str

class MessageResponse(BaseModel):
    response: str

@app.post("/api/chat")
async def chat(req: MessageRequest):
    # Call your model
    response = await call_model(req.message)
    return MessageResponse(response=response)
```

### Frontend (React)

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function SimpleCustomBackendChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        // Call NextJS API which proxies to your backend
        const res = await fetch('/api/custom/session', { method: 'POST' });
        if (!res.ok) throw new Error('Session failed');
        return (await res.json()).client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

### NextJS Proxy (/api/custom/session)

```typescript
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.CUSTOM_BACKEND_URL}/api/sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
        },
        body: JSON.stringify({ user_id: user.id }),
      }
    );

    if (!response.ok) throw new Error('Backend error');

    const session = await response.json();

    return Response.json({
      client_secret: session.session_id,
      expires_at: session.expires_at,
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

---

## Example 2: Streaming Custom Backend with SSE

Backend sends streaming responses using Server-Sent Events.

### Backend (FastAPI with Streaming)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def generate_response(prompt: str):
    """Stream response token by token"""
    for token in model.generate_stream(prompt):
        yield f"data: {token}\n\n"
        await asyncio.sleep(0.01)

@app.post("/api/chat/stream")
async def chat_stream(req: MessageRequest):
    return StreamingResponse(
        generate_response(req.message),
        media_type="text/event-stream"
    )
```

### Frontend with Streaming

```typescript
export function StreamingCustomBackendChat() {
  const [streamingText, setStreamingText] = useState('');

  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/custom/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    onMessageSent: async ({ message }) => {
      // Handle streaming response
      try {
        setStreamingText('');

        const response = await fetch('/api/custom/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message.text }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const token = line.slice(6);
              setStreamingText((prev) => prev + token);
            }
          }
        }
      } catch (error) {
        console.error('Streaming failed:', error);
      }
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-4 bg-gray-100">
        {streamingText && <div className="text-gray-800">{streamingText}</div>}
      </div>
      <ChatKit control={control} className="h-1/3" />
    </div>
  );
}
```

### NextJS Streaming Endpoint (/api/custom/stream)

```typescript
export async function POST(req: Request) {
  const { text } = await req.json();
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.CUSTOM_BACKEND_URL}/api/chat/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
        },
        body: JSON.stringify({ message: text }),
      }
    );

    if (!response.ok) throw new Error('Streaming failed');

    // Forward the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return Response.json({ error: 'Streaming failed' }, { status: 500 });
  }
}
```

---

## Example 3: Multi-Model Custom Backend

User selects model, routed to different backend implementations.

### Model Configuration

```typescript
const MODELS = {
  'gpt2': {
    url: 'https://api.example.com/gpt2',
    label: 'GPT-2 (Fast)',
    description: 'Fast, lightweight responses',
  },
  'llama': {
    url: 'https://llama.example.com/api',
    label: 'LLaMA (Quality)',
    description: 'Higher quality, slower',
  },
  'custom': {
    url: 'https://custom.example.com',
    label: 'Custom Model (Experimental)',
    description: 'Your custom fine-tuned model',
  },
};
```

### Frontend with Model Selection

```typescript
export function MultiModelChat() {
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODELS>(
    'gpt2'
  );

  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/custom/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: selectedModel }),
        });

        if (!res.ok) throw new Error('Session failed');
        return (await res.json()).client_secret;
      },
    },
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Model Selection */}
      <div className="p-4 bg-gray-50 border-b">
        <label className="block text-sm font-medium mb-2">Select Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as any)}
          className="w-full px-3 py-2 border rounded"
        >
          {Object.entries(MODELS).map(([key, model]) => (
            <option key={key} value={key}>
              {model.label} - {model.description}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Interface */}
      <ChatKit control={control} className="flex-1" />
    </div>
  );
}
```

### Backend Router (/api/custom/session with model routing)

```typescript
export async function POST(req: Request) {
  const { model } = await req.json();
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backendUrl = MODELS[model || 'gpt2']?.url;

  if (!backendUrl) {
    return Response.json({ error: 'Invalid model' }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOM_BACKEND_KEY}`,
      },
      body: JSON.stringify({ user_id: user.id, model }),
    });

    if (!response.ok) throw new Error('Backend error');

    const session = await response.json();

    return Response.json({
      client_secret: session.session_id,
      model: model,
      expires_at: session.expires_at,
    });
  } catch (error) {
    console.error('Session creation failed:', error);
    return Response.json({ error: 'Session failed' }, { status: 500 });
  }
}
```

---

## Example 4: WebSocket Real-time Custom Backend

Persistent connection for real-time bidirectional communication.

### Backend (FastAPI with WebSocket)

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()

            if data['type'] == 'message':
                # Call model
                response = await model.generate(data['text'])

                await websocket.send_json({
                    'type': 'response',
                    'text': response,
                })
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()
```

### Frontend with WebSocket

```typescript
const useWebSocketChat = (sessionId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsRef.current = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/chat/${sessionId}`
    );

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'response') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.text },
        ]);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => wsRef.current?.close();
  }, [sessionId]);

  const sendMessage = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'message', text })
      );

      setMessages((prev) => [
        ...prev,
        { role: 'user', text },
      ]);
    }
  };

  return { messages, sendMessage };
};

export function WebSocketChat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { messages, sendMessage } = useWebSocketChat(sessionId || '');

  useEffect(() => {
    fetch('/api/custom/session', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setSessionId(data.client_secret));
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type message..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        className="p-4 border-t"
      />
    </div>
  );
}
```

---

## Example 5: Hybrid OpenAI + Custom Backend

Falls back to OpenAI if custom backend unavailable.

```typescript
export function HybridChat() {
  const [backendStatus, setBackendStatus] = useState<'custom' | 'openai'>(
    'custom'
  );

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // Try custom backend first
        try {
          const res = await fetch('/api/custom/session', { method: 'POST' });

          if (res.ok) {
            console.log('Using custom backend');
            setBackendStatus('custom');
            return (await res.json()).client_secret;
          }

          if (res.status === 503) {
            console.warn('Custom backend unavailable, trying OpenAI');
          } else {
            throw new Error(`Session failed: ${res.status}`);
          }
        } catch (error) {
          console.warn('Custom backend error:', error);
        }

        // Fallback to OpenAI
        try {
          const res = await fetch('/api/chatkit/session', { method: 'POST' });

          if (res.ok) {
            console.log('Using OpenAI backend');
            setBackendStatus('openai');
            return (await res.json()).client_secret;
          }
        } catch (error) {
          console.error('Both backends failed:', error);
        }

        throw new Error('No backend available');
      },
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-blue-50 border-b">
        <span className="text-sm">
          Backend: <strong>{backendStatus === 'custom' ? '🟢 Custom' : '🟡 OpenAI'}</strong>
        </span>
      </div>
      <ChatKit control={control} className="flex-1" />
    </div>
  );
}
```

---

## Example 6: Custom Authentication with JWT

```typescript
interface User {
  id: string;
  email: string;
}

const getAuthToken = async (): Promise<string> => {
  // Get JWT from your backend
  const res = await fetch('/api/auth/token', {
    method: 'POST',
    credentials: 'include',
  });

  const { token } = await res.json();
  return token;
};

export function CustomAuthChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const authToken = await getAuthToken();

        const res = await fetch('/api/custom/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken,
          },
        });

        return (await res.json()).client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

---

## Example 7: Backend Session Endpoint Implementation

Complete backend implementation for custom session endpoint.

```python
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredential
from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
import uuid
import os

app = FastAPI()
Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    model = Column(String, default="default")

def verify_auth(credentials: HTTPAuthCredential = Depends(HTTPBearer())):
    if credentials.credentials != os.environ.get('BACKEND_KEY'):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return credentials.credentials

@app.post("/api/sessions")
async def create_session(
    user_id: str,
    model: str = "default",
    auth = Depends(verify_auth)
):
    session_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=1)

    session = ChatSession(
        id=session_id,
        user_id=user_id,
        expires_at=expires_at,
        model=model
    )

    # Save to database
    db.add(session)
    db.commit()

    return {
        "session_id": session_id,
        "expires_at": expires_at.isoformat(),
        "model": model
    }

@app.post("/api/chat")
async def chat(session_id: str, message: str):
    # Validate session
    session = db.query(ChatSession).filter_by(id=session_id).first()

    if not session or session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session invalid")

    # Call model
    response = await call_model(message, model=session.model)

    return {"response": response}
```

---

## Example 8: Error Handling with Retry

```typescript
const createSessionWithRetry = async (
  maxRetries = 3,
  backoffMultiplier = 2
): Promise<string> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch('/api/custom/session', {
        method: 'POST',
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (res.status === 401) {
        throw new Error('Authentication failed');
      }

      if (res.status === 503) {
        throw new Error('Backend temporarily unavailable');
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const { client_secret } = await res.json();
      return client_secret;
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `Attempt ${attempt + 1} failed: ${lastError.message}`
      );

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(backoffMultiplier, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message}`
  );
};

export function ResilientChat() {
  const { control } = useChatKit({
    api: {
      getClientSecret: () => createSessionWithRetry(),
    },
    onError: ({ error }) => {
      console.error('Chat error:', error);
      showNotification('Unable to connect to chat service', 'error');
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

