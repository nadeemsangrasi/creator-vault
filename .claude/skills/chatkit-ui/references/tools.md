# ChatKit Tool Integration

## Overview

ChatKit tools enable custom actions within the chat interface. Tools appear as buttons in the composer and can trigger application-specific functionality, from file uploads to API calls to AI model interactions.

## Tool Concepts

### What is a Tool?

A tool is a user-triggered action that can:
- Attach files or data to messages
- Execute custom logic before/after messages
- Integrate with external services
- Provide contextual actions within chat

### Tool Types

```
Pinned Tools (always visible)
    ↓
User interactions (click or keyboard)
    ↓
Tool handler executes
    ↓
Optional: add attachment or send message
    ↓
UI updates with result
```

## Basic Tool Setup

### Simple Tool Definition

```typescript
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function ChatWithTools() {
  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    composer: {
      tools: [
        {
          id: 'attach-file',
          label: 'Attach File',
          icon: 'paperclip',
          pinned: true,  // Always visible
        },
        {
          id: 'code-snippet',
          label: 'Add Code',
          icon: 'code',
          pinned: true,
        },
        {
          id: 'search',
          label: 'Search Web',
          icon: 'search',
          pinned: false,
        },
      ],
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

## Tool Handlers

### Handling Tool Clicks

```typescript
const { control, sendUserMessage } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  composer: {
    tools: [
      { id: 'file-upload', label: 'Upload', icon: 'upload', pinned: true },
      { id: 'screenshot', label: 'Screenshot', icon: 'camera' },
    ],
  },
  onToolClick: async ({ toolId, messageText }) => {
    switch (toolId) {
      case 'file-upload':
        // Handle file upload
        const file = await showFileDialog();
        if (file) {
          await sendUserMessage({
            text: `I'm uploading a file: ${file.name}`,
            attachments: [{
              type: 'file',
              name: file.name,
              data: await file.arrayBuffer(),
            }],
          });
        }
        break;

      case 'screenshot':
        // Capture screenshot
        const canvas = await html2canvas(document.body);
        const blob = await new Promise(resolve =>
          canvas.toBlob(resolve, 'image/png')
        );
        await sendUserMessage({
          text: 'Here is my screen:',
          attachments: [{
            type: 'image',
            name: 'screenshot.png',
            data: blob,
          }],
        });
        break;
    }
  },
});
```

## Common Tool Patterns

### File Upload Tool

```typescript
const handleFileUpload = async () => {
  // Create hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.txt,.doc,.docx,.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const { fileId, fileName } = await res.json();

      // Send message with file attachment
      await sendUserMessage({
        text: `I've uploaded: ${fileName}. Please analyze this file.`,
        attachments: [{
          type: 'file',
          id: fileId,
          name: fileName,
        }],
      });
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Failed to upload file', 'error');
    }
  };

  input.click();
};

// Add to tools
{
  id: 'upload-file',
  label: 'Upload File',
  icon: 'upload',
  pinned: true,
  onClick: handleFileUpload,
}
```

### Code Block Tool

```typescript
const handleAddCode = async () => {
  const code = prompt('Paste your code:');
  if (!code) return;

  const language = prompt('Programming language:', 'javascript');

  await sendUserMessage({
    text: `Here's my ${language} code:`,
    attachments: [{
      type: 'code',
      language: language || 'javascript',
      content: code,
    }],
  });
};

// Add to tools
{
  id: 'add-code',
  label: 'Add Code',
  icon: 'code',
  pinned: true,
  onClick: handleAddCode,
}
```

### Image Capture Tool

```typescript
import html2canvas from 'html2canvas';

const handleCaptureScreen = async () => {
  try {
    const canvas = await html2canvas(document.body, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, 'image/png')
    );

    const file = new File([blob], 'screenshot.png', { type: 'image/png' });

    await sendUserMessage({
      text: 'I captured this screenshot:',
      attachments: [{
        type: 'image',
        name: 'screenshot.png',
        data: file,
      }],
    });
  } catch (error) {
    console.error('Screenshot failed:', error);
    showNotification('Failed to capture screenshot', 'error');
  }
};

// Add to tools
{
  id: 'screenshot',
  label: 'Screenshot',
  icon: 'camera',
  onClick: handleCaptureScreen,
}
```

### Web Search Tool

```typescript
const handleWebSearch = async () => {
  const query = prompt('What would you like me to search for?');
  if (!query) return;

  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 5 }),
    });

    const results = await res.json();

    const searchSummary = results
      .map((r: any) => `- [${r.title}](${r.url}): ${r.snippet}`)
      .join('\n');

    await sendUserMessage({
      text: `Please find information about: ${query}\n\nHere are the search results:\n${searchSummary}`,
    });
  } catch (error) {
    console.error('Search failed:', error);
    showNotification('Failed to search', 'error');
  }
};

// Add to tools
{
  id: 'web-search',
  label: 'Search Web',
  icon: 'search',
  onClick: handleWebSearch,
}
```

### Data Analysis Tool

```typescript
const handleAnalyzeData = async () => {
  const csvData = prompt('Paste your CSV data:');
  if (!csvData) return;

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: csvData, type: 'csv' }),
    });

    const { analysis } = await res.json();

    await sendUserMessage({
      text: `Here's my data for analysis:\n\`\`\`csv\n${csvData}\n\`\`\`\n\nPlease analyze this data and provide insights.`,
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    showNotification('Failed to analyze data', 'error');
  }
};

// Add to tools
{
  id: 'analyze-data',
  label: 'Analyze',
  icon: 'chart',
  onClick: handleAnalyzeData,
}
```

## Advanced Tool Integration

### Tool with Backend Processing

```typescript
interface ToolContext {
  toolId: string;
  timestamp: Date;
  userId: string;
}

