# ChatKit UI Skill

Build high-quality, production-ready AI-powered chat interfaces with OpenAI ChatKit. ChatKit provides batteries-included chat functionality with deep customization, streaming responses, tool integration, and session management.

## What is ChatKit?

ChatKit is a framework for building AI chat applications with:
- **Pre-built UI components** - Messages, composer, start screen
- **Response streaming** - Real-time token-by-token responses
- **Tool integration** - Custom actions and attachments
- **Deep customization** - Theme, branding, prompts
- **Session management** - Authentication, multi-thread chat
- **Mobile-ready** - Responsive by default

## Quick Start

### 1. Install

```bash
npm install @openai/chatkit-react
```

### 2. Create Backend Session Endpoint

```typescript
// /api/chatkit/session
export async function POST(req: Request) {
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await openai.chatkit.sessions.create({
    user_id: user.id,
  });

  return Response.json({ client_secret: session.client_secret });
}
```

### 3. Add ChatKit Component

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

### 4. Done!

Your chat interface is ready to use. Customize colors, prompts, and behavior with configuration options.

## Key Features

### Authentication

```typescript
api: {
  async getClientSecret(existing) {
    if (existing) {
      // Refresh existing token
      const res = await fetch('/api/chatkit/refresh', {
        method: 'POST',
        body: JSON.stringify({ token: existing }),
      });
      return (await res.json()).client_secret;
    }

    // Create new session
    const res = await fetch('/api/chatkit/session', { method: 'POST' });
    return (await res.json()).client_secret;
  },
}
```

### Theming

```typescript
theme: {
  colorScheme: 'dark',
  color: { accent: { primary: '#3b82f6' } },
  typography: { fontFamily: 'Inter, sans-serif' },
}
```

### Start Screen with Prompts

```typescript
startScreen: {
  greeting: 'How can I help?',
  prompts: [
    { label: 'Explain', prompt: 'Explain quantum computing', icon: 'lightbulb' },
    { label: 'Code', prompt: 'Write a React component', icon: 'code' },
  ],
}
```

### Multi-Thread Chat

```typescript
const { control, setThreadId } = useChatKit({
  initialThread: localStorage.getItem('lastThreadId') || null,
  onThreadChange: ({ threadId }) => {
    localStorage.setItem('lastThreadId', threadId || '');
  },
});
```

### Tools and Custom Actions

```typescript
composer: {
  tools: [
    { id: 'search', label: 'Search', icon: 'search', pinned: true },
    { id: 'analyze', label: 'Analyze', icon: 'chart' },
  ],
}
```

## Installation

Copy the skill to your `.claude/skills/` directory:

```bash
cp -r chatkit-ui ~/.claude/skills/
```

Restart Claude Code:

```bash
claude reload
```

## Usage Examples

### Basic Chat
```bash
# Ask Claude:
"Build a basic ChatKit interface with authentication"
```

### Themed Chat
```bash
# Ask Claude:
"Create a dark-themed ChatKit with custom brand colors"
```

### Multi-Thread Chat
```bash
# Ask Claude:
"Build a chat app with conversation history and thread switching"
```

### With Tools
```bash
# Ask Claude:
"Add search and analyze tools to my ChatKit interface"
```

## Common Use Cases

### Support Bot
```typescript
startScreen: {
  greeting: 'Welcome to Support! How can we help?',
  prompts: [
    { label: 'Bug Report', prompt: 'Report a bug', icon: 'alert' },
    { label: 'Feature Request', prompt: 'Request a feature', icon: 'lightbulb' },
    { label: 'Billing', prompt: 'Questions about billing', icon: 'credit-card' },
  ],
}
```

### Data Analysis
```typescript
composer: {
  tools: [
    { id: 'upload-data', label: 'Upload Data', icon: 'upload' },
    { id: 'visualize', label: 'Visualize', icon: 'chart' },
    { id: 'export', label: 'Export', icon: 'download' },
  ],
}
```

### Code Assistant
```typescript
startScreen: {
  prompts: [
    { label: 'Code Review', prompt: 'Review my code for bugs', icon: 'code' },
    { label: 'Explain Code', prompt: 'Explain this code to me', icon: 'book' },
    { label: 'Refactor', prompt: 'Help me refactor this', icon: 'tool' },
  ],
}
```

## Configuration Options

### API Configuration

