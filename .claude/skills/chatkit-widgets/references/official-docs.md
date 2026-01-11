# ChatKit Official Documentation Reference

This document contains key excerpts from the official OpenAI ChatKit documentation fetched via Context7 MCP.

## ChatKit Overview

ChatKit is a batteries-included framework for building high-quality, AI-powered chat experiences with:
- Pre-built UI components (messages, composer, start screen)
- Response streaming (real-time token-by-token)
- Deep UI customization (theme, branding, prompts)
- Session management (authentication, multi-thread)
- Mobile-ready (responsive by default)
- Production components (ready for enterprise use)

**Source:** OpenAI ChatKit Official Documentation

## Core Components

### ChatKit React Component

The main component that renders the chat interface.

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

  return <ChatKit control={control} className="h-[600px] w-[320px]" />;
}
```

### Web Component

Vanilla JavaScript alternative using web components.

```js
function InitChatkit({ clientToken }) {
  const chatkit = document.createElement('openai-chatkit');
  chatkit.setOptions({ api: { clientToken } });
  chatkit.classList.add('h-[600px]', 'w-[320px]');
  document.body.appendChild(chatkit);
}
```

## Configuration Options

### Theme Configuration

Comprehensive theming system for visual customization.

```typescript
theme: {
  colorScheme: 'dark',
  color: {
    accent: { primary: '#D7263D', level: 2 },
    grayscale: { hue: 220, tint: 5, shade: 0 },
    surface: { background: '#1f2937', foreground: '#ffffff' },
  },
  typography: {
    fontFamily: 'Open Sans, sans-serif',
    fontFamilyMono: 'Courier, monospace',
    baseSize: 16,
    fontSources: [
      {
        family: 'Open Sans',
        src: 'https://fonts.googleapis.com/...',
        weight: '400 700',
        display: 'swap',
      },
    ],
  },
  radius: 'round',
  density: 'normal',
}
```

### Header Configuration

Customize the chat header with title and actions.

```typescript
header: {
  enabled: true,
  title: {
    enabled: true,
    text: 'AI Support Assistant',
  },
  leftAction: {
    icon: 'menu',
    onClick: () => {},
  },
  rightAction: {
    icon: 'settings-cog',
    onClick: () => {},
  },
}
```

### Composer Configuration

Customize the message input area and tools.

```typescript
composer: {
  placeholder: 'Type your message...',
  tools: [
    {
      id: 'attach',
      label: 'Attach',
      icon: 'paperclip',
      pinned: true,  // Always visible
    },
  ],
}
```

### Start Screen Configuration

First-time user experience with greeting and prompts.

```typescript
startScreen: {
  greeting: 'Welcome to FeedbackBot!',
  prompts: [
    {
      name: 'Bug',
      prompt: 'Report a bug',
      icon: 'alert',
    },
  ],
}
```

## Entity Configuration

Advanced feature for tag search and entity previews.

```typescript
entities: {
  onTagSearch: async (query) => [
    { id: 'user_123', title: 'Jane Doe' },
  ],
  onRequestPreview: async (entity) => ({
    preview: {
      type: 'Card',
      children: [
        { type: 'Text', value: `Profile: ${entity.title}` },
        { type: 'Text', value: 'Role: Developer' },
      ],
    },
  }),
}
```

## API Configuration

Connect ChatKit to your backend API.

```typescript
api: {
  // Required: Get or create session token
  getClientSecret: async (existing) => {
    // Refresh existing token if provided
    if (existing) {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        body: JSON.stringify({ token: existing }),
      });
      if (res.ok) return (await res.json()).client_secret;
    }

    // Create new session
    const res = await fetch('/api/session', { method: 'POST' });
    return (await res.json()).client_secret;
  },

  // Optional: Custom API URL
  url: 'https://api.example.com',

  // Optional: Domain key
  domainKey: 'your-domain-key',

  // Optional: Custom fetch implementation
  fetch: (url, init) => globalThis.fetch(url, init),

  // Optional: Upload strategy
  uploadStrategy: 'direct' | 'two_phase',
}
```

## Event Handlers

Listen to chat events and respond.

```typescript
{
  // User sent a message
  onMessageSent: ({ message }) => {
    console.log('Message:', message.text);
  },

  // Thread changed (new conversation)
  onThreadChange: ({ threadId }) => {
    console.log('New thread:', threadId);
  },

  // Error occurred
  onError: ({ error }) => {
    console.error('Error:', error);
  },

  // Chat control events
  onChatEvent: (event) => {
    console.log('Event:', event);
  },
}
```

## Response Format

ChatKit expects responses in this format from your backend.

```typescript
interface SessionResponse {
  client_secret: string;           // Required: session token
  expires_at?: string;             // Optional: expiry time
  model?: string;                  // Optional: which model to use
  metadata?: Record<string, any>;  // Optional: custom data
}
```

## Styling

### CSS Classes

ChatKit applies standard CSS classes you can customize.

```css
/* Messages */
.chatkit-message
.chatkit-message-user
.chatkit-message-assistant
.chatkit-message-system

/* Composer */
.chatkit-composer
.chatkit-composer-input
.chatkit-composer-button

/* Header */
.chatkit-header
.chatkit-header-title
.chatkit-header-action

/* Container */
.chatkit-container
.chatkit-message-list
```

### Tailwind Integration

Use Tailwind classes for styling.

```tsx
<ChatKit
  control={control}
  className="h-screen w-full rounded-lg shadow-lg border border-gray-200"
/>
```

## TypeScript Support

Full TypeScript types available for better DX.

```typescript
import {
  ChatKit,
  useChatKit,
  type ChatKitOptions,
  type Theme,
  type HeaderConfig,
  type ComposerConfig,
  type StartScreenConfig,
} from '@openai/chatkit-react';
```

## Browser Compatibility

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android latest

## Performance Considerations

- Lazy load ChatKit component when possible
- Use React.memo for parent components
- Memoize callback functions with useCallback
- Optimize bundle size with tree-shaking
- Use code splitting for widget code

## Security

- Always use HTTPS for session endpoint
- Validate and authenticate users before creating sessions
- Never expose API keys in frontend code
- Use environment variables for sensitive configuration
- Implement rate limiting on session endpoint

## Advanced Features

### Multi-Thread Support

Maintain separate conversation threads.

```typescript
const { control, setThreadId } = useChatKit({
  api: { getClientSecret: async () => {} },
  initialThread: null,  // Start new or load existing
  onThreadChange: ({ threadId }) => {
    // Save thread preference
  },
});

// Switch threads
await setThreadId('thread-id');
```

### Custom Tools

Add custom action buttons to composer.

```typescript
composer: {
  tools: [
    {
      id: 'custom-action',
      label: 'Action',
      icon: 'custom-icon',
      onClick: () => {}, // Optional: custom handler
    },
  ],
}
```

### Attachment Support

Upload files and attachments.

```typescript
composer: {
  attachments: {
    enabled: true,
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,  // 10MB
    allowedTypes: ['application/pdf', 'image/*', 'text/*'],
  },
}
```

## Documentation Links

- **Official Repo:** https://github.com/openai/chatkit-js
- **ChatKit Docs:** https://chatkit.dev
- **OpenAI API:** https://openai.com/api
- **GitHub Issues:** https://github.com/openai/chatkit-js/issues
- **Discussions:** https://github.com/openai/chatkit-js/discussions

## Version

This documentation references ChatKit v1.0+. Check official docs for latest features and changes.

