---
name: chatkit-ui
description: Build high-quality AI-powered chat interfaces with OpenAI ChatKit. Use when creating chat applications, customizing chat UI, managing sessions, integrating tools, or setting up authentication. Covers React components, theming, multi-thread chat, and production deployment.
version: 1.0.0
allowed-tools: Read, Write, Edit, mcp__context7__query-docs
author: Claude Code
tags: [chatkit, openai, chat-ui, react, authentication, streaming]
---

# ChatKit UI for Building Chat Interfaces

## Overview

Build production-ready AI-powered chat interfaces with OpenAI ChatKit. ChatKit is a batteries-included framework with deep UI customization, response streaming, tool integration, and session management.

**Key features:** React components, theming, multi-thread chat, authentication, customizable prompts, tool integration, file attachments, and more.

**See:** `references/official-docs/` for complete ChatKit documentation

## When to Use

**Activate when:**
- "Build chat interface with ChatKit"
- "Create AI chat application"
- "Customize ChatKit UI"
- "Manage chat sessions"
- "Add tools to ChatKit"
- "Style chat interface"
- "Set up ChatKit authentication"
- "Handle multiple chat threads"

**NOT for:** General chat design (use design skills); building LLM models (use LLM skills)

## Prerequisites

**Required:**
- Node.js 18+ with npm
- React 18+ (for React integration)
- Familiarity with TypeScript/JavaScript
- OpenAI ChatKit library access

**Optional:**
- Backend API for session management
- File upload infrastructure
- Streaming knowledge

**See:** `references/setup.md` for detailed setup

## Instructions

### Phase 1: Install and Setup

**Install ChatKit:**
```bash
npm install @openai/chatkit-react
# or
npm install @openai/chatkit  # for web components
```

**Create basic React component:**
```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MyChat() {
  const { control } = useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

**Validation:**
- Package installed without errors
- Component renders without crashes
- Can fetch client secret from API

**See:** `references/examples.md#basic-setup`

### Phase 2: Configure Authentication

**Backend session endpoint:**
```typescript
// /api/chatkit/session
export async function POST(req: Request) {
  const secret = await createChatKitSession(req);
  return Response.json({ client_secret: secret });
}
```

**Token refresh endpoint:**
```typescript
// /api/chatkit/refresh
export async function POST(req: Request) {
  const { currentClientSecret } = await req.json();
  const newSecret = await refreshChatKitSession(currentClientSecret);
  return Response.json({ client_secret: newSecret });
}
```

**Validation:**
- Sessions created successfully
- Token refresh works
- Sessions persist across requests

**See:** `references/authentication.md`

### Phase 3: Customize Appearance

**Set theme and colors:**
```tsx
const { control } = useChatKit({
  theme: {
    colorScheme: 'dark',
    color: { accent: { primary: '#3b82f6' } },
    radius: 'round',
    typography: { fontFamily: 'Inter, sans-serif' },
  },
  composer: {
    placeholder: 'Ask anything...',
  },
  startScreen: {
    greeting: 'Welcome to ChatBot!',
  },
});
```

**Validation:**
- Theme applies correctly
- Colors render as specified
- Font loads properly

**See:** `references/theming.md`

### Phase 4: Add Start Screen Prompts

**Configure initial prompts:**
```tsx
startScreen: {
  greeting: 'How can I help?',
  prompts: [
    { label: 'Explain', prompt: 'Explain quantum computing', icon: 'lightbulb' },
    { label: 'Code', prompt: 'Write a React component', icon: 'square-code' },
    { label: 'Analyze', prompt: 'Analyze this data', icon: 'chart' },
  ],
}
```

**Validation:**
- Prompts appear on start screen
- Clicking prompt sends message
- Icons display correctly

**See:** `references/prompts.md`

### Phase 5: Implement Multi-Thread Chat

**Switch between conversations:**
```tsx
const { control, setThreadId, focusComposer } = useChatKit({
  initialThread: localStorage.getItem('lastThreadId') || null,
  onThreadChange: ({ threadId }) => {
    localStorage.setItem('lastThreadId', threadId || '');
  },
});

const switchThread = async (threadId: string | null) => {
  await setThreadId(threadId);
  await focusComposer();
};
```

**Validation:**
- Thread switching works smoothly
- History persists between threads
- Last thread restored on reload

**See:** `references/multi-thread.md`

### Phase 6: Add Tools and Custom Actions

**Configure tools in composer:**
```tsx
composer: {
  tools: [
    { id: 'rate', label: 'Rate', icon: 'star', pinned: true },
    { id: 'help', label: 'Help', icon: 'help-circle' },
  ],
}
```

**Send programmatic messages:**
```tsx
const { sendUserMessage } = useChatKit({...});

await sendUserMessage({
  text: 'Analyze this report',
  attachments: [/* file data */],
});
```

**Validation:**
- Tools appear in composer
- Custom actions trigger correctly
- Attachments upload properly

**See:** `references/tools.md`

### Phase 7: Style and Responsive Design

