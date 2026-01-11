# ChatKit Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Invalid client_secret" Error

**Error Message:**
```
Error: Invalid client_secret provided
```

**Causes:**
- Session endpoint returning wrong format
- Client secret is null or undefined
- Session expired
- Wrong endpoint URL

**Solution:**

```typescript
// Debug the session endpoint response
const debugSessionEndpoint = async () => {
  const res = await fetch('/api/chatkit/session', { method: 'POST' });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
  console.log('Has client_secret:', !!data.client_secret);
  console.log('client_secret value:', data.client_secret?.substring(0, 20) + '...');
};

await debugSessionEndpoint();

// Ensure correct format in backend
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const session = await openai.chatkit.sessions.create({ user_id: user.id });

    // Verify client_secret exists
    if (!session.client_secret) {
      throw new Error('No client_secret in session response');
    }

    return Response.json({
      client_secret: session.client_secret,
      expires_at: session.expires_at,
    });
  } catch (error) {
    console.error('Session creation failed:', error);
    return Response.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    );
  }
}
```

---

### Issue 2: "Cannot read property 'control' of undefined"

**Error Message:**
```
TypeError: Cannot read property 'control' of undefined
```

**Causes:**
- `useChatKit` hook called outside of React component
- Hook called conditionally
- Missing `getClientSecret` method

**Solution:**

```typescript
// ❌ Wrong - calling hook conditionally
function BadComponent({ showChat }) {
  if (showChat) {
    const { control } = useChatKit({ /* ... */ });
  }
  return null;
}

// ✅ Correct - unconditional hook call
function GoodComponent({ showChat }) {
  const { control } = useChatKit({ /* ... */ });
  return showChat ? <ChatKit control={control} /> : null;
}

// ✅ Correct - with required getClientSecret
const { control } = useChatKit({
  api: {
    getClientSecret: async () => {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      if (!res.ok) throw new Error('Session failed');
      return (await res.json()).client_secret;
    },
  },
});
```

---

### Issue 3: "Failed to fetch" or CORS Errors

**Error Message:**
```
Access to XMLHttpRequest has been blocked by CORS policy
Failed to fetch from /api/chatkit/session
```

**Causes:**
- CORS headers not configured
- Wrong API URL
- Credentials not sent with request
- Backend not returning CORS headers

**Solution:**

```typescript
// Frontend: Ensure credentials are sent
const { control } = useChatKit({
  api: {
    getClientSecret: async () => {
      const res = await fetch('/api/chatkit/session', {
        method: 'POST',
        credentials: 'include', // Send cookies
        headers: { 'Content-Type': 'application/json' },
      });
      return (await res.json()).client_secret;
    },
  },
});

// Backend: Configure CORS
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type'],
}));

// Or with Next.js
export async function POST(req: Request) {
  const origin = req.headers.get('origin');

  if (!process.env.ALLOWED_ORIGINS?.includes(origin)) {
    return Response.json({ error: 'CORS not allowed' }, { status: 403 });
  }

  const user = await getSessionUser(req);
  // ... continue with session creation

  return new Response(JSON.stringify({ client_secret }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
```

---

### Issue 4: Session Expires Immediately

**Error Message:**
```
Session expired
AuthenticationError: Session no longer valid
```

**Causes:**
- Session TTL too short
- Not implementing token refresh
- Stale token passed to refresh endpoint
- Clock skew between client and server

**Solution:**

