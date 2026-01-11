# ChatKit Multi-Thread Chat

## Overview

Multi-thread chat enables users to maintain multiple independent conversations. ChatKit manages thread state automatically, and you control thread switching through the `setThreadId` method.

## Thread Concepts

### What is a Thread?

A thread is an independent conversation with its own message history. Each thread has:
- Unique `threadId` - identifier for the conversation
- Message history - all messages in that thread
- System context - maintained separately per thread
- State isolation - one thread doesn't affect another

### Thread Lifecycle

```
User creates chat
    ↓
Default thread created (null or provided initialThread)
    ↓
Messages accumulate in current thread
    ↓
User switches thread (or creates new)
    ↓
Previous thread state saved
    ↓
New thread loaded (or empty if new)
    ↓
Messages accumulate in new thread
```

## Basic Multi-Thread Setup

### Simple Thread Switching

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export function SimpleMultiThread() {
  const [threads, setThreads] = useState<string[]>([]);

  const { control, setThreadId } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    onThreadChange: ({ threadId }) => {
      if (threadId && !threads.includes(threadId)) {
        setThreads([...threads, threadId]);
      }
    },
  });

  const handleNewThread = async () => {
    await setThreadId(null);
  };

  const handleSwitchThread = async (threadId: string) => {
    await setThreadId(threadId);
  };

  return (
    <div className="flex gap-4">
      <div className="w-48">
        <button
          onClick={handleNewThread}
          className="w-full mb-2 px-3 py-2 bg-blue-600 text-white rounded"
        >
          New Thread
        </button>
        {threads.map((id) => (
          <button
            key={id}
            onClick={() => handleSwitchThread(id)}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
          >
            {id.substring(0, 8)}...
          </button>
        ))}
      </div>
      <div className="flex-1">
        <ChatKit control={control} className="h-screen" />
      </div>
    </div>
  );
}
```

## Advanced Thread Management

### Thread Storage

```typescript
// LocalStorage-based thread management
interface StoredThread {
  id: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
}

const loadThreads = (): StoredThread[] => {
  const stored = localStorage.getItem('chatkit_threads');
  return stored ? JSON.parse(stored) : [];
};

const saveThreads = (threads: StoredThread[]) => {
  localStorage.setItem('chatkit_threads', JSON.stringify(threads));
};

const addThread = (threadId: string, name: string) => {
  const threads = loadThreads();
  threads.push({
    id: threadId,
    name,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  });
  saveThreads(threads);
};

const updateThreadName = (threadId: string, newName: string) => {
  const threads = loadThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (thread) {
    thread.name = newName;
    thread.lastUpdated = new Date().toISOString();
    saveThreads(threads);
  }
};

const deleteThread = (threadId: string) => {
  const threads = loadThreads();
  saveThreads(threads.filter((t) => t.id !== threadId));
};
```

### Persistent Thread State

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useEffect, useState } from 'react';

interface StoredThread {
  id: string;
  name: string;
  createdAt: Date;
  lastUpdated: Date;
}

export function PersistentMultiThread() {
  const [threads, setThreads] = useState<StoredThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  // Load threads from storage
  useEffect(() => {
    const stored = localStorage.getItem('chatkit_threads');
    if (stored) {
      setThreads(JSON.parse(stored));
      const lastThread = localStorage.getItem('chatkit_lastThread');
      if (lastThread) {
        setCurrentThreadId(lastThread);
      }
    }
  }, []);

  const { control, setThreadId } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    initialThread: currentThreadId || null,
    onThreadChange: ({ threadId }) => {
      setCurrentThreadId(threadId);
      localStorage.setItem('chatkit_lastThread', threadId || '');

      if (threadId && !threads.find((t) => t.id === threadId)) {
        const newThread: StoredThread = {
          id: threadId,
          name: `Conversation ${threads.length + 1}`,
          createdAt: new Date(),
          lastUpdated: new Date(),
        };
        const updated = [...threads, newThread];
        setThreads(updated);
        localStorage.setItem('chatkit_threads', JSON.stringify(updated));
      } else if (threadId) {
        // Update lastUpdated
        const updated = threads.map((t) =>
          t.id === threadId ? { ...t, lastUpdated: new Date() } : t
        );
        setThreads(updated);
        localStorage.setItem('chatkit_threads', JSON.stringify(updated));
      }
    },
  });

  const renameThread = (threadId: string, newName: string) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, name: newName } : t
    );
    setThreads(updated);
    localStorage.setItem('chatkit_threads', JSON.stringify(updated));
  };

  const deleteThread = async (threadId: string) => {
    const updated = threads.filter((t) => t.id !== threadId);
    setThreads(updated);
    localStorage.setItem('chatkit_threads', JSON.stringify(updated));

    if (currentThreadId === threadId) {
      await setThreadId(null);
    }
  };

  const createNewThread = async () => {
    await setThreadId(null);
  };

  const switchThread = async (threadId: string) => {
    await setThreadId(threadId);
  };

  return (
    <div className="flex h-screen gap-4">
      <aside className="w-64 bg-gray-50 border-r overflow-y-auto">
        <div className="p-4">
          <button
            onClick={createNewThread}
            className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New Conversation
          </button>

          <div className="space-y-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 rounded cursor-pointer ${
                  currentThreadId === thread.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div
                  onClick={() => switchThread(thread.id)}
                  className="font-medium truncate"
                >
                  {thread.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {thread.createdAt.toLocaleDateString()}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newName = prompt('New name:', thread.name);
                      if (newName) renameThread(thread.id, newName);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </main>
    </div>
  );
}
```