```typescript
api: {
  getClientSecret: async (existing?) => string,  // Required
  url?: string,                                   // Custom API URL
  domainKey?: string,                            // Domain key
  fetch?: (input, init) => Promise<Response>,   // Custom fetch
  uploadStrategy?: 'direct' | 'two_phase',      // Upload method
}
```

### Theme Options

```typescript
theme: {
  colorScheme: 'light' | 'dark',
  color: {
    accent: { primary: string, level?: number },
    grayscale: { hue?: number, tint?: number, shade?: number },
    surface: { background: string, foreground: string },
  },
  typography: {
    fontFamily: string,
    fontFamilyMono: string,
    baseSize: number,
  },
  radius: 'round' | 'soft' | 'square',
  density: 'compact' | 'normal' | 'spacious',
}
```

### Composer Options

```typescript
composer: {
  placeholder?: string,
  tools?: Array<{ id: string, label: string, icon: string, pinned?: boolean }>,
  attachments?: {
    enabled: boolean,
    maxFiles?: number,
    maxSize?: number,
    allowedTypes?: string[],
  },
}
```

### Start Screen Options

```typescript
startScreen: {
  greeting?: string,
  prompts?: Array<{
    label: string,
    prompt: string,
    icon: string,
  }>,
}
```

## Authentication Best Practices

1. **Protect session endpoints** - Always verify user authentication
2. **Use HTTPS** - Enforce HTTPS in production
3. **Rate limit** - Prevent abuse of session creation
4. **Log events** - Track authentication attempts
5. **Handle expiry** - Implement proper token refresh

**See:** `references/authentication.md`

## Theming Best Practices

1. **Start with defaults** - Base theme works well
2. **Choose brand colors** - Pick 1-2 primary colors
3. **Test contrast** - Ensure text is readable
4. **Mobile test** - Check on small screens
5. **Accessibility** - Support dark mode and large text

**See:** `references/theming.md`

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t chatkit-app .
docker run -p 3000:3000 chatkit-app
```

## Troubleshooting

### "client_secret undefined"
- Check backend endpoint returns correct format
- Verify `client_secret` in response JSON

### "Theme not applying"
- Pass theme to `useChatKit`, not `ChatKit` component
- Check CSS specificity for overrides

### "Session expired"
- Implement proper refresh logic in `getClientSecret`
- Handle 401 responses from API

**See:** `references/troubleshooting.md` for more

## Documentation

### Core Files
- **SKILL.md** - 8-phase workflow (402 lines)
- **README.md** - This file (quick start)

### Reference Documentation
- **examples.md** - 7 complete implementations
- **authentication.md** - Session management
- **theming.md** - Colors, fonts, customization
- **multi-thread.md** - Conversation history
- **tools.md** - Custom actions
- **styling.md** - CSS and responsive design
- **deployment.md** - Production deployment
- **troubleshooting.md** - Common issues

### External Resources
- **ChatKit GitHub:** https://github.com/openai/chatkit-js
- **ChatKit Docs:** https://chatkit.dev
- **OpenAI API:** https://openai.com/api

## Real-World Examples

### Support Chatbot
Complete support bot with ticketing, routing, and canned responses.
**See:** `references/examples.md#support-bot`

### Data Analysis Assistant
Chat interface for data analysis with upload and visualization tools.
**See:** `references/examples.md#data-analysis`

### Code Assistant
AI-powered code review and refactoring assistant.
**See:** `references/examples.md#code-assistant`

## Performance Tips

1. **Lazy load ChatKit** - Load component only when needed
2. **Memoize callbacks** - Use `useCallback` for API functions
3. **Optimize fonts** - Use `font-display: swap`
4. **Monitor API** - Track session creation latency
5. **Cache responses** - Store frequently accessed data

## Security Checklist

- [ ] Session endpoints protected with auth
- [ ] HTTPS enforced in production
- [ ] Rate limiting on session endpoints
- [ ] Auth events logged for audit
- [ ] Sensitive data not in localStorage
- [ ] CORS properly configured
- [ ] Input validation on backend
- [ ] Error messages don't leak info

## Support

For issues or questions:
1. Check `references/troubleshooting.md`
2. Review examples in `references/examples.md`
3. Consult official docs: https://chatkit.dev
4. Use Context7 MCP: `/fetching-library-docs openai/chatkit-js`

## Version

**v1.0.0 (2026-01-11)**
- Initial release
- 7 complete examples
- Authentication guide
- Comprehensive theming
- Multi-thread support
- Production-ready

## License

This skill follows the same license as Claude Code and ChatKit.
