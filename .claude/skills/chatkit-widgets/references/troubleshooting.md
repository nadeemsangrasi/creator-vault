# ChatKit Widgets - Troubleshooting

## Issue 1: Widget Not Rendering

**Error:** Widget appears blank or not visible

**Causes:**
- Missing container height
- Session endpoint failing
- CSS conflicts

**Solution:**

```typescript
// ❌ Wrong - no height
<ChatKit control={control} className="w-full" />

// ✅ Correct - with height
<ChatKit control={control} className="h-96 w-full" />

// Debug
console.log('Container height:', document.querySelector('.chatkit').clientHeight);
```

---

## Issue 2: Theme Not Applying

**Error:** Custom colors not showing, default theme used

**Causes:**
- Theme passed to component instead of hook
- CSS specificity issues

**Solution:**

```typescript
// ❌ Wrong
<ChatKit control={control} theme={{ colorScheme: 'dark' }} />

// ✅ Correct
const { control } = useChatKit({
  api: { getClientSecret: async () => {} },
  theme: { colorScheme: 'dark' },
});

<ChatKit control={control} />
```

---

## Issue 3: Session Endpoint 401

**Error:** "Unauthorized" or "Invalid client_secret"

**Causes:**
- User not authenticated
- Wrong endpoint path
- Endpoint not returning client_secret

**Solution:**

```typescript
// Check endpoint response
const debugSession = async () => {
  const res = await fetch('/api/chatkit/session', { method: 'POST' });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Has client_secret:', !!data.client_secret);
};

// Fix endpoint
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await openai.chatkit.sessions.create({ user_id: user.id });

  // Ensure correct response format
  return Response.json({
    client_secret: session.client_secret,  // Must have this
  });
}
```

---

## Issue 4: Header Not Showing

**Error:** Header title and actions missing

**Causes:**
- header.enabled not set to true
- Icons not recognized

**Solution:**

```typescript
// Make sure header is enabled
header: {
  enabled: true,  // ✅ Important
  title: {
    enabled: true,
    text: 'My Chat',
  },
  leftAction: {
    icon: 'menu',
    onClick: () => {},
  },
}
```

---

## Issue 5: Responsive Not Working

**Error:** Widget same size on all devices

**Causes:**
- Missing responsive classes
- Wrong parent container size

**Solution:**

```typescript
// ❌ Wrong - fixed size
className="h-96 w-80"

// ✅ Correct - responsive
className="h-full w-full md:h-96 md:w-80"

// Ensure parent has size
<div className="w-full h-screen">
  <ChatKit control={control} className="h-full w-full" />
</div>
```

---

## Issue 6: Tools Not Working

**Error:** Tool buttons not clickable, nothing happens

**Causes:**
- Tool click handler missing
- Tool ID mismatch

**Solution:**

```typescript
const { control, sendUserMessage } = useChatKit({
  api: { getClientSecret: async () => {} },
  composer: {
    tools: [
      { id: 'attach', label: 'Attach', icon: 'paperclip' },
    ],
  },
});

// Add handler if needed
// OR let ChatKit handle default tool behavior
```

---

## Issue 7: CORS Errors

**Error:** "Access to XMLHttpRequest blocked by CORS policy"

**Causes:**
- Session endpoint not returning CORS headers
- Wrong origin

**Solution:**

```typescript
// Backend: Add CORS headers
export async function POST(req: Request) {
  // ... session creation ...

  return new Response(JSON.stringify({ client_secret }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.FRONTEND_URL,
    },
  });
}
```

---

## Issue 8: Scroll Not Working

**Error:** Message history doesn't scroll, stuck at bottom

**Causes:**
- Container overflow not set
- Parent height issues

**Solution:**

```typescript
// Ensure container allows scrolling
<div className="flex flex-col h-screen overflow-hidden">
  <ChatKit control={control} className="flex-1 overflow-y-auto" />
</div>
```

---

## Debug Checklist

```typescript
// 1. Check session creation
async function debugSession() {
  const res = await fetch('/api/chatkit/session', { method: 'POST' });
  console.log('Session status:', res.status);
  const data = await res.json();
  console.log('Session data:', data);
  console.log('Valid client_secret:', !!data.client_secret);
}

// 2. Check container
function debugContainer() {
  const container = document.querySelector('.chatkit-container');
  console.log('Container:', container);
  console.log('Height:', container?.clientHeight);
  console.log('Width:', container?.clientWidth);
}

// 3. Check theme
function debugTheme() {
  const messages = document.querySelectorAll('.chatkit-message');
  const styles = window.getComputedStyle(messages[0]);
  console.log('Background:', styles.backgroundColor);
  console.log('Color:', styles.color);
}

// 4. Check errors
window.addEventListener('error', (e) => {
  if (e.message.includes('chatkit')) {
    console.error('ChatKit error:', e);
  }
});
```

