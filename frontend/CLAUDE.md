# CreatorVault Frontend: Claude Code Rules

You are an expert AI assistant specializing in Next.js 16 frontend development for the CreatorVault project. Your primary focus is building the privacy-first content idea manager's user interface.

## Project Overview

CreatorVault is a full-stack web application for content ideation and management. The frontend provides a modern, responsive interface that integrates seamlessly with the backend with plans for AI integration.

**Core Features:**

- Next.js 16 (App Router, TypeScript, Tailwind CSS, shadcn/ui)
- Modern 2026-style landing page with anticipatory UX
- Privacy-first architecture with encrypted content storage
- Full CRUD operations for content ideas
- Responsive, accessible UI with Framer Motion micro-interactions
- Integration with FastAPI backend via API endpoints
- Better Auth authentication system with JWT verification
- Plans for AI-powered content suggestions and analysis

**Technology Stack:**

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animation**: Framer Motion micro-interactions
- **Authentication**: Better Auth integration
- **Design**: 2026-style anticipatory UX with kinetic typography

### AI-Powered Features

**Future AI Integration:** AI-powered features for enhanced content ideation and management will be implemented in upcoming phases.

**Planned AI Features:**

- AI-powered content suggestion interface
- Natural Language Processing for idea refinement
- AI-generated content summaries and insights
- Enhanced search with semantic understanding
- Voice input capabilities for idea capture

**Chatbot Frontend Architecture:**

- **Chat Interface**: React components with response handling
- **State Management**: Zustand/Pinia for conversation state
- **UI Components**: shadcn/ui chat interface components
- **Message History**: Local storage for conversation persistence
- **Error Handling**: Graceful fallbacks for API failures
- **Accessibility**: WCAG-compliant chat interface

**AI Integration Skills:**

- `/chatkit-ui` - Build high-quality AI-powered chat interfaces with OpenAI ChatKit
- `/chatkit-widgets` - Build embeddable ChatKit chat widgets with customizable themes
- `/streaming-llm-responses` - Implement real-time LLM streaming responses from backend
- `/openai-agent-sdk` - Integrate with AI agents and custom models
- `/chatkit-custom-backend` - Adapt ChatKit UI to work with custom backend servers

## Project Overview

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animation**: Framer Motion micro-interactions
- **Authentication**: Better Auth integration
- **Design**: 2026-style anticipatory UX with kinetic typography

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Git for version control

### Setup

```bash
cd frontend
npm install
```

### Running

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code quality check
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/       # Protected routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── ideas/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/page.tsx
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities and API clients
│   ├── auth.ts           # Authentication helpers
│   ├── api.ts            # API client
│   └── utils.ts          # General utilities
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── package.json          # Dependencies and scripts
```

## Development Workflow

### Before Starting

1. Pull latest: `git pull origin main`
2. Install dependencies: `npm install`
3. Verify environment: `npm run dev` starts without errors

### During Development

1. Create feature branch: `git checkout -b feature/name`
2. Write tests first (TDD where applicable)
3. Implement feature following patterns below
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Test responsiveness on multiple devices
7. Verify accessibility standards

### Before Committing

- [ ] All tests pass
- [ ] No lint errors
- [ ] No console.logs in production code
- [ ] Updated relevant documentation
- [ ] Tested on multiple screen sizes
- [ ] Accessibility audit passed

## Critical Patterns

### Component Development

- Always use shadcn/ui as the base, customize via Tailwind only
- Follow component co-location: `app/[feature]/components/[Component].tsx`
- Include TypeScript interfaces for all props
- Add proper accessibility attributes (aria-label, role, etc.)
- Implement Framer Motion animations for micro-interactions (not gratuitous)

**Reference `/styling-with-shadcn` skill for proper shadcn/ui implementation patterns.**

### Page Architecture

- Use Server Components by default, Client Components only when needed
- Implement proper loading states with Suspense boundaries
- Handle error states with error.tsx boundaries
- Include proper metadata for SEO

**Reference `/nextjs16` skill for proper Next.js 16 App Router patterns.**

### Form Handling

- Use React Hook Form for client-side form management
- Validate with Zod schemas
- Implement optimistic UI updates where appropriate
- Show loading states during submission
- Display validation errors clearly

### Authentication Integration

- Use `/better-auth-nextjs` skill for setup and implementation patterns
- Implement JWT verification using `/frontend-backend-jwt-verification` skill
- Store auth token in httpOnly cookie (Better Auth handles this)
- Implement middleware for protected routes
- Add logout flows with proper cleanup

## Testing

### Test Structure

- Unit tests: Component behavior and logic
- Integration tests: Page-level flows
- E2E tests: Critical user journeys (login, CRUD)

```bash
npm test -- --watch              # Run tests with watcher
npm test -- --coverage           # Coverage report
npm run test:e2e                 # E2E tests
```

### Testing Guidelines

- Test all user interactions
- Verify form validation
- Test error states
- Check loading states
- Validate responsive behavior

## Performance

### Optimization Strategies

- Image optimization: Use Next.js Image component with proper dimensions
- Code splitting: Dynamic imports for heavy components
- Memoization: useMemo/useCallback for expensive computations
- Bundle analysis: Monitor with `@next/bundle-analyzer`
- Font optimization: Use next/font for system/custom fonts

### Performance Targets

- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Bundle size < 250KB JS
- Page load time < 3s on 3G

## Security

### Security Requirements

- Never store auth tokens in localStorage (use httpOnly cookies via Better Auth)
- Validate all user inputs on the frontend AND backend
- Sanitize all user-generated content
- Use HTTPS for all API communications
- Implement proper CSRF protection (Better Auth handles this)

## Common Issues

### Performance Issues

- **Slow bundle loading**: Use dynamic imports and code splitting
- **Memory leaks**: Clean up effects and subscriptions properly
- **Excessive re-renders**: Use React.memo and useCallback appropriately

### Authentication Issues

- **Token expiration**: Implement proper refresh token handling
- **Session management**: Clear all user data on logout
- **Redirect loops**: Verify middleware configuration

## Relevant Skills

- `/nextjs16` - Next.js 16 App Router patterns and best practices
- `/styling-with-shadcn` - shadcn/ui component implementation
- `/better-auth-nextjs` - Authentication implementation patterns
- `/frontend-backend-jwt-verification` - JWT token verification
- `/modern-ui-ux-theming` - Theming and design system patterns
- `/landing-page-design-2026` - Modern 2026 design patterns

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Framer Motion Guides](https://www.framer.com/motion/)
