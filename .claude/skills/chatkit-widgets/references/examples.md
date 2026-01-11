# ChatKit Widgets - Complete Examples

## Example 1: Minimal Widget (Basic Chat)

The simplest possible ChatKit widget - just a chat interface with no header or custom styling.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MinimalChatWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        if (!res.ok) throw new Error('Session failed');
        return (await res.json()).client_secret;
      },
    },
  });

  return (
    <ChatKit control={control} className="h-96 w-full rounded-lg shadow" />
  );
}
```

**Use for:** Sidebar widgets, inline chat, embedded contexts
**Features:** Chat + Composer only, no header

---

## Example 2: Themed Widget (Dark Mode)

Widget with custom dark theme and brand colors.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function ThemedDarkWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    theme: {
      colorScheme: 'dark',
      color: {
        accent: { primary: '#D7263D', level: 2 },
        grayscale: { hue: 220, tint: 5 },
        surface: { background: '#1f2937', foreground: '#f3f4f6' },
      },
      typography: {
        baseSize: 16,
        fontFamily: 'Open Sans, sans-serif',
        fontFamilyMono: 'JetBrains Mono, monospace',
      },
      radius: 'round',
      density: 'normal',
    },
  });

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <ChatKit control={control} className="h-96 w-full" />
    </div>
  );
}
```

**Use for:** Branded applications, premium UX
**Features:** Dark theme, custom colors, typography

---

## Example 3: Widget with Header and Actions

Full widget with title, header buttons, and custom actions.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export function WidgetWithHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    header: {
      enabled: true,
      title: {
        enabled: true,
        text: 'AI Support Assistant',
      },
      leftAction: {
        icon: isSidebarOpen ? 'sidebar-open-left' : 'sidebar-left',
        onClick: () => setIsSidebarOpen(!isSidebarOpen),
        label: 'Toggle Menu',
      },
      rightAction: {
        icon: 'settings-cog',
        onClick: () => console.log('Settings clicked'),
        label: 'Settings',
      },
    },
  });

  return (
    <div className="flex h-screen">
      {isSidebarOpen && (
        <aside className="w-64 bg-gray-100 border-r p-4">
          <h3 className="font-bold mb-4">Menu</h3>
          <ul className="space-y-2">
            <li className="hover:bg-gray-200 p-2 rounded cursor-pointer">
              Profile
            </li>
            <li className="hover:bg-gray-200 p-2 rounded cursor-pointer">
              History
            </li>
            <li className="hover:bg-gray-200 p-2 rounded cursor-pointer">
              Settings
            </li>
          </ul>
        </aside>
      )}
      <main className="flex-1">
        <ChatKit control={control} className="h-full w-full" />
      </main>
    </div>
  );
}
```

**Use for:** Full-page chat applications, support interfaces
**Features:** Header title, left/right actions, sidebar integration

---

## Example 4: Widget with Composer Tools

Widget with custom tools and buttons in the composer.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function WidgetWithTools() {
  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    composer: {
      placeholder: 'Ask me anything about your data...',
      tools: [
        {
          id: 'attach-file',
          label: 'Attach',
          icon: 'paperclip',
          pinned: true,
        },
        {
          id: 'code-snippet',
          label: 'Code',
          icon: 'code',
          pinned: true,
        },
        {
          id: 'web-search',
          label: 'Search',
          icon: 'search',
        },
      ],
    },
  });

  const handleToolClick = async (toolId: string) => {
    switch (toolId) {
      case 'attach-file':
        // Open file picker
        await sendUserMessage({
          text: 'I have attached a file. Please analyze it.',
        });
        break;
      case 'code-snippet':
        // Show code input modal
        await sendUserMessage({
          text: 'Here is my code for review',
        });
        break;
      case 'web-search':
        // Trigger web search
        await sendUserMessage({
          text: 'Search for recent information about...',
        });
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Data Analysis Chat</h1>
      </header>
      <ChatKit control={control} className="flex-1" />
    </div>
  );
}
```

**Use for:** Data analysis, code review, content creation
**Features:** Custom tools, pinned actions, tool handlers

---

## Example 5: Widget with Start Screen

