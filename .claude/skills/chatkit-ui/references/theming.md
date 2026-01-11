# ChatKit Theming and Customization

## Theme Configuration

### Basic Theme

```typescript
const { control } = useChatKit({
  theme: {
    colorScheme: 'light', // or 'dark'
  },
});
```

### Complete Theme Example

```typescript
const { control } = useChatKit({
  theme: {
    // Color scheme: 'light' or 'dark'
    colorScheme: 'dark',

    // Typography
    typography: {
      baseSize: 16,                           // Base font size
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
      fontSources: [
        {
          family: 'Inter',
          src: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700',
          weight: '400 700',
          display: 'swap',
        },
      ],
    },

    // Border radius: 'round', 'soft', or 'square'
    radius: 'round',

    // Spacing density: 'compact', 'normal', or 'spacious'
    density: 'normal',

    // Colors
    color: {
      accent: {
        primary: '#3b82f6',     // Main brand color
        level: 2,              // Saturation level
      },
      grayscale: {
        hue: 220,             // Base hue for grays
        tint: 5,              // Tint amount
        shade: 0,             // Shade amount
      },
      surface: {
        background: '#ffffff',
        foreground: '#000000',
      },
    },
  },
});
```

## Color Customization

### Brand Colors

```typescript
theme: {
  color: {
    // Primary brand color
    accent: {
      primary: '#D7263D',    // Red brand
      level: 2,
    },
  },
}
```

### Dark Mode Colors

```typescript
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

theme: {
  colorScheme: isDark ? 'dark' : 'light',
  color: {
    accent: {
      primary: isDark ? '#60a5fa' : '#3b82f6',
    },
    surface: isDark
      ? { background: '#1f2937', foreground: '#f3f4f6' }
      : { background: '#ffffff', foreground: '#1f2937' },
  },
}
```

### Custom Palette

```typescript
// Blue palette
theme: {
  color: {
    accent: { primary: '#0066cc', level: 2 },
  },
}

// Green palette
theme: {
  color: {
    accent: { primary: '#22c55e', level: 2 },
  },
}

// Purple palette
theme: {
  color: {
    accent: { primary: '#9333ea', level: 2 },
  },
}
```

## Typography

### Font Configuration

```typescript
theme: {
  typography: {
    baseSize: 16,
    fontFamily: 'Georgia, serif',
    fontFamilyMono: 'Courier New, monospace',
  },
}
```

### Custom Google Fonts

```typescript
theme: {
  typography: {
    fontFamily: 'Poppins, sans-serif',
    fontFamilyMono: 'Roboto Mono, monospace',
    fontSources: [
      {
        family: 'Poppins',
        src: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700',
        weight: '400 700',
        display: 'swap',
      },
      {
        family: 'Roboto Mono',
        src: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500',
        weight: '400 500',
        display: 'swap',
      },
    ],
  },
}
```

## UI Component Customization

### Composer Customization

```typescript
const { control } = useChatKit({
  composer: {
    placeholder: 'Ask anything about your data...',

    // Tools in composer
    tools: [
      {
        id: 'attach-file',
        label: 'Attach',
        icon: 'paperclip',
        pinned: true,    // Always visible
      },
      {
        id: 'code-block',
        label: 'Code',
        icon: 'code',
      },
    ],

    // Attachments configuration
    attachments: {
      enabled: true,
      maxFiles: 5,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'application/pdf',
        'image/*',
        'text/*',
      ],
    },
  },
});
```

### Start Screen Customization

```typescript
const { control } = useChatKit({
  startScreen: {
    greeting: 'Welcome to our AI Assistant! 👋',

    prompts: [
      {
        label: 'Explain concepts',
        prompt: 'Explain quantum computing in simple terms',
        icon: 'lightbulb',
      },
      {
        label: 'Write code',
        prompt: 'Write a React component for a todo list',
        icon: 'code',
      },
      {
        label: 'Analyze data',
        prompt: 'Analyze this dataset and find insights',
        icon: 'chart',
      },
      {
        label: 'Plan projects',
        prompt: 'Help me plan my next project',
        icon: 'target',
      },
    ],
  },
});
```

### Header Customization

```typescript
const { control } = useChatKit({
  header: {
    // Left action button
    leftAction: {
      icon: 'menu',
      label: 'Menu',
      onClick: () => openMenu(),
    },

    // Right action button
    rightAction: {
      icon: 'settings-cog',
      label: 'Settings',
      onClick: () => openSettings(),
    },

    // Hide header
    // hidden: true,
  },
});
```

## CSS Styling

### Override with Tailwind

```tsx
<ChatKit
  control={control}
  className="h-[600px] w-[400px] rounded-lg shadow-lg"
/>
```

### CSS Variables