```typescript
// Implement proper token refresh
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      // If we have an existing token, try to refresh it
      if (existing) {
        try {
          const res = await fetch('/api/chatkit/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: existing }),
          });

          if (res.ok) {
            const { client_secret } = await res.json();
            console.log('Token refreshed successfully');
            return client_secret;
          }
        } catch (error) {
          console.warn('Token refresh failed, creating new session:', error);
        }
      }

      // Create new session if refresh fails
      const res = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Session creation failed');
      return (await res.json()).client_secret;
    },
  },
  onError: ({ error }) => {
    if (error.code === 'UNAUTHORIZED' || error.code === 'SESSION_EXPIRED') {
      // Trigger re-authentication
      window.location.href = '/login';
    }
  },
});

// Backend: Implement refresh endpoint
export async function POST(req: Request) {
  const { token } = await req.json();
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Validate old token before refreshing
    const isValid = await validateToken(token);
    if (!isValid) {
      return Response.json(
        { error: 'Token invalid or expired' },
        { status: 401 }
      );
    }

    // Create new session
    const session = await openai.chatkit.sessions.create({
      user_id: user.id,
    });

    return Response.json({
      client_secret: session.client_secret,
      expires_at: session.expires_at,
    });
  } catch (error) {
    console.error('Refresh failed:', error);
    return Response.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
```

---

### Issue 5: Messages Not Displaying

**Error Message:**
```
No visible messages
ChatKit appears empty
```

**Causes:**
- ChatKit component not mounted
- Styling is hiding messages
- JavaScript error preventing rendering
- Container has no height

**Solution:**

```typescript
// Ensure proper container height
<div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
  <ChatKit control={control} className="flex-1" />
</div>

// Or with Tailwind
<ChatKit control={control} className="h-screen w-full" />

// Check for CSS that might hide content
.chatkit-message-list {
  display: flex;        // ✅ Should display messages
  overflow-y: auto;     // ✅ Allow scrolling
  flex-direction: column;
}

/* ❌ This would hide messages */
.chatkit-message {
  display: none;    // WRONG!
  visibility: hidden;  // WRONG!
  opacity: 0;  // WRONG!
}

// In browser console, verify:
console.log(document.querySelector('.chatkit-message-list'));
console.log(document.querySelectorAll('.chatkit-message'));
```

---

### Issue 6: Theme Not Applying

**Error Message:**
```
Theme colors not showing
Styles not applied to ChatKit
```

**Causes:**
- Theme passed to ChatKit component instead of useChatKit
- CSS specificity conflicts
- Theme configuration is invalid
- CSS-in-JS conflicts

**Solution:**

```typescript
// ❌ Wrong - theme on component
<ChatKit control={control} theme={{ colorScheme: 'dark' }} />

// ✅ Correct - theme on hook
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  theme: {
    colorScheme: 'dark',
    color: { accent: { primary: '#3b82f6' } },
  },
});

// ✅ Then render component
<ChatKit control={control} />

// Debug theme application
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  theme: {
    colorScheme: 'dark',
    color: { accent: { primary: '#ff0000' } },  // Use obvious color
  },
});

// Check computed styles in browser
const message = document.querySelector('.chatkit-message');
const styles = window.getComputedStyle(message);
console.log('Background:', styles.backgroundColor);
console.log('Color:', styles.color);
```

---

### Issue 7: High Latency or Slow Responses

**Error Message:**
```
Messages take long to send
Chat feels sluggish
Session creation is slow
```

**Causes:**
- Slow network connection
- Unoptimized backend query
- Rate limiting
- Database connection issues
- Large attachments

**Solution:**

```typescript
// Monitor latency
const startTime = performance.now();

const { control, sendUserMessage } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      const duration = performance.now() - startTime;
      console.log('Session creation latency:', duration, 'ms');
      return (await res.json()).client_secret;
    },
  },
  onMessageSent: ({ message }) => {
    console.log('Message send latency:', Date.now() - message.timestamp, 'ms');
  },
});

// Backend optimization
export async function POST(req: Request) {
  const startTime = performance.now();
  const user = await getSessionUser(req);

  if (!user) {
    console.log('Auth check:', performance.now() - startTime, 'ms');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await openai.chatkit.sessions.create({ user_id: user.id });
  console.log('Total session time:', performance.now() - startTime, 'ms');

  return Response.json({ client_secret: session.client_secret });
}

// Use caching for frequently created sessions
const sessionCache = new Map();

async function getOrCreateSession(userId: string) {
  const cacheKey = `session:${userId}`;

  if (sessionCache.has(cacheKey)) {
    const { session, expires } = sessionCache.get(cacheKey);
    if (Date.now() < expires) {
      return session;
    }
  }

  const session = await openai.chatkit.sessions.create({ user_id: userId });
  const expires = Date.now() + 3600000; // 1 hour

  sessionCache.set(cacheKey, { session, expires });
  return session;
}
```

