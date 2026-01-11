# ChatKit Styling and Responsive Design

## Overview

ChatKit styling combines theme configuration with CSS customization. Style the interface through:
- Theme configuration (colors, typography, radius)
- Tailwind CSS classes on the component
- CSS variables for runtime customization
- Custom CSS overrides

## CSS Architecture

### ChatKit CSS Variables

ChatKit exposes CSS variables for dynamic theming:

```css
:root {
  /* Colors */
  --chatkit-primary: #3b82f6;
  --chatkit-primary-dark: #1e40af;
  --chatkit-primary-light: #93c5fd;

  /* Backgrounds */
  --chatkit-bg-primary: #ffffff;
  --chatkit-bg-secondary: #f3f4f6;
  --chatkit-bg-tertiary: #e5e7eb;

  /* Text */
  --chatkit-text-primary: #1f2937;
  --chatkit-text-secondary: #6b7280;
  --chatkit-text-tertiary: #9ca3af;

  /* Borders */
  --chatkit-border-color: #e5e7eb;
  --chatkit-border-light: #f3f4f6;

  /* Spacing */
  --chatkit-spacing-xs: 4px;
  --chatkit-spacing-sm: 8px;
  --chatkit-spacing-md: 16px;
  --chatkit-spacing-lg: 24px;
  --chatkit-spacing-xl: 32px;

  /* Typography */
  --chatkit-font-family: 'Inter', system-ui, sans-serif;
  --chatkit-font-mono: 'JetBrains Mono', monospace;
  --chatkit-font-size-sm: 12px;
  --chatkit-font-size-base: 14px;
  --chatkit-font-size-lg: 16px;
  --chatkit-font-size-xl: 18px;

  /* Border radius */
  --chatkit-radius-sm: 4px;
  --chatkit-radius-md: 8px;
  --chatkit-radius-lg: 12px;
  --chatkit-radius-xl: 16px;

  /* Shadows */
  --chatkit-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --chatkit-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --chatkit-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Dark Mode Variables

```css
@media (prefers-color-scheme: dark) {
  :root {
    --chatkit-primary: #60a5fa;
    --chatkit-bg-primary: #1f2937;
    --chatkit-bg-secondary: #111827;
    --chatkit-bg-tertiary: #0f1419;
    --chatkit-text-primary: #f3f4f6;
    --chatkit-text-secondary: #d1d5db;
    --chatkit-text-tertiary: #9ca3af;
    --chatkit-border-color: #374151;
  }
}
```

## Component Styling

### Message Styling

```css
/* User messages */
.chatkit-message-user {
  background: var(--chatkit-primary);
  color: white;
  border-radius: var(--chatkit-radius-lg);
  padding: var(--chatkit-spacing-md);
  margin: var(--chatkit-spacing-sm) 0;
}

.chatkit-message-user-text {
  font-size: var(--chatkit-font-size-base);
  line-height: 1.5;
}

/* Assistant messages */
.chatkit-message-assistant {
  background: var(--chatkit-bg-secondary);
  color: var(--chatkit-text-primary);
  border-radius: var(--chatkit-radius-lg);
  padding: var(--chatkit-spacing-md);
  margin: var(--chatkit-spacing-sm) 0;
  border-left: 3px solid var(--chatkit-primary);
}

/* System messages */
.chatkit-message-system {
  background: var(--chatkit-bg-tertiary);
  color: var(--chatkit-text-secondary);
  border-radius: var(--chatkit-radius-md);
  padding: var(--chatkit-spacing-sm);
  font-size: var(--chatkit-font-size-sm);
  text-align: center;
}
```

### Message Code Blocks

```css
.chatkit-message code {
  background: var(--chatkit-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--chatkit-radius-sm);
  font-family: var(--chatkit-font-mono);
  font-size: var(--chatkit-font-size-sm);
}

.chatkit-message pre {
  background: var(--chatkit-bg-tertiary);
  padding: var(--chatkit-spacing-md);
  border-radius: var(--chatkit-radius-md);
  overflow-x: auto;
  margin: var(--chatkit-spacing-sm) 0;
}

.chatkit-message pre code {
  background: none;
  padding: 0;
}

/* Syntax highlighting */
.chatkit-message-code-keyword {
  color: #d946ef;
}

.chatkit-message-code-string {
  color: #16a34a;
}

