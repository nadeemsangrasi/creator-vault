# ChatKit Widgets Skill

Build embeddable ChatKit chat widgets with customizable themes, headers, composers, and tools. Configure session management, streaming, and responsive layouts for production chat applications.

## What This Skill Provides

- Widget setup and embedding
- Theme customization (colors, typography, radius, density)
- Header configuration with custom actions
- Composer customization with tools
- Start screen configuration
- Event handling and state management
- Responsive layouts
- Production-ready examples

## Quick Start

### 1. Install ChatKit

```bash
npm install @openai/chatkit-react
```

### 2. Create Session Endpoint

```typescript
// /api/chatkit/session
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const session = await openai.chatkit.sessions.create({ user_id: user.id });
  return Response.json({ client_secret: session.client_secret });
}
```

### 3. Create Widget

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

### 4. Done!

Your chat widget is ready to use.

## Installation

```bash
cp -r chatkit-widgets ~/.claude/skills/
claude reload
```

## Usage Examples

### Basic Widget

```bash
"Build a basic ChatKit widget with default styling"
```

### Themed Widget

```bash
"Create a ChatKit widget with dark theme and custom brand colors"
```

### Widget with Header Actions

```bash
"Build a ChatKit widget with a header, title, and action buttons"
```

### Full-Featured Widget

```bash
"Create a complete ChatKit widget with header, tools, start screen, and theme"
```

### Multi-Widget Layout

```bash
"Build a page with multiple chat widgets side by side"
```

## Key Features

### 1. Widget Embedding
- React component embedding
- Vanilla JavaScript web component
- Custom container sizing
- Responsive layouts

### 2. Theme Customization
- Color schemes (light/dark)
- Brand color configuration
- Typography settings
- Border radius and density

### 3. Header Configuration
- Custom titles
- Left/right action buttons
- Icon and label customization
- Click handlers

### 4. Composer Customization
- Placeholder text
- Custom tools/buttons
- File attachment support
- Tool click handlers

### 5. Start Screen
- Greeting message
- Quick action prompts
- Icon customization
- Prompt automation

### 6. Event Handling
- Thread change events
- Message sent events
- Error events
- Programmatic message sending

## Configuration Options

### Basic Configuration

```typescript
const { control } = useChatKit({
  api: {
    getClientSecret: async () => { /* ... */ }
  },
});
```

### With Theme

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  theme: {
    colorScheme: 'dark',
    color: { accent: { primary: '#3b82f6' } },
    typography: { fontFamily: 'Inter, sans-serif' },
  },
});
```

### With Header

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  header: {
    enabled: true,
    title: { enabled: true, text: 'Chat' },
    leftAction: { icon: 'menu', onClick: () => {} },
    rightAction: { icon: 'settings', onClick: () => {} },
  },
});
```

