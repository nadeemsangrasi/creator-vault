# ChatKit UI Examples

## Example 1: Basic Chat Setup

Simple ChatKit integration with minimal configuration.

### Project Structure
```
src/
├── components/
│   └── Chat.tsx
├── api/
│   └── chatkit/
│       └── session.ts
└── App.tsx
```

### Implementation

**src/api/chatkit/session.ts (Backend):**
```typescript
export async function POST(req: Request) {
  // Get user from session
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create ChatKit session
    const session = await openai.chatkit.sessions.create({
      user_id: user.id,
    });

    return Response.json({
      client_secret: session.client_secret,
    });
  } catch (error) {
    console.error('ChatKit session creation failed:', error);
    return Response.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

**src/components/Chat.tsx:**
```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function Chat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to get session');
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

**src/App.tsx:**
```typescript
import { Chat } from './components/Chat';

export default function App() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}
```

---

## Example 2: Themed Chat Application

ChatKit with custom colors, typography, and start screen.

### Implementation

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function ThemedChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: {
      colorScheme: 'dark',
      typography: {
        baseSize: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontFamilyMono: 'JetBrains Mono, monospace',
      },
      radius: 'round',
      density: 'normal',
      color: {
        accent: {
          primary: '#3b82f6',
          level: 2,
        },
        grayscale: {
          hue: 220,
          tint: 5,
        },
        surface: {
          background: '#1f2937',
          foreground: '#f3f4f6',
        },
      },
    },
    composer: {
      placeholder: 'Ask me anything about your data...',
      tools: [
        { id: 'analyze', label: 'Analyze', icon: 'chart', pinned: true },
        { id: 'export', label: 'Export', icon: 'download' },
      ],
    },
    startScreen: {
      greeting: 'Welcome to DataChat! 📊',
      prompts: [
        {
          label: 'Analyze trends',
          prompt: 'Analyze trends in my sales data',
          icon: 'chart',
        },
        {
          label: 'Generate report',
          prompt: 'Generate a summary report',
          icon: 'document',
        },
        {
          label: 'Compare metrics',
          prompt: 'Compare this month vs last month',
          icon: 'scale',
        },
      ],
    },
    header: {
      leftAction: {
        icon: 'settings-cog',
        onClick: () => console.log('Settings clicked'),
      },
    },
  });

  return (
    <div className="h-screen w-full">
      <ChatKit control={control} />
    </div>
  );
}
```

---

## Example 3: Multi-Thread Chat with Sidebar

Conversation history with thread switching capability.

### Implementation

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState, useEffect } from 'react';

interface Thread {
  id: string;
  name: string;
  createdAt: Date;
}

export function MultiThreadChat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  const { control, setThreadId, focusComposer } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    initialThread: localStorage.getItem('lastThreadId') || null,
    onThreadChange: ({ threadId }) => {
      setCurrentThreadId(threadId);
      if (threadId) {
        localStorage.setItem('lastThreadId', threadId);

        if (!threads.find((t) => t.id === threadId)) {
          setThreads([
            ...threads,
            {
              id: threadId,
              name: `Conversation ${threads.length + 1}`,
              createdAt: new Date(),
            },
          ]);
        }
      }
    },
  });

  const createNewThread = async () => {
    await setThreadId(null);
    await focusComposer();
  };

  const switchThread = async (threadId: string) => {
    await setThreadId(threadId);
    await focusComposer();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white border-r">
        <div className="p-4">
          <button
            onClick={createNewThread}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 mb-4"
          >
            + New Conversation
          </button>

          <div className="space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => switchThread(thread.id)}
                className={`w-full text-left px-3 py-2 rounded ${
                  currentThreadId === thread.id
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                <div className="font-medium truncate">{thread.name}</div>
                <div className="text-xs text-gray-400">
                  {thread.createdAt.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </main>
    </div>
  );
}
```

---

## Example 4: Chat with Tool Integration

ChatKit with custom tools and message sending.

### Implementation

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useCallback } from 'react';

export function ChatWithTools() {
  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    composer: {
      placeholder: 'Type a question or use quick actions...',
      tools: [
        {
          id: 'file-upload',
          label: 'Upload File',
          icon: 'upload',
          pinned: true,
        },
        {
          id: 'code-snippet',
          label: 'Code',
          icon: 'code',
          pinned: true,
        },
        {
          id: 'search-web',
          label: 'Search Web',
          icon: 'search',
        },
      ],
    },
  });

  const handleQuickAction = useCallback(
    async (action: string) => {
      switch (action) {
        case 'summarize':
          await sendUserMessage({
            text: 'Please provide a summary of our conversation so far',
          });
          break;

        case 'explain':
          await sendUserMessage({
            text: 'Can you explain that in simpler terms?',
          });
          break;

        case 'code-review':
          await sendUserMessage({
            text: 'Please review this code for best practices and potential bugs',
            attachments: [],
          });
          break;

        case 'new-topic':
          await sendUserMessage({
            text: 'I want to discuss a completely new topic',
            newThread: true,
          });
          break;

        default:
          console.warn(`Unknown action: ${action}`);
      }
    },
    [sendUserMessage]
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Quick Actions */}
      <div className="flex gap-2 p-4 bg-gray-50 border-b">
        <button
          onClick={() => handleQuickAction('summarize')}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
        >
          Summarize
        </button>
        <button
          onClick={() => handleQuickAction('explain')}
          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
        >
          Explain
        </button>
        <button
          onClick={() => handleQuickAction('code-review')}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
        >
          Code Review
        </button>
        <button
          onClick={() => handleQuickAction('new-topic')}
          className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
        >
          New Topic
        </button>
      </div>

      {/* Chat */}
      <main className="flex-1 overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </main>
    </div>
  );
}
```