**Make responsive:**
```tsx
<ChatKit
  control={control}
  className="h-screen w-full md:h-[600px] md:w-[400px]"
/>
```

**Override styling:**
```css
.chatkit-message {
  background: var(--surface-bg);
  color: var(--text-primary);
}

.chatkit-composer {
  border: 1px solid var(--border-color);
}
```

**Validation:**
- Responsive at all breakpoints
- CSS overrides apply
- No layout shifts

**See:** `references/styling.md`

### Phase 8: Deploy and Monitor

**Production checklist:**
- Validate session management
- Monitor API performance
- Set up error handling
- Configure logging
- Plan scaling strategy

**Error boundaries:**
```tsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <ChatKit control={control} />
</ErrorBoundary>
```

**Validation:**
- Deploy without errors
- Monitor logs in production
- Track usage metrics
- Handle failures gracefully

**See:** `references/deployment.md`

## Common Patterns

### Pattern 1: Basic Chat
Minimal setup with default styling:
```tsx
function BasicChat() {
  const { control } = useChatKit({
    api: { getClientSecret: () => fetch('/api/session').then(r => r.json()).then(d => d.secret) }
  });
  return <ChatKit control={control} className="h-screen" />;
}
```

**See:** `references/examples.md#basic-chat`

### Pattern 2: Themed Chat
Custom colors and typography:
```tsx
{ theme: { colorScheme: 'dark', color: { accent: { primary: '#ff5733' } } } }
```

**See:** `references/examples.md#themed-chat`

### Pattern 3: Multi-Thread Sidebar
Conversation history with thread switching:
```tsx
<div className="flex">
  <Sidebar threads={threads} onSwitch={switchThread} />
  <ChatKit control={control} className="flex-1" />
</div>
```

**See:** `references/examples.md#multi-thread`

### Pattern 4: Custom Tools
Domain-specific actions:
```tsx
composer: { tools: [{ id: 'search-docs', label: 'Search Docs' }] }
```

**See:** `references/examples.md#tools`

### Pattern 5: Prompt Engineering
Guided conversation starters:
```tsx
startScreen: { prompts: [{ label: 'Explain', prompt: 'Explain X', icon: 'lightbulb' }] }
```

**See:** `references/examples.md#prompts`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "client_secret undefined" | getClientSecret returned undefined | Check backend endpoint, verify response format |
| "ChatKit component not found" | Import missing or wrong name | Verify import: `import { ChatKit } from '@openai/chatkit-react'` |
| "Theme not applying" | CSS specificity issue | Check Tailwind config or CSS order |
| "Thread switch failed" | Invalid thread ID | Verify thread ID format and validity |
| "Attachments not uploading" | Upload strategy misconfigured | Check upload configuration and permissions |
| "Messages not streaming" | Streaming disabled | Enable streaming in ChatKit config |

**See:** `references/troubleshooting.md`

## Decision Trees

### React vs Web Component?
```
Using React? → Use @openai/chatkit-react (recommended for React apps)
             → Use ChatKit hook for full control

Not using React? → Use @openai/chatkit web component
                 → Use vanilla JS API
```

### Light or Dark Theme?
```
Brand uses light theme? → Set colorScheme: 'light'
                        → Set appropriate colors

Brand uses dark theme? → Set colorScheme: 'dark'
                       → Ensure contrast is sufficient
```

## Anti-Patterns to Avoid

```
❌ Fetching client_secret synchronously
✅ Use async/await with proper error handling

❌ Storing sensitive tokens in localStorage
✅ Use httpOnly cookies for tokens

❌ Not handling thread switching properly
✅ Save state to localStorage or session storage

❌ Over-customizing theme
✅ Keep customization focused and consistent

❌ Ignoring mobile responsiveness
✅ Test on mobile devices early
```

## References

**Local Documentation:**
- Setup guide: `references/setup.md`
- Authentication: `references/authentication.md`
- Theming: `references/theming.md`
- Multi-thread: `references/multi-thread.md`
- Tools and actions: `references/tools.md`
- Styling: `references/styling.md`
- Deployment: `references/deployment.md`
- Examples: `references/examples.md`
- Troubleshooting: `references/troubleshooting.md`

**Official Documentation:**
- ChatKit GitHub: https://github.com/openai/chatkit-js
- ChatKit Docs: https://chatkit.dev
- OpenAI API: https://openai.com/api

**Use Context7 MCP:** `/fetching-library-docs openai/chatkit-js` for latest docs

## Tips for Success

1. **Start simple** - Get basic chat working before customizing
2. **Test authentication early** - Session management is critical
3. **Mock API responses** - Simplifies development
4. **Use TypeScript** - Catch errors early with types
5. **Test on mobile** - Chat apps are often mobile-first
6. **Monitor performance** - Track API response times
7. **Plan scaling** - Consider concurrent users
8. **Customize incrementally** - Add features one at a time
9. **Handle errors gracefully** - Users should know what failed
10. **Document configuration** - Team members will need to maintain it

**See:** `references/best_practices.md`