---

### Issue 8: Authentication Not Working

**Error Message:**
```
401 Unauthorized
User not authenticated
```

**Causes:**
- Session cookie not sent
- User not logged in
- Session expired
- Wrong authentication header

**Solution:**

```typescript
// Ensure authentication middleware
app.use(authenticateUser);

async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// In session endpoint
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create session for authenticated user
  const session = await openai.chatkit.sessions.create({ user_id: user.id });
  return Response.json({ client_secret: session.client_secret });
}

// Frontend: Handle 401 responses
const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });

      if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Not authenticated');
      }

      return (await res.json()).client_secret;
    },
  },
});
```

---

### Issue 9: Memory Leaks or Performance Degradation

**Error Message:**
```
Memory usage increasing over time
Chrome DevTools shows detached DOM nodes
Performance getting worse
```

**Causes:**
- Event listeners not cleaned up
- Refs not properly released
- Message history growing unbounded
- Memory leaks in callbacks

**Solution:**

```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener('resize', handleResize);

  // ✅ Cleanup listener
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Limit message history
const [messages, setMessages] = useState([]);

const addMessage = (message) => {
  setMessages((prev) => {
    // Keep only last 1000 messages
    const updated = [...prev, message];
    if (updated.length > 1000) {
      return updated.slice(-1000);
    }
    return updated;
  });
};

// Use useCallback to prevent unnecessary re-renders
const handleToolClick = useCallback(async (toolId) => {
  // Tool logic
}, []);

// Clean up on unmount
useEffect(() => {
  return () => {
    // Clear cached data
    sessionStorage.clear();
  };
}, []);
```

---

### Issue 10: File Upload Fails

**Error Message:**
```
Upload failed
File not attached
500 Internal Server Error
```

**Causes:**
- File too large
- Wrong file type
- No multipart form data
- Backend not handling uploads

**Solution:**

```typescript
// Validate file before upload
const validateFile = (file: File) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'application/json'];

  if (file.size > MAX_SIZE) {
    throw new Error(`File too large (max ${MAX_SIZE / 1024 / 1024}MB)`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed (${file.type})`);
  }
};

// Upload with proper form data
const uploadFile = async (file: File) => {
  try {
    validateFile(file);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    return await res.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Backend handling
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate on backend
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: 'File too large' },
        { status: 413 }
      );
    }

    // Process file
    const buffer = await file.arrayBuffer();
    const filename = `${Date.now()}-${file.name}`;

    // Save to storage
    await storage.save(filename, buffer);

    return Response.json({
      fileId: filename,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

---

## Getting Help

### Check These First

1. **Browser Console**: Look for JavaScript errors
2. **Network Tab**: Check API request/response status
3. **React DevTools**: Verify component props and state
4. **OpenAI Status**: Check https://status.openai.com

### Debug Checklist

```typescript
// Add comprehensive logging
const debug = {
  logSessionCreation: true,
  logMessageSend: true,
  logErrors: true,
};

const { control } = useChatKit({
  api: {
    async getClientSecret() {
      if (debug.logSessionCreation) {
        console.log('[DEBUG] Creating session...');
        console.log('[DEBUG] API URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('[DEBUG] User:', await getCurrentUser());
      }

      const res = await fetch('/api/chatkit/session', { method: 'POST' });

      if (debug.logSessionCreation) {
        console.log('[DEBUG] Response status:', res.status);
        const data = await res.json();
        console.log('[DEBUG] Response has client_secret:', !!data.client_secret);
      }

      return data.client_secret;
    },
  },
  onError: ({ error }) => {
    if (debug.logErrors) {
      console.error('[ERROR]', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
    }
  },
});
```