## Thread Context and System Prompts

### Per-Thread System Context

```typescript
// Backend endpoint that accepts threadId
export async function POST(req: Request) {
  const { threadId } = await req.json();
  const user = await getSessionUser(req);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch thread-specific context if needed
    let systemContext = 'You are a helpful assistant.';
    if (threadId) {
      const thread = await db.threads.findUnique({
        where: { id: threadId, userId: user.id },
      });
      if (thread?.systemPrompt) {
        systemContext = thread.systemPrompt;
      }
    }

    const session = await openai.chatkit.sessions.create({
      user_id: user.id,
      metadata: {
        threadId,
        systemContext,
      },
    });

    return Response.json({ client_secret: session.client_secret });
  } catch (error) {
    console.error('Session creation failed:', error);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

### Thread-Specific Behavior

```typescript
const { control } = useChatKit({
  api: {
    async getClientSecret(existing) {
      // Include thread context in session creation
      const res = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: currentThreadId }),
      });

      if (!res.ok) throw new Error('Session failed');
      return (await res.json()).client_secret;
    },
  },
  onThreadChange: ({ threadId }) => {
    // Handle thread-specific initialization
    if (threadId) {
      console.log(`Switched to thread: ${threadId}`);
      // Could load thread-specific settings here
    } else {
      console.log('Started new thread');
    }
  },
});
```

## Thread UI Patterns

### Thread List with Search

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredThreads = threads.filter((t) =>
  t.name.toLowerCase().includes(searchQuery.toLowerCase())
);

return (
  <aside className="w-64 bg-gray-50 border-r flex flex-col">
    <div className="p-4 border-b">
      <input
        type="text"
        placeholder="Search threads..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {filteredThreads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => switchThread(thread.id)}
          className={`w-full text-left px-3 py-2 rounded ${
            currentThreadId === thread.id
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-200'
          }`}
        >
          {thread.name}
        </button>
      ))}
    </div>
  </aside>
);
```

### Thread List with Timestamps

```typescript
const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

return (
  <div className="space-y-2">
    {threads.map((thread) => (
      <button
        key={thread.id}
        onClick={() => switchThread(thread.id)}
        className="w-full text-left p-3 hover:bg-gray-100 rounded"
      >
        <div className="font-medium">{thread.name}</div>
        <div className="text-xs text-gray-500">
          {formatTime(thread.lastUpdated)}
        </div>
      </button>
    ))}
  </div>
);
```

## Common Patterns

### Archive Old Threads

```typescript
const archiveThread = async (threadId: string) => {
  const updated = threads.map((t) =>
    t.id === threadId ? { ...t, archived: true } : t
  );
  setThreads(updated);
  localStorage.setItem('chatkit_threads', JSON.stringify(updated));
};

const showArchived = () => {
  const archived = threads.filter((t) => t.archived);
  // Show modal or separate view
};
```

### Export Thread History

```typescript
const exportThread = async (threadId: string) => {
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return;

  // Fetch thread messages from backend
  const res = await fetch(`/api/threads/${threadId}/messages`);
  const messages = await res.json();

  // Create markdown export
  const markdown = [
    `# ${thread.name}`,
    `Created: ${thread.createdAt.toISOString()}`,
    '',
    ...messages.map((m) => `**${m.role}**: ${m.content}`),
  ].join('\n');

  // Download
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${thread.name}.md`;
  a.click();
};
```

### Merge Threads

```typescript
const mergeThreads = async (sourceId: string, targetId: string) => {
  // Call backend to merge thread histories
  const res = await fetch(`/api/threads/${targetId}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceThreadId: sourceId }),
  });

  if (res.ok) {
    const updated = threads.filter((t) => t.id !== sourceId);
    setThreads(updated);
    localStorage.setItem('chatkit_threads', JSON.stringify(updated));
  }
};
```

## Error Handling

### Handle Thread Switching Errors

```typescript
const handleThreadSwitch = async (threadId: string) => {
  try {
    await setThreadId(threadId);
  } catch (error) {
    console.error('Failed to switch thread:', error);
    // Show error notification
    showNotification('Failed to load thread', 'error');
  }
};
```

### Handle Thread Creation Errors

```typescript
const handleNewThread = async () => {
  try {
    await setThreadId(null);
  } catch (error) {
    console.error('Failed to create new thread:', error);
    showNotification('Failed to create new conversation', 'error');
  }
};
```

## Performance Optimization

### Virtualize Long Thread Lists

```typescript
import { useVirtual } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualizedThreadList({ threads, onSelect }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtual({
    size: threads.length,
    parentRef,
    size: 40,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-y-auto">
      {virtualizer.virtualItems.map((virtualItem) => (
        <button
          key={threads[virtualItem.index].id}
          onClick={() => onSelect(threads[virtualItem.index].id)}
          style={{
            transform: `translateY(${virtualItem.start}px)`,
          }}
          className="w-full text-left p-3 hover:bg-gray-100"
        >
          {threads[virtualItem.index].name}
        </button>
      ))}
    </div>
  );
}
```

### Lazy Load Thread List

```typescript
const [threads, setThreads] = useState<StoredThread[]>([]);
const [isLoading, setIsLoading] = useState(false);

const loadMoreThreads = async () => {
  setIsLoading(true);
  try {
    const res = await fetch('/api/threads?limit=20&offset=' + threads.length);
    const newThreads = await res.json();
    setThreads([...threads, ...newThreads]);
  } catch (error) {
    console.error('Failed to load threads:', error);
  } finally {
    setIsLoading(false);
  }
};
```