.chatkit-message-code-number {
  color: #ea580c;
}

.chatkit-message-code-comment {
  color: #6b7280;
}
```

### Composer Styling

```css
.chatkit-composer {
  border-top: 1px solid var(--chatkit-border-color);
  background: var(--chatkit-bg-primary);
  padding: var(--chatkit-spacing-md);
  display: flex;
  gap: var(--chatkit-spacing-sm);
  align-items: flex-end;
}

.chatkit-composer-input {
  flex: 1;
  border: 1px solid var(--chatkit-border-color);
  border-radius: var(--chatkit-radius-md);
  padding: var(--chatkit-spacing-sm) var(--chatkit-spacing-md);
  font-family: var(--chatkit-font-family);
  font-size: var(--chatkit-font-size-base);
  resize: none;
  min-height: 40px;
  max-height: 120px;
}

.chatkit-composer-input:focus {
  outline: none;
  border-color: var(--chatkit-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chatkit-composer-button {
  background: var(--chatkit-primary);
  color: white;
  border: none;
  border-radius: var(--chatkit-radius-md);
  padding: var(--chatkit-spacing-sm) var(--chatkit-spacing-md);
  cursor: pointer;
  font-size: var(--chatkit-font-size-base);
  transition: background 0.2s;
}

.chatkit-composer-button:hover {
  background: var(--chatkit-primary-dark);
}

.chatkit-composer-button:active {
  transform: scale(0.95);
}
```

### Header Styling

```css
.chatkit-header {
  background: var(--chatkit-bg-primary);
  border-bottom: 1px solid var(--chatkit-border-color);
  padding: var(--chatkit-spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatkit-header-title {
  font-size: var(--chatkit-font-size-lg);
  font-weight: 600;
  color: var(--chatkit-text-primary);
}

.chatkit-header-action {
  background: transparent;
  border: none;
  padding: var(--chatkit-spacing-sm);
  cursor: pointer;
  color: var(--chatkit-text-secondary);
  border-radius: var(--chatkit-radius-md);
  transition: background 0.2s;
}

.chatkit-header-action:hover {
  background: var(--chatkit-bg-secondary);
}
```

## Responsive Design

### Mobile-First Breakpoints

```css
/* Mobile (< 640px) */
@media (max-width: 640px) {
  .chatkit-message {
    font-size: 13px;
    padding: 8px 12px;
  }

  .chatkit-composer {
    padding: 12px;
    flex-direction: column;
  }

  .chatkit-composer-input {
    min-height: 36px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .chatkit-header {
    padding: 12px;
  }

  .chatkit-header-title {
    font-size: 14px;
  }
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) and (max-width: 1024px) {
  .chatkit-message {
    font-size: 14px;
    padding: 10px 14px;
  }

  .chatkit-composer {
    padding: 14px;
  }

  .chatkit-composer-input {
    min-height: 38px;
    font-size: 14px;
  }
}

/* Desktop (> 1024px) */
@media (min-width: 1024px) {
  .chatkit-message {
    font-size: 16px;
    padding: 12px 16px;
  }

  .chatkit-composer {
    padding: 16px;
  }

  .chatkit-composer-input {
    min-height: 40px;
    font-size: 16px;
  }
}
```

### Responsive Component Layout

```css
/* Container queries */
@container (max-width: 500px) {
  .chatkit-message-list {
    padding: 8px;
    gap: 8px;
  }

  .chatkit-message {
    max-width: 100%;
  }
}

@container (min-width: 500px) {
  .chatkit-message-list {
    padding: 16px;
    gap: 12px;
  }

  .chatkit-message {
    max-width: 90%;
  }
}
```

## Advanced Styling Patterns

### Custom Theme Variants

```typescript
// Light theme
const lightTheme = {
  colorScheme: 'light',
  color: {
    accent: { primary: '#3b82f6' },
    surface: { background: '#ffffff', foreground: '#000000' },
  },
};

// Dark theme
const darkTheme = {
  colorScheme: 'dark',
  color: {
    accent: { primary: '#60a5fa' },
    surface: { background: '#0f172a', foreground: '#ffffff' },
  },
};

// High contrast
const highContrastTheme = {
  colorScheme: 'light',
  color: {
    accent: { primary: '#0000ff' },
    surface: { background: '#ffffff', foreground: '#000000' },
  },
};

export function ChatWithThemes() {
  const [theme, setTheme] = useState('light');

  const themes = {
    light: lightTheme,
    dark: darkTheme,
    highContrast: highContrastTheme,
  };

  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
    theme: themes[theme],
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex gap-2 p-4 bg-gray-100">
        {Object.keys(themes).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`px-4 py-2 rounded ${
              theme === t ? 'bg-blue-600 text-white' : 'bg-white'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <ChatKit control={control} className="flex-1" />
    </div>
  );
}
```

### Tailwind CSS Integration

```typescript
// Using Tailwind for layout and styling
<ChatKit
  control={control}
  className="h-screen w-full rounded-lg shadow-lg border border-gray-200"
/>

// With custom wrapper
<div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
  <div className="flex-1 shadow-lg rounded-b-lg overflow-hidden">
    <ChatKit control={control} className="h-full w-full" />
  </div>
</div>
```

### Framer Motion Animations

```typescript
import { motion } from 'framer-motion';

export function AnimatedChat() {
  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen w-full"
    >
      <ChatKit control={control} className="h-full w-full" />
    </motion.div>
  );
}
```

### CSS-in-JS Styling

```typescript
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ChatKitWrapper = styled.div`
  flex: 1;
  overflow: hidden;

  .chatkit-message-user {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    padding: 12px 16px;
  }

  .chatkit-message-assistant {
    background: rgba(255, 255, 255, 0.9);
    color: #1f2937;
    border-radius: 12px;
    padding: 12px 16px;
    border-left: 3px solid #667eea;
  }
`;

export function StyledChat() {
  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
  });

  return (
    <ChatContainer>
      <ChatKitWrapper>
        <ChatKit control={control} />
      </ChatKitWrapper>
    </ChatContainer>
  );
}
```

## Accessibility Styling

### Focus Indicators

```css
.chatkit-button:focus-visible,
.chatkit-input:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}
```

### High Contrast Mode

```css
@media (prefers-contrast: more) {
  :root {
    --chatkit-primary: #0000ff;
    --chatkit-text-primary: #000000;
    --chatkit-bg-primary: #ffffff;
    --chatkit-border-color: #000000;
  }

  .chatkit-message {
    border: 2px solid var(--chatkit-border-color);
  }

  .chatkit-button {
    border: 2px solid var(--chatkit-border-color);
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Large Text Support

```css
@media (prefers-reduced-motion: no-preference) {
  :root {
    --chatkit-font-size-sm: 14px;
    --chatkit-font-size-base: 16px;
    --chatkit-font-size-lg: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) and (max-width: 640px) {
  :root {
    --chatkit-font-size-base: 18px;
  }
}
```

## Performance Optimization

### CSS Performance

```css
/* Use CSS Grid for layout efficiency */
.chatkit-message-list {
  display: grid;
  grid-auto-flow: row;
  gap: var(--chatkit-spacing-sm);
  grid-template-columns: 1fr;
}

/* Will-change for animations */
.chatkit-message {
  will-change: opacity, transform;
}

/* Contain for rendering optimization */
.chatkit-message {
  contain: layout style paint;
}
```

### Font Loading Optimization

```css
/* Font display strategy */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Show fallback while loading */
}

/* Preload critical fonts */
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossOrigin
/>
```

## Dark Mode Implementation

### System Preference Detection

```css
/* Light mode (default) */
:root {
  --chatkit-bg-primary: #ffffff;
  --chatkit-text-primary: #1f2937;
}

/* Dark mode via media query */
@media (prefers-color-scheme: dark) {
  :root {
    --chatkit-bg-primary: #1f2937;
    --chatkit-text-primary: #f3f4f6;
  }
}

/* Dark mode via class */
.dark {
  --chatkit-bg-primary: #1f2937;
  --chatkit-text-primary: #f3f4f6;
}
```

### Manual Dark Mode Toggle

```typescript
export function ChatWithDarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const { control } = useChatKit({
    api: { getClientSecret: async () => { /* ... */ } },
    theme: {
      colorScheme: isDark ? 'dark' : 'light',
    },
  });

  return (
    <div>
      <button
        onClick={() => setIsDark(!isDark)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Toggle Dark Mode
      </button>
      <ChatKit control={control} className="h-screen" />
    </div>
  );
}
```

