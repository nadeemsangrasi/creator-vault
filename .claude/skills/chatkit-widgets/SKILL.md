---
name: chatkit-widgets
description: Build embeddable ChatKit chat widgets with customizable themes, headers, composers, and tools. Configure session management, streaming, and responsive layouts for production chat applications.
version: 1.0.0
allowed-tools: Read, Write, Edit, Bash
author: Claude Code
tags: [chatkit, widgets, chat-ui, customization, embedding]
---

# ChatKit Widget Builder

Build production-ready embeddable chat widgets using OpenAI ChatKit. Configure themes, headers, composers, start screens, and responsive layouts for seamless chat experiences.

## When to Use This Skill

**Activate when:**
- Building embeddable chat widgets for websites/apps
- Customizing ChatKit UI components and appearance
- Configuring header actions, composer tools, start screens
- Creating responsive chat layouts
- Styling chat widgets with custom themes
- Integrating ChatKit into existing applications
- Building widget documentation

**Trigger keywords:** "build ChatKit widget", "create chat widget", "customize ChatKit UI", "embed chat widget", "configure chat interface"

## Prerequisites

**Required:**
- React or Vanilla JavaScript project
- OpenAI ChatKit library (`@openai/chatkit-react` or `openai-chatkit`)
- Session endpoint returning `client_secret`
- Understanding of ChatKit concepts

**Optional:**
- Tailwind CSS for styling
- TypeScript for type safety
- Framer Motion for animations

## Instructions

### Phase 1: Understand ChatKit Widgets

**Key Concept:**
ChatKit widgets are embeddable chat UI components. They can be:
- **React Component** - `<ChatKit control={control} />`
- **Web Component** - `<openai-chatkit></openai-chatkit>`
- **Custom Elements** - Render anywhere in your app

**Widget consists of:**
- Chat message display area
- Composer (message input)
- Header with title and actions
- Start screen with greeting and prompts
- Tool buttons and integrations

**See:** `references/widget-architecture.md#overview`

### Phase 2: Setup Basic Widget

**Step 1: Install ChatKit**

```bash
npm install @openai/chatkit-react
```

**Step 2: Create Session Endpoint**

```typescript
// /api/chatkit/session
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await openai.chatkit.sessions.create({
    user_id: user.id,
  });

  return Response.json({ client_secret: session.client_secret });
}
```

**Step 3: Create Widget Component**

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function ChatWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-96 w-full rounded-lg" />;
}
```

**See:** `references/examples.md#basic-widget`

### Phase 3: Customize Widget Theme

**Step 1: Define Theme**

```typescript
const theme = {
  colorScheme: 'light',
  color: {
    accent: { primary: '#3b82f6' },
    surface: { background: '#ffffff', foreground: '#1f2937' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    baseSize: 16,
  },
  radius: 'round',
  density: 'normal',
};
```

**Step 2: Apply Theme to Widget**

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  theme: theme,
});
```

**See:** `references/examples.md#themed-widget`

### Phase 4: Configure Header and Actions

**Step 1: Add Header with Title**

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  header: {
    enabled: true,
    title: {
      enabled: true,
      text: 'AI Chat Assistant',
    },
    leftAction: {
      icon: 'menu',
      onClick: () => console.log('Menu clicked'),
    },
    rightAction: {
      icon: 'settings-cog',
      onClick: () => console.log('Settings clicked'),
    },
  },
});
```

**Step 2: Add Custom Actions**

```typescript
header: {
  leftAction: {
    icon: 'menu',
    onClick: () => openSidebar(),
  },
  rightAction: {
    icon: 'help-circle',
    onClick: () => showHelp(),
  },
}
```

**See:** `references/examples.md#header-actions`

### Phase 5: Configure Composer and Tools

**Step 1: Customize Composer**

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  composer: {
    placeholder: 'Type your message...',
    tools: [
      { id: 'attach', label: 'Attach', icon: 'paperclip', pinned: true },
      { id: 'code', label: 'Code', icon: 'code' },
      { id: 'search', label: 'Search', icon: 'search' },
    ],
  },
});
```

**Step 2: Handle Tool Actions**

```typescript
onToolClick: ({ toolId }) => {
  switch (toolId) {
    case 'attach':
      handleFileUpload();
      break;
    case 'code':
      handleCodeBlock();
      break;
  }
}
```

**See:** `references/examples.md#composer-tools`

### Phase 6: Configure Start Screen