Widget with greeting message and quick action prompts.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function WidgetWithStartScreen() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    theme: {
      colorScheme: 'light',
      color: {
        accent: { primary: '#3b82f6' },
        surface: { background: '#ffffff', foreground: '#1f2937' },
      },
    },
    startScreen: {
      greeting: 'Welcome to our Support Center!',
      prompts: [
        {
          label: 'Billing',
          prompt: 'I have questions about billing',
          icon: 'credit-card',
        },
        {
          label: 'Technical',
          prompt: 'I need technical support',
          icon: 'wrench',
        },
        {
          label: 'Feature',
          prompt: 'Request a feature',
          icon: 'lightbulb',
        },
        {
          label: 'Bug',
          prompt: 'Report a bug',
          icon: 'alert',
        },
      ],
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl h-96 shadow-xl rounded-lg overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </div>
    </div>
  );
}
```

**Use for:** Support pages, landing page chat, help centers
**Features:** Custom greeting, quick action prompts

---

## Example 6: Full-Featured Production Widget

Complete widget with all features: header, theme, tools, start screen, and event handlers.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

export function ProductionWidget() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error'>(
    'connected'
  );

  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret() {
        try {
          const res = await fetch('/api/chatkit/session', { method: 'POST' });
          if (!res.ok) throw new Error('Session failed');
          setConnectionStatus('connected');
          return (await res.json()).client_secret;
        } catch (error) {
          setConnectionStatus('error');
          throw error;
        }
      },
    },
    theme: {
      colorScheme: 'light',
      color: {
        accent: { primary: '#3b82f6' },
        surface: { background: '#ffffff', foreground: '#1f2937' },
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        baseSize: 16,
      },
      radius: 'round',
      density: 'normal',
    },
    header: {
      enabled: true,
      title: {
        enabled: true,
        text: 'Customer Support',
      },
      rightAction: {
        icon: 'help-circle',
        onClick: () => console.log('Help requested'),
        label: 'Help',
      },
    },
    composer: {
      placeholder: 'Describe your issue...',
      tools: [
        { id: 'attach', label: 'Attach', icon: 'paperclip', pinned: true },
        { id: 'screenshot', label: 'Screenshot', icon: 'camera' },
      ],
    },
    startScreen: {
      greeting: 'How can we help you today?',
      prompts: [
        { label: 'Billing', prompt: 'Billing question', icon: 'credit-card' },
        { label: 'Technical', prompt: 'Technical issue', icon: 'wrench' },
        { label: 'Feature', prompt: 'Feature request', icon: 'lightbulb' },
      ],
    },
    onMessageSent: ({ message }) => {
      console.log('Message sent:', message.text);
      // Log to analytics
      fetch('/api/analytics/message-sent', {
        method: 'POST',
        body: JSON.stringify({ message: message.text }),
      }).catch(console.error);
    },
    onThreadChange: ({ threadId }) => {
      console.log('Thread changed:', threadId);
      localStorage.setItem('lastThread', threadId || '');
    },
    onError: ({ error }) => {
      console.error('Chat error:', error);
      setConnectionStatus('error');
    },
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="px-4 py-2 bg-blue-50 border-b text-sm">
        Status: {connectionStatus === 'connected' ? (
          <span className="text-green-600">✓ Connected</span>
        ) : (
          <span className="text-red-600">✗ Error</span>
        )}
      </div>

      {/* Chat Widget */}
      <div className="flex-1 overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-white text-xs text-gray-600">
        Typical response time: 2-3 minutes
      </div>
    </div>
  );
}
```

**Use for:** Production customer support, mission-critical chats
**Features:** Error handling, analytics, status indicators, complete customization

---

## Example 7: Responsive Widget (Mobile-Friendly)

Widget that adapts to different screen sizes.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function ResponsiveWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    theme: {
      colorScheme: 'light',
      color: { accent: { primary: '#3b82f6' } },
    },
    header: {
      enabled: true,
      title: { enabled: true, text: 'Chat' },
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* Mobile: Full width, Tablet: w-96, Desktop: w-96 max-width */}
      <div className="w-full h-screen sm:h-96 sm:w-96 md:w-96 lg:w-96 max-w-2xl shadow-lg rounded-none sm:rounded-lg overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </div>
    </div>
  );
}
```

**Use for:** Multi-device applications, web and mobile
**Features:** Responsive breakpoints, mobile-optimized

---

## Example 8: Multi-Widget Page

Multiple chat widgets on the same page for different purposes.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

function SupportWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session?type=support', {
          method: 'POST',
        });
        return (await res.json()).client_secret;
      },
    },
    startScreen: {
      greeting: 'Support',
      prompts: [{ label: 'Help', prompt: 'I need help', icon: 'help' }],
    },
  });

  return <ChatKit control={control} className="h-96 w-full" />;
}

function SalesWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session?type=sales', {
          method: 'POST',
        });
        return (await res.json()).client_secret;
      },
    },
    startScreen: {
      greeting: 'Sales',
      prompts: [{ label: 'Price', prompt: 'Pricing information', icon: 'tag' }],
    },
  });

  return <ChatKit control={control} className="h-96 w-full" />;
}

export function MultiWidgetPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="border rounded-lg overflow-hidden">
        <h2 className="p-4 bg-blue-50 font-bold">Support Chat</h2>
        <SupportWidget />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <h2 className="p-4 bg-green-50 font-bold">Sales Chat</h2>
        <SalesWidget />
      </div>
    </div>
  );
}
```

**Use for:** Multi-purpose pages, multiple departments
**Features:** Multiple widgets, independent state

---

## Example 9: Custom Styled Widget (CSS)

Widget with custom CSS classes and styling.

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import './custom-widget.css';

export function CustomStyledWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    theme: {
      colorScheme: 'dark',
      color: {
        accent: { primary: '#D7263D' },
        surface: { background: '#1a1a1a', foreground: '#ffffff' },
      },
    },
  });

  return (
    <div className="custom-widget-container">
      <div className="custom-widget-wrapper">
        <ChatKit control={control} className="custom-widget" />
      </div>
    </div>
  );
}
```

```css
/* custom-widget.css */
.custom-widget-container {
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.custom-widget-wrapper {
  border-radius: 12px;
  overflow: hidden;
}

.custom-widget {
  height: 600px;
  width: 400px;
  border-radius: 12px;
}

/* Custom message styling */
.chatkit-message-user {
  background: linear-gradient(135deg, #D7263D 0%, #a01830 100%);
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
}

.chatkit-message-assistant {
  background: #2d2d2d;
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  border-left: 3px solid #D7263D;
}

/* Custom composer styling */
.chatkit-composer {
  border-top: 1px solid #3d3d3d;
  background: #1a1a1a;
  padding: 16px;
}

.chatkit-composer-input {
  background: #2d2d2d;
  color: #ffffff;
  border: 1px solid #3d3d3d;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
}

.chatkit-composer-input:focus {
  border-color: #D7263D;
  box-shadow: 0 0 0 3px rgba(215, 38, 61, 0.1);
}
```

**Use for:** Brand-specific styling, design systems
**Features:** Custom CSS, gradient effects, custom colors