const handleToolClick = async (toolId: string) => {
  const context: ToolContext = {
    toolId,
    timestamp: new Date(),
    userId: await getUserId(),
  };

  try {
    // Log tool usage
    await fetch('/api/analytics/tool-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    });

    // Execute tool-specific logic
    switch (toolId) {
      case 'database-query':
        const query = prompt('Enter SQL query:');
        if (query) {
          const res = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });
          const results = await res.json();
          // Send results to chat
        }
        break;

      case 'api-call':
        const endpoint = prompt('Enter API endpoint:');
        if (endpoint) {
          const res = await fetch(endpoint);
          const data = await res.json();
          // Send results to chat
        }
        break;
    }
  } catch (error) {
    console.error('Tool execution failed:', error);
  }
};
```

### Tool with Loading State

```typescript
const [loadingToolId, setLoadingToolId] = useState<string | null>(null);

const handleToolClick = async (toolId: string) => {
  setLoadingToolId(toolId);

  try {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    await sendUserMessage({
      text: `Executed tool: ${toolId}`,
    });
  } catch (error) {
    showNotification('Tool execution failed', 'error');
  } finally {
    setLoadingToolId(null);
  }
};

// In render
{tools.map((tool) => (
  <button
    key={tool.id}
    disabled={loadingToolId === tool.id}
    className={loadingToolId === tool.id ? 'opacity-50' : ''}
  >
    {loadingToolId === tool.id ? 'Loading...' : tool.label}
  </button>
))}
```

### Tool with Confirmation Dialog

```typescript
const handleToolClick = async (toolId: string) => {
  const confirmMessage = {
    'delete-all': 'This will delete all messages. Continue?',
    'export-chat': 'Export chat to file?',
    'reset-session': 'Reset conversation? All history will be lost.',
  }[toolId];

  if (confirmMessage) {
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
  }

  // Proceed with tool execution
  await executeToolLogic(toolId);
};
```

## Tool Organization Patterns

### Tool Categories

```typescript
const composer = {
  tools: [
    // Quick actions (always visible)
    { id: 'attach-file', label: 'Attach', icon: 'paperclip', pinned: true },
    { id: 'add-code', label: 'Code', icon: 'code', pinned: true },

    // AI actions
    { id: 'summarize', label: 'Summarize', icon: 'list' },
    { id: 'translate', label: 'Translate', icon: 'globe' },

    // Data tools
    { id: 'analyze', label: 'Analyze', icon: 'chart' },
    { id: 'visualize', label: 'Visualize', icon: 'chart-bar' },

    // Integration tools
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'query-db', label: 'Query', icon: 'database' },
  ],
};
```

### Conditional Tools Based on User Role

```typescript
const getUserTools = (userRole: string) => {
  const baseTools = [
    { id: 'attach-file', label: 'Attach', icon: 'paperclip', pinned: true },
  ];

  const roleTools = {
    admin: [
      { id: 'query-db', label: 'Query DB', icon: 'database' },
      { id: 'system-info', label: 'System Info', icon: 'settings' },
    ],
    analyst: [
      { id: 'analyze', label: 'Analyze', icon: 'chart' },
      { id: 'export', label: 'Export', icon: 'download' },
    ],
    user: [
      { id: 'summarize', label: 'Summarize', icon: 'list' },
    ],
  };

  return [...baseTools, ...(roleTools[userRole] || [])];
};

const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  composer: {
    tools: getUserTools(userRole),
  },
});
```

### Dynamic Tool Management

```typescript
const [availableTools, setAvailableTools] = useState([
  { id: 'attach-file', label: 'Attach', icon: 'paperclip', pinned: true },
]);

const enableTool = (toolId: string) => {
  const tool = allTools.find((t) => t.id === toolId);
  if (tool && !availableTools.find((t) => t.id === toolId)) {
    setAvailableTools([...availableTools, tool]);
  }
};

const disableTool = (toolId: string) => {
  setAvailableTools(availableTools.filter((t) => t.id !== toolId));
};

const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  composer: { tools: availableTools },
});
```

## Error Handling

### Graceful Tool Failures

```typescript
const handleToolClick = async (toolId: string) => {
  try {
    // Tool execution
    const result = await executeToolLogic(toolId);

    if (!result.success) {
      showNotification(`Tool failed: ${result.error}`, 'error');
      return;
    }

    // Send result to chat
    await sendUserMessage({
      text: result.message,
    });
  } catch (error) {
    console.error('Tool execution error:', error);
    showNotification(
      error instanceof Error
        ? error.message
        : 'Tool execution failed',
      'error'
    );
  }
};
```

### Tool Retry Logic

```typescript
const executeToolWithRetry = async (
  toolId: string,
  maxRetries: number = 3
) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await executeToolLogic(toolId);
    } catch (error) {
      console.warn(`Tool attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
};
```

## Performance Optimization

### Tool Loading

```typescript
const lazyLoadTools = async () => {
  // Load tools only when needed
  const tools = await Promise.all([
    import('./tools/file-upload'),
    import('./tools/code-snippet'),
    import('./tools/web-search'),
  ]);

  return tools.flatMap((t) => t.default);
};

const { control } = useChatKit({
  api: { getClientSecret: async () => { /* ... */ } },
  composer: {
    tools: await lazyLoadTools(),
  },
});
```

### Tool Caching

```typescript
const toolCache = new Map<string, any>();

const getCachedToolResult = async (toolId: string) => {
  if (toolCache.has(toolId)) {
    return toolCache.get(toolId);
  }

  const result = await executeToolLogic(toolId);
  toolCache.set(toolId, result);

  // Clear cache after 5 minutes
  setTimeout(() => toolCache.delete(toolId), 5 * 60 * 1000);

  return result;
};
```