---

## Example 5: Production-Ready Chat Application

Complete chat app with error handling, logging, and monitoring.

### Implementation

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useEffect, useState, useCallback } from 'react';
import { useErrorBoundary } from 'react-error-boundary';

interface ChatError {
  code: string;
  message: string;
  timestamp: Date;
}

export function ProductionChat() {
  const { showBoundary } = useErrorBoundary();
  const [errors, setErrors] = useState<ChatError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret(existing) {
        try {
          setIsLoading(true);

          if (existing) {
            // Refresh expired token
            const res = await fetch('/api/chatkit/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: existing }),
            });

            if (!res.ok) throw new Error('Token refresh failed');
            const { client_secret } = await res.json();
            return client_secret;
          }

          // Create new session
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) throw new Error('Session creation failed');
          const { client_secret } = await res.json();
          return client_secret;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logError('AUTH_ERROR', err.message);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
    },
    theme: {
      colorScheme: 'light',
      color: { accent: { primary: '#3b82f6' } },
    },
    onError: ({ error }) => {
      const chatError: ChatError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date(),
      };
      setErrors((prev) => [...prev, chatError]);
      logError(chatError.code, chatError.message);
    },
    onThreadChange: ({ threadId }) => {
      localStorage.setItem('lastThreadId', threadId || '');
      logEvent('THREAD_CHANGE', { threadId });
    },
  });

  const logError = useCallback((code: string, message: string) => {
    console.error(`[ChatKit] ${code}: ${message}`);
    // Send to monitoring service
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'error', code, message }),
    }).catch(console.error);
  }, []);

  const logEvent = useCallback((event: string, data?: Record<string, any>) => {
    console.log(`[ChatKit] ${event}`, data);
    // Send to analytics service
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, timestamp: new Date() }),
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-600">Powered by OpenAI ChatKit</p>
          </div>
          {isLoading && <div className="text-sm text-blue-600">Connecting...</div>}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </main>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="border-t bg-red-50 p-3">
          <div className="text-sm text-red-800">
            <strong>Error:</strong> {errors[errors.length - 1].message}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto">
          Need help? <a href="/support" className="text-blue-600 hover:underline">Contact support</a>
        </div>
      </footer>
    </div>
  );
}
```

---

## Example 6: Mobile-Responsive Chat

ChatKit optimized for mobile and tablet devices.

### Implementation

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export function ResponsiveChat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
  });

  return (
    <div className="h-screen w-full flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-blue-600 text-white p-4">
        <h1 className="font-bold">Chat</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      </div>

      {/* Sidebar - Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden absolute left-0 top-14 w-64 h-full bg-gray-100 border-r z-10">
          <nav className="p-4 space-y-2">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-200 rounded">
              New Chat
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-200 rounded">
              History
            </button>
          </nav>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:block w-64 bg-gray-100 border-r">
        <div className="p-4">
          <button className="w-full bg-blue-600 text-white rounded px-4 py-2 mb-4">
            + New Chat
          </button>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 overflow-hidden">
        <ChatKit
          control={control}
          className="h-full w-full"
        />
      </main>
    </div>
  );
}
```

---

## Example 7: Dark Mode with System Preference

ChatKit with automatic dark mode detection.

### Implementation

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useEffect, useState } from 'react';

export function DarkModeChat() {
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    theme: {
      colorScheme: isDark ? 'dark' : 'light',
      color: isDark
        ? {
            accent: { primary: '#60a5fa' },
            surface: { background: '#1f2937', foreground: '#f3f4f6' },
          }
        : {
            accent: { primary: '#3b82f6' },
            surface: { background: '#ffffff', foreground: '#1f2937' },
          },
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```