**Step 1: Add Greeting and Prompts**

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  startScreen: {
    greeting: 'Welcome to AI Chat!',
    prompts: [
      { label: 'Ask', prompt: 'How can I help?', icon: 'lightbulb' },
      { label: 'Analyze', prompt: 'Analyze this data', icon: 'chart' },
      { label: 'Generate', prompt: 'Generate content', icon: 'sparkle' },
    ],
  },
});
```

**See:** `references/examples.md#start-screen`

### Phase 7: Handle Widget Events and State

**Step 1: Listen to Chat Events**

```typescript
const { control, sendUserMessage } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  onThreadChange: ({ threadId }) => {
    console.log('Thread changed:', threadId);
    localStorage.setItem('lastThread', threadId || '');
  },
  onMessageSent: ({ message }) => {
    console.log('Message sent:', message);
  },
  onError: ({ error }) => {
    console.error('Chat error:', error);
    showErrorNotification(error.message);
  },
});
```

**Step 2: Send Programmatic Messages**

```typescript
const handleQuickAction = async (action: string) => {
  await sendUserMessage({
    text: `Execute: ${action}`,
  });
};
```

**See:** `references/examples.md#events-state`

### Phase 8: Style and Responsive Layout

**Step 1: Add Widget Container**

```typescript
<div className="flex flex-col h-screen bg-gray-50">
  {/* Header */}
  <header className="p-4 bg-white border-b">
    <h1 className="text-lg font-bold">Chat Support</h1>
  </header>

  {/* Chat Widget */}
  <main className="flex-1 overflow-hidden">
    <ChatKit control={control} className="h-full w-full" />
  </main>
</div>
```

**Step 2: Make Responsive**

```typescript
<ChatKit
  control={control}
  className="h-full w-full md:h-96 md:w-80 md:rounded-lg md:shadow-lg"
/>
```

**See:** `references/examples.md#responsive-layout`

## Common Patterns

### Pattern 1: Minimal Widget (No Header)
Small inline widget with just chat and composer. Best for sidebar or embedded contexts.

**See:** `references/examples.md#minimal-widget`

### Pattern 2: Full-Featured Widget
Complete header with actions, tools, start screen, and theming. Best for dedicated chat pages.

**See:** `references/examples.md#full-featured-widget`

### Pattern 3: Custom Styled Widget
Widget with custom CSS classes, Tailwind styling, and brand colors.

**See:** `references/examples.md#custom-styled-widget`

### Pattern 4: Multi-Widget Layout
Multiple chat widgets on same page (different threads or models).

**See:** `references/examples.md#multi-widget-layout`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Widget not rendering | Missing container or height | Ensure parent has defined height |
| Session fails | Invalid endpoint or credentials | Verify session endpoint works |
| Theme not applying | Theme passed to component | Pass theme to `useChatKit` hook |
| Tools not working | Tool click handler missing | Add `onToolClick` handler |
| Responsive broken | Missing container classes | Add flex, h-full, w-full classes |
| Memory leak | Refs not cleaned up | Use useEffect cleanup |

**See:** `references/troubleshooting.md` for detailed solutions

## Decision Trees

### Which Widget Type?

```
Need just chat? → Yes → Use Minimal Widget
                → No → Continue

Need header actions? → Yes → Use Full-Featured
                    → No → Use Minimal

Need custom styling? → Yes → Use Custom Styled
                    → No → Use Full-Featured or Minimal
```

### Theme or Default?

```
Brand colors needed? → Yes → Create custom theme
                    → No → Use default theme

Multiple variants? → Yes → Create theme system
                  → No → Single theme fine
```

## References

**Detailed Guides:**
- Widget architecture: `references/widget-architecture.md`
- Complete examples: `references/examples.md`
- Theming guide: `references/theming-guide.md`
- Quick reference: `references/quick-reference.md`
- Troubleshooting: `references/troubleshooting.md`
- Official docs: `references/official-docs/chatkit-api.md`

**Related Skills:**
- `chatkit-ui` - Full ChatKit UI skill
- `chatkit-custom-backend` - Custom backend integration
- `styling-with-shadcn` - UI component styling
- `nextjs16` - Next.js framework

## Tips for Success

1. **Start simple** - Build minimal widget first
2. **Test early** - Get basic widget working before customizing
3. **Use TypeScript** - Type safety helps with props
4. **Mobile first** - Design for small screens
5. **Brand colors** - Define theme variables early
6. **Error handling** - Always handle session and network errors
7. **Performance** - Use React.memo for heavy components
8. **Responsive** - Test on multiple screen sizes

## Version History

**v1.0.0 (2026-01-11)**
- Initial release
- 8-phase widget building workflow
- Support for React and Vanilla JS
- Theming and customization
- Header actions and composer tools
- Responsive layout patterns
- Complete examples and documentation