```css
:root {
  --chatkit-accent-color: #3b82f6;
  --chatkit-bg-primary: #ffffff;
  --chatkit-text-primary: #1f2937;
  --chatkit-border-color: #e5e7eb;
}

.chatkit-message {
  background: var(--chatkit-bg-primary);
  color: var(--chatkit-text-primary);
  border: 1px solid var(--chatkit-border-color);
}
```

### Custom Classes

```css
/* Message styling */
.chatkit-message-user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.chatkit-message-assistant {
  background: #f3f4f6;
  color: #1f2937;
  border-radius: 12px;
}

/* Composer styling */
.chatkit-composer {
  border-top: 2px solid #e5e7eb;
  padding: 16px;
  background: #ffffff;
}

.chatkit-composer input {
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
}

/* Message list */
.chatkit-message-list {
  padding: 16px;
  gap: 12px;
}
```

## Responsive Theming

### Mobile vs Desktop

```typescript
const isMobile = window.innerWidth < 768;

theme: {
  density: isMobile ? 'compact' : 'normal',
  typography: {
    baseSize: isMobile ? 14 : 16,
  },
  radius: isMobile ? 'soft' : 'round',
}
```

### Media Query Breakpoints

```css
/* Mobile (< 640px) */
@media (max-width: 640px) {
  .chatkit-message {
    font-size: 14px;
    padding: 8px;
  }
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) and (max-width: 1024px) {
  .chatkit-message {
    font-size: 15px;
    padding: 10px;
  }
}

/* Desktop (> 1024px) */
@media (min-width: 1024px) {
  .chatkit-message {
    font-size: 16px;
    padding: 12px;
  }
}
```

## Pre-built Themes

### Corporate Theme

```typescript
const corporateTheme = {
  colorScheme: 'light',
  typography: {
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
    baseSize: 15,
  },
  radius: 'soft',
  color: {
    accent: { primary: '#0052cc' },
    surface: { background: '#ffffff', foreground: '#0e1117' },
  },
};
```

### Modern Dark Theme

```typescript
const darkModernTheme = {
  colorScheme: 'dark',
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontFamilyMono: 'JetBrains Mono, monospace',
    baseSize: 16,
  },
  radius: 'round',
  color: {
    accent: { primary: '#00d9ff' },
    grayscale: { hue: 220, tint: 10, shade: 0 },
    surface: { background: '#0d1117', foreground: '#c9d1d9' },
  },
};
```

### Minimal Theme

```typescript
const minimalTheme = {
  colorScheme: 'light',
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    baseSize: 16,
  },
  radius: 'square',
  density: 'compact',
  color: {
    accent: { primary: '#000000' },
    surface: { background: '#ffffff', foreground: '#000000' },
  },
};
```

### Warm Theme

```typescript
const warmTheme = {
  colorScheme: 'light',
  typography: {
    fontFamily: 'Georgia, serif',
    baseSize: 17,
  },
  radius: 'soft',
  color: {
    accent: { primary: '#d97706' },
    surface: { background: '#fffbf0', foreground: '#78350f' },
  },
};
```

## Accessibility

### High Contrast

```typescript
theme: {
  color: {
    accent: { primary: '#0000ee' },
    surface: {
      background: '#ffffff',
      foreground: '#000000',
    },
  },
}
```

### Large Text

```typescript
theme: {
  typography: {
    baseSize: 20,  // 25% larger
  },
}
```

### Clear Focus Indicators

```css
.chatkit-button:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

.chatkit-input:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

## Dynamic Theming

### Runtime Theme Changes

```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('light');

const { control } = useChatKit({
  theme: {
    colorScheme: theme,
  },
});

const toggleTheme = () => {
  setTheme(theme === 'light' ? 'dark' : 'light');
};
```

### System Preference Detection

```typescript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    setIsDark(e.matches);
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}, []);

const { control } = useChatKit({
  theme: {
    colorScheme: isDark ? 'dark' : 'light',
  },
});
```

## Troubleshooting

### Theme Not Applying

```typescript
// Ensure theme is passed to useChatKit
const { control } = useChatKit({
  theme: { colorScheme: 'dark' },  // ✅ Correct
});

// Not in ChatKit component
<ChatKit control={control} />  // ❌ Won't work
```

### Tailwind Conflicts

```typescript
// Use ChatKit's shadow/space utilities
<ChatKit control={control} className="shadow-lg" />

// Or use inline styles
<ChatKit control={control} style={{ boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
```

### Font Loading Delays

```typescript
// Use font-display: swap to avoid invisible text
fontSources: [
  {
    family: 'Inter',
    src: 'https://fonts.googleapis.com/css2?family=Inter',
    display: 'swap',  // ✅ Shows fallback while loading
  },
]
```