### With Composer Tools

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  composer: {
    placeholder: 'Type message...',
    tools: [
      { id: 'attach', label: 'Attach', icon: 'paperclip', pinned: true },
    ],
  },
});
```

### With Start Screen

```typescript
const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  startScreen: {
    greeting: 'Welcome!',
    prompts: [
      { label: 'Ask', prompt: 'Help me with...', icon: 'lightbulb' },
    ],
  },
});
```

## Common Patterns

### Minimal Widget (Just Chat)

```typescript
export function MinimalWidget() {
  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
  });

  return <ChatKit control={control} className="h-full w-full" />;
}
```

### Full-Featured Widget

```typescript
export function FullFeaturedWidget() {
  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
    theme: {
      colorScheme: 'light',
      color: { accent: { primary: '#3b82f6' } },
    },
    header: {
      enabled: true,
      title: { enabled: true, text: 'Support' },
      rightAction: { icon: 'settings', onClick: () => {} },
    },
    composer: {
      placeholder: 'Type your question...',
      tools: [
        { id: 'attach', label: 'Attach', icon: 'paperclip', pinned: true },
      ],
    },
    startScreen: {
      greeting: 'How can we help?',
      prompts: [
        { label: 'Bug', prompt: 'Report a bug', icon: 'alert' },
      ],
    },
  });

  return (
    <div className="flex flex-col h-screen">
      <ChatKit control={control} className="flex-1" />
    </div>
  );
}
```

### Custom Styled Widget

```typescript
export function CustomStyledWidget() {
  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
    theme: {
      colorScheme: 'dark',
      color: {
        accent: { primary: '#D7263D' },
        surface: { background: '#1f1f1f', foreground: '#ffffff' },
      },
      typography: { fontFamily: 'Georgia, serif' },
    },
  });

  return (
    <div className="rounded-lg shadow-lg overflow-hidden border border-gray-300">
      <ChatKit control={control} className="h-96 w-80" />
    </div>
  );
}
```

### Responsive Widget

```typescript
export function ResponsiveWidget() {
  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
  });

  return (
    <ChatKit
      control={control}
      className="w-full h-96 md:h-full md:w-96 lg:w-1/2 rounded-none md:rounded-lg"
    />
  );
}
```

## Theme Options

### Light Theme

```typescript
{
  colorScheme: 'light',
  color: {
    accent: { primary: '#3b82f6' },
    surface: { background: '#ffffff', foreground: '#1f2937' },
  },
}
```

### Dark Theme

```typescript
{
  colorScheme: 'dark',
  color: {
    accent: { primary: '#60a5fa' },
    surface: { background: '#1f2937', foreground: '#f3f4f6' },
  },
}
```

### Brand Colors

```typescript
{
  color: {
    accent: { primary: '#D7263D' },  // Red
    // or
    accent: { primary: '#22c55e' },  // Green
    // or
    accent: { primary: '#9333ea' },  // Purple
  },
}
```

## Header Actions

### Left Action (Menu/Sidebar)

```typescript
header: {
  leftAction: {
    icon: 'menu',
    label: 'Menu',
    onClick: () => toggleSidebar(),
  },
}
```

### Right Action (Settings)

```typescript
header: {
  rightAction: {
    icon: 'settings-cog',
    label: 'Settings',
    onClick: () => openSettings(),
  },
}
```

## Composer Tools

```typescript
composer: {
  tools: [
    // Pinned (always visible)
    { id: 'attach', label: 'Attach', icon: 'paperclip', pinned: true },

    // Hidden in menu
    { id: 'code', label: 'Code', icon: 'code' },
    { id: 'search', label: 'Search', icon: 'search' },
  ],
}
```

## Start Screen Prompts

```typescript
startScreen: {
  greeting: 'Welcome to support!',
  prompts: [
    {
      label: 'Quick Help',
      prompt: 'I need help with...',
      icon: 'lightbulb',
    },
    {
      label: 'Report Issue',
      prompt: 'Report a problem',
      icon: 'alert',
    },
  ],
}
```

## Event Handling

### On Message Sent

```typescript
onMessageSent: ({ message }) => {
  console.log('Message:', message.text);
  // Log to analytics, send to backend, etc.
}
```

### On Thread Change

```typescript
onThreadChange: ({ threadId }) => {
  localStorage.setItem('lastThread', threadId || '');
}
```

### On Error

```typescript
onError: ({ error }) => {
  console.error('Chat error:', error);
  showNotification('Error: ' + error.message, 'error');
}
```

## Programmatic Control

```typescript
const { control, sendUserMessage, setThreadId } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
});

// Send message programmatically
const handleQuickAction = async () => {
  await sendUserMessage({ text: 'Execute action' });
};

// Switch threads
const switchChat = async (threadId: string) => {
  await setThreadId(threadId);
};
```

## Documentation

### Detailed Guides
- **Widget Architecture** - `references/widget-architecture.md`
- **Complete Examples** - `references/examples.md`
- **Theming Guide** - `references/theming-guide.md`
- **Quick Reference** - `references/quick-reference.md`
- **Troubleshooting** - `references/troubleshooting.md`
- **Official Docs** - `references/official-docs/chatkit-api.md`

### Related Skills
- `chatkit-ui` - Full ChatKit UI skill
- `chatkit-custom-backend` - Custom backend integration
- `styling-with-shadcn` - UI component styling
- `nextjs16` - Next.js framework

## Performance Tips

1. **Memoize callbacks** - Use `useCallback` for handlers
2. **Lazy load** - Load widget only when needed
3. **Optimize images** - Use next/image for logos
4. **Cache sessions** - Don't create new session per message
5. **Monitor bundle** - Keep widget bundle small

## Security Checklist

- [ ] Validate all API responses
- [ ] Use HTTPS for session endpoint
- [ ] Protect session endpoint with auth
- [ ] Don't expose API keys in frontend
- [ ] Validate user permissions
- [ ] Sanitize user input
- [ ] Use environment variables for config
- [ ] Rate limit session creation

## Accessibility

- Use semantic HTML
- Provide alt text for icons
- Ensure keyboard navigation
- Support high contrast mode
- Test with screen readers
- Use ARIA labels

## Support

For issues or questions:
1. Check `references/troubleshooting.md`
2. Review examples in `references/examples.md`
3. See `references/official-docs/chatkit-api.md`
4. Check widget rendering (height, parent container)
5. Verify session endpoint works

## Version

**v1.0.0 (2026-01-11)**
- Initial release
- 8-phase widget building workflow
- Support for React and Vanilla JS
- Theming and customization
- Header actions and composer tools
- Responsive layout patterns
- Complete examples and documentation
- Official OpenAI ChatKit documentation integration

## License

This skill follows the same license as Claude Code and OpenAI ChatKit.

