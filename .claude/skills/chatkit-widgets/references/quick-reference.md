# ChatKit Widgets - Quick Reference

## Basic Widget

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

const { control } = useChatKit({
  api: {
    async getClientSecret() {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      return (await res.json()).client_secret;
    },
  },
});

<ChatKit control={control} className="h-96 w-full" />
```

## Theme Configuration

```typescript
theme: {
  colorScheme: 'light' | 'dark',
  color: {
    accent: { primary: '#3b82f6', level: 2 },
    grayscale: { hue: 220, tint: 5, shade: 0 },
    surface: { background: '#ffffff', foreground: '#1f2937' },
  },
  typography: {
    baseSize: 16,
    fontFamily: 'Inter, sans-serif',
    fontFamilyMono: 'Courier, monospace',
  },
  radius: 'round' | 'soft' | 'square',
  density: 'compact' | 'normal' | 'spacious',
}
```

## Header Configuration

```typescript
header: {
  enabled: true,
  title: {
    enabled: true,
    text: 'Chat Title',
  },
  leftAction: {
    icon: 'menu',
    label: 'Menu',
    onClick: () => {},
  },
  rightAction: {
    icon: 'settings-cog',
    label: 'Settings',
    onClick: () => {},
  },
}
```

## Composer Configuration

```typescript
composer: {
  placeholder: 'Type message...',
  tools: [
    {
      id: 'tool-id',
      label: 'Tool Name',
      icon: 'icon-name',
      pinned: true, // Always visible
    },
  ],
}
```

## Start Screen Configuration

```typescript
startScreen: {
  greeting: 'Welcome!',
  prompts: [
    {
      label: 'Action',
      prompt: 'Prompt text',
      icon: 'icon-name',
    },
  ],
}
```

## Event Handlers

```typescript
onMessageSent: ({ message }) => {
  console.log(message.text);
}

onThreadChange: ({ threadId }) => {
  console.log('Thread:', threadId);
}

onError: ({ error }) => {
  console.error(error.message);
}
```

## Programmatic Control

```typescript
const { control, sendUserMessage, setThreadId } = useChatKit({
  api: { getClientSecret: async () => {} },
});

// Send message
await sendUserMessage({ text: 'Hello' });

// Switch thread
await setThreadId('thread-123');
```

## Container Classes

```typescript
// Full screen
className="h-screen w-full"

// Fixed height
className="h-96 w-full"

// Responsive
className="h-full w-full md:h-96 md:w-80"

// With border/shadow
className="h-96 w-full rounded-lg shadow-lg border"
```

## Common Icon Names

```
menu
settings-cog
help-circle
paperclip
code
search
lightbulb
alert
credit-card
wrench
camera
chart
download
upload
```

## Color Schemes

### Light Theme
```typescript
theme: {
  colorScheme: 'light',
  color: {
    accent: { primary: '#3b82f6' },
    surface: { background: '#ffffff', foreground: '#1f2937' },
  },
}
```

### Dark Theme
```typescript
theme: {
  colorScheme: 'dark',
  color: {
    accent: { primary: '#60a5fa' },
    surface: { background: '#1f2937', foreground: '#f3f4f6' },
  },
}
```

### Brand Colors
```typescript
// Red
accent: { primary: '#D7263D' }

// Green
accent: { primary: '#22c55e' }

// Blue
accent: { primary: '#3b82f6' }

// Purple
accent: { primary: '#9333ea' }
```

## Responsive Breakpoints

```typescript
// Mobile only
className="h-screen w-full"

// Tablet and up (md: >= 768px)
className="h-screen w-full md:h-96 md:w-80"

// Desktop and up (lg: >= 1024px)
className="h-screen w-full md:h-96 md:w-80 lg:w-96"
```

## Session Endpoint

```typescript
// /api/chatkit/session
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const session = await openai.chatkit.sessions.create({
    user_id: user.id,
  });
  return Response.json({ client_secret: session.client_secret });
}
```

## Error Handling

```typescript
onError: ({ error }) => {
  if (error.code === 'UNAUTHORIZED') {
    // Handle auth error
  } else if (error.code === 'SESSION_FAILED') {
    // Handle session error
  } else {
    // Generic error
    showNotification(error.message, 'error');
  }
}
```

## Performance Optimization

```typescript
// Memoize callback
import { useCallback } from 'react';

const handleClick = useCallback(() => {
  // Handle click
}, []);

// Lazy load widget
const ChatWidget = lazy(() => import('./ChatWidget'));

// Memoize component
export default memo(ChatWidgetComponent);
```

## TypeScript Types

```typescript
interface Theme {
  colorScheme: 'light' | 'dark';
  color: {
    accent: { primary: string; level?: number };
    grayscale?: { hue?: number; tint?: number; shade?: number };
    surface: { background: string; foreground: string };
  };
  typography: {
    fontFamily: string;
    fontFamilyMono?: string;
    baseSize?: number;
  };
  radius?: 'round' | 'soft' | 'square';
  density?: 'compact' | 'normal' | 'spacious';
}

interface ChatKitOptions {
  api: { getClientSecret: () => Promise<string> };
  theme?: Theme;
  header?: HeaderConfig;
  composer?: ComposerConfig;
  startScreen?: StartScreenConfig;
}
```

## Development vs Production

```typescript
// Development
const { control } = useChatKit({
  api: {
    getClientSecret: async () => {
      // Your dev endpoint
    },
  },
});

// Production
const { control } = useChatKit({
  api: {
    getClientSecret: async () => {
      // Production endpoint
      // With error handling and logging
    },
  },
  onError: ({ error }) => {
    // Log to monitoring
    logErrorToService(error);
  },
});
```

## Testing

```typescript
// Mock session
jest.mock('fetch', () =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => ({ client_secret: 'test-secret' }),
    })
  )
);

// Render widget
render(<ChatWidget />);

// Verify rendering
expect(screen.getByRole('textbox')).toBeInTheDocument();
```

## Accessibility

```typescript
header: {
  title: {
    text: 'Chat',
    ariaLabel: 'Main chat interface', // Screen reader
  },
  leftAction: {
    label: 'Menu', // For screen readers
    ariaLabel: 'Open navigation menu',
  },
}

composer: {
  ariaLabel: 'Message input',
}
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com
OPENAI_API_KEY=sk-...
SESSION_ENDPOINT=/api/chatkit/session
```

## Common Patterns

### Inline Widget
```typescript
<ChatKit control={control} className="h-96 w-80" />
```

### Full Page Widget
```typescript
<ChatKit control={control} className="h-screen w-full" />
```

### Sidebar Widget
```typescript
<ChatKit control={control} className="h-screen w-64" />
```

### Modal Widget
```typescript
<div className="fixed inset-0 bg-black/50">
  <div className="absolute right-0 h-screen w-96">
    <ChatKit control={control} className="h-full" />
  </div>
</div>
```

