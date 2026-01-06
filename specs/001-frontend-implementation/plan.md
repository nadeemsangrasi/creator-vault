# Implementation Plan: CreatorVault Frontend Implementation - Phase 2

**Branch**: `001-frontend-implementation` | **Date**: 2026-01-06
**Spec**: [spec.md](./spec.md) | **Input**: Frontend implementation with modern UI/UX landing page, authentication, ideas management, and end-to-end testing

---

## Summary

CreatorVault frontend will be built as a **modern web application** using Next.js 16 with React Server Components, TypeScript, and shadcn/ui. The implementation follows **priorized user stories** starting with a compelling landing page, then authentication, core idea management, and supporting features.

**Key technical approach:**
- Server-first architecture leveraging Next.js 16 App Router
- Better Auth for authentication with JWT integration to FastAPI backend
- shadcn/ui components with Tailwind CSS for consistent, accessible UI
- SWR for client-side data fetching with optimistic updates
- Playwright for end-to-end test coverage

---

## Technical Context

**Language/Version**: TypeScript 5.6+ with Next.js 16+ (React 19)
**Primary Dependencies**: React 19, Next.js 16, TypeScript 5.6, Tailwind CSS 3.4, shadcn/ui, Better Auth, Drizzle ORM, Framer Motion, SWR
**Storage**: Neon PostgreSQL (for Better Auth user data only) - FastAPI backend stores application data
**Testing**: Playwright for E2E, Jest + React Testing Library for unit/integration
**Target Platform**: Web (browser-based) with full mobile responsiveness
**Project Type**: Single web application (frontend only) - backend API is separate service
**Performance Goals**:
- LCP < 2.5s (Largest Contentful Paint)
- FID < 100ms (First Input Delay)
- CLS < 0.1 (Cumulative Layout Shift)
- API response time < 2s
- 100 concurrent users without degradation
- Search/filter results < 1s for up to 100 ideas
**Constraints**:
- Use serverless hosting on Vercel
- Support modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- No IE11 support
- Responsive design for mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Offline functionality not required in Phase 2
**Scale/Scope**:
- Support up to 1000+ ideas with pagination
- 80%+ test coverage target
- 95%+ E2E test pass rate
- Single-tenant architecture (user isolation)

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|--------|
| 1. Spec-Driven Development | ✅ PASS | Complete specification with user stories, requirements, success criteria |
| 2. Type Safety | ✅ PASS | TypeScript throughout with strict type checking |
| 3. Error Handling | ✅ PASS | Error boundaries, user-friendly messages, retry logic |
| 4. Security First | ✅ PASS | Better Auth with JWT, XSS protection, HTTPS only |
| 5. Documentation | ✅ PASS | FRONTEND_ARCHITECTURE.md complete, spec.md complete |
| 6. Testing | ⏳ PENDING | E2E tests planned, unit/integration tests to be written |
| 7. Code Quality | ✅ PASS | ESLint, Prettier, strict TypeScript |

**Overall**: 6/7 gates passed, 1 pending (testing to be completed during implementation)

---

## Phase 0: Outline & Research

**Note**: No research phase required - specification has complete technical context from FRONTEND_ARCHITECTURE.md and all requirements are clear.

**Unknowns Resolved**: None - all technical decisions documented in spec and architecture.

**Best Practices Identified**:
- Next.js 16 App Router with React Server Components for optimal performance
- Better Auth + Drizzle ORM for authentication (industry-standard, well-documented)
- shadcn/ui for accessible, customizable components (Tailwind-first)
- SWR for data fetching with automatic revalidation (simpler than React Query)
- Framer Motion for declarative animations with micro-interactions

---

## Phase 1: Design & Contracts

**Prerequisites**: ✅ None (research phase complete)

### Frontend Project Structure

```text
frontend/
├── app/                          # Next.js 16 App Router
│   ├── (public)/                 # Public routes
│   │   ├── layout.tsx            # Public layout (landing nav)
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── signin/
│   │   │   └── page.tsx      # Sign in page
│   │   └── signup/
│   │       └── page.tsx      # Sign up page
│   │
│   ├── (protected)/              # Protected routes (authenticated)
│   │   ├── layout.tsx            # Protected layout (app nav, sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Dashboard
│   │   ├── ideas/
│   │   │   ├── page.tsx      # Ideas list
│   │   │   ├── new/
│   │   │   │   └── page.tsx  # Create idea
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # View idea
│   │   │       └── edit/
│   │   │           └── page.tsx  # Edit idea
│   │   ├── profile/
│   │   │   └── page.tsx      # User profile
│   │   └── settings/
│   │       └── page.tsx      # User settings
│   │
│   ├── api/                      # API routes (Better Auth)
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts    # Better Auth handlers
│   │
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx              # Client providers (SWR, theme)
│   ├── globals.css                # Global styles
│   └── error.tsx                 # Global error boundary
│
├── components/                   # React components
│   ├── ui/                        # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── toast.tsx (sonner)
│   │   ├── label.tsx
│   │   └── select.tsx
│   │
│   ├── layout/                    # Layout components
│   │   ├── header.tsx              # App header
│   │   ├── footer.tsx              # App footer
│   │   ├── sidebar.tsx            # Sidebar navigation
│   │   ├── main-nav.tsx            # Main nav
│   │   ├── landing-nav.tsx        # Landing page nav
│   │   └── user-menu.tsx          # User menu dropdown
│   │
│   ├── auth/                      # Auth components
│   │   ├── signin-form.tsx         # Sign in form
│   │   ├── signup-form.tsx         # Sign up form
│   │   ├── oauth-buttons.tsx         # OAuth buttons
│   │   └── user-menu.tsx           # User menu
│   │
│   ├── ideas/                     # Idea components
│   │   ├── idea-card.tsx           # Idea display card
│   │   ├── idea-form.tsx           # Create/edit form
│   │   ├── idea-filters.tsx        # Filters (stage, tags, priority)
│   │   ├── idea-search.tsx         # Search input
│   │   ├── stage-badge.tsx         # Stage badge component
│   │   ├── priority-badge.tsx       # Priority badge component
│   │   ├── empty-state.tsx         # Empty state display
│   │   └── delete-dialog.tsx        # Delete confirmation
│   │
│   ├── dashboard/                  # Dashboard components
│   │   ├── stats-card.tsx           # Statistics cards
│   │   ├── recent-ideas.tsx         # Recent ideas widget
│   │   ├── stage-chart.tsx          # Stage distribution chart
│   │   └── quick-actions.tsx         # Quick action buttons
│   │
│   └── shared/                     # Shared components
│       ├── loading.tsx              # Loading skeletons
│       ├── error-state.tsx          # Error display
│       ├── pagination.tsx           # Pagination controls
│       └── empty-state.tsx         # Generic empty state
│
├── lib/                          # Utilities and configuration
│   ├── api/                       # API client
│   │   ├── client.ts               # HTTP client with JWT injection
│   │   ├── ideas.ts                # Ideas API methods
│   │   ├── users.ts                # Users API methods
│   │   └── types.ts                # TypeScript types
│   │
│   ├── auth/                       # Better Auth
│   │   ├── auth.ts                 # Auth configuration (server)
│   │   ├── auth-client.ts          # Auth client hooks
│   │   └── middleware.ts            # Auth middleware
│   │
│   ├── db/                         # Drizzle ORM (auth DB)
│   │   ├── index.ts                # DB connection
│   │   └── schema.ts               # Auth schema
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-ideas.ts            # Ideas data fetching
│   │   ├── use-auth.ts             # Auth state hook
│   │   ├── use-debounce.ts          # Debounce utility
│   │   └── use-media-query.ts      # Media query hook
│   │
│   ├── utils/                      # Utility functions
│   │   ├── cn.ts                   # Class name merger (clsx + tailwind-merge)
│   │   ├── format.ts               # Date/string formatting
│   │   └── constants.ts            # App constants
│   │
│   └── validation/                 # Zod schemas
│       ├── idea.ts                 # Idea validation schema
│       └── user.ts                 # User validation schema
│
├── actions/                     # Server Actions
│   ├── ideas.ts                   # Idea mutations
│   ├── profile.ts                 # Profile mutations
│   └── auth.ts                    # Auth mutations
│
├── types/                       # Global TypeScript types
│   └── index.ts                 # Shared type definitions
│
├── styles/                      # Additional styles
│   └── animations.css           # Framer Motion presets
│
├── public/                      # Static assets
│   ├── images/                   # Images (SVG, PNG, WebP)
│   ├── fonts/                    # Fonts
│   └── favicon.ico               # Favicon
│
├── .env.local                   # Local environment variables
├── .env.example                 # Environment variable template
├── next.config.js               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── components.json               # shadcn/ui configuration
├── package.json                 # Dependencies
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── playwright.config.ts         # E2E test configuration
└── README.md                   # Documentation
```

**Structure Decision**: Next.js 16 App Router with route groups `(public)` and `(protected)` using nested layouts. This allows:
- Public routes without auth checks
- Protected routes with automatic auth redirect
- Clean separation of concerns
- Route-based code splitting

---

### Data Model

**Frontend Types** (from spec.md):

```typescript
// types/index.ts
export type IdeaStage = 'idea' | 'outline' | 'draft' | 'published'
export type IdeaPriority = 'high' | 'medium' | 'low'

export interface Idea {
  id: number
  user_id: string
  title: string
  notes: string | null
  stage: IdeaStage
  tags: string[]
  priority: IdeaPriority
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface IdeaCreate {
  title: string
  notes?: string
  stage?: IdeaStage
  tags?: string[]
  priority?: IdeaPriority
  due_date?: string
}

export interface IdeaUpdate extends Partial<IdeaCreate> {}

export interface IdeaFilters {
  stage?: IdeaStage
  tags?: string[]
  priority?: IdeaPriority
  search?: string
}

export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}
```

**Frontend Decision**: Types mirror backend schemas from BACKEND_ARCHITECTURE.md. Frontend does not define database schema - uses backend API as source of truth. Better Auth manages its own user data in separate Neon PostgreSQL instance.

---

### API Contracts

**Frontend → Backend API Integration** (from spec.md):

**Base URL**: `process.env.NEXT_PUBLIC_API_URL` (configurable, defaults to FastAPI backend)

**JWT Authentication**: Bearer token from Better Auth session injected in `Authorization` header

**Endpoint Mappings** (from FR-036 through FR-057):

| Frontend Action | Backend Endpoint | Method | Purpose |
|----------------|------------------|--------|---------|
| `getIdeas()` | `/api/v1/{user_id}/ideas` | GET | List ideas with filters |
| `createIdea()` | `/api/v1/{user_id}/ideas` | POST | Create new idea |
| `getIdea()` | `/api/v1/{user_id}/ideas/{id}` | GET | Get idea details |
| `updateIdea()` | `/api/v1/{user_id}/ideas/{id}` | PATCH | Partial update |
| `updateIdeaFull()` | `/api/v1/{user_id}/ideas/{id}` | PUT | Full update |
| `deleteIdea()` | `/api/v1/{user_id}/ideas/{id}` | DELETE | Delete idea |
| `getUser()` | `/api/v1/users/me` | GET | Get current user |
| `updateUser()` | `/api/v1/users/me` | PATCH | Update user profile |

**API Client Implementation**:

```typescript
// lib/api/client.ts
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const session = await auth.api.getSession()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(session?.token && { 'Authorization': `Bearer ${session.token}` })
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.json())
  }

  return response.json()
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any
  ) {
    super(`API Error: ${status}`)
    this.status = status
    this.data = data
  }
}
```

**API Decision**: RESTful API with JWT Bearer authentication. Using fetch API (native to Next.js) with SWR for data fetching. Optimistic updates with automatic rollback on error.

---

### Quick Start Guide

```typescript
// specs/001-frontend-implementation/quickstart.md

// Development Setup
1. Install dependencies:
   npm install

2. Set up environment variables:
   cp .env.example .env.local
   # Edit .env.local with:
   # - NEXT_PUBLIC_API_URL=http://localhost:8000
   # - BETTER_AUTH_SECRET=your-secret-key
   # - DATABASE_URL=postgresql://user:pass@localhost:5432/creatorvault_auth

3. Run dev server:
   npm run dev

4. Access application:
   - Landing page: http://localhost:3000
   - Dashboard (after auth): http://localhost:3000/dashboard

// Initial Better Auth Setup
1. Initialize Drizzle ORM:
   npm install drizzle-orm @neondatabase/serverless drizzle-kit
   npx drizzle-kit generate

2. Configure Better Auth:
   npm install better-auth
   # Create lib/auth/auth.ts with configuration

3. Create auth database schema:
   npx drizzle-kit push neon

4. Test authentication:
   - Visit http://localhost:3000/signup
   - Create account
   - Verify redirect to dashboard
```

**Quick Start Decision**: Step-by-step guide from environment setup to first authenticated user session. Covers Better Auth initialization, environment configuration, and local development workflow.

---

### Agent Context Update

**Note**: Skipping agent context update step as we are in manual planning mode. The `/sp.plan` skill handles this when run normally via the command.

---

## Phase 2: Design & Contracts - COMPLETE

**Status**: ✅ COMPLETE

**Deliverables**:
- ✅ Frontend project structure documented
- ✅ Data model types defined
- ✅ API contract mappings created
- ✅ Quick start guide written
- ✅ Technical context complete

**Next**: Proceed to Phase 2 tasks in plan file below.

---

## Phase 2: Task Decomposition

### Implementation Phases

**Phase 2.1: Foundation Setup** (Priority: P1, Estimated: 2-3 hours)

1. Initialize Next.js 16 project
   - Create project structure
   - Install core dependencies
   - Configure TypeScript
   - Set up Tailwind CSS
   - Install and configure shadcn/ui
   - Create initial layout files

2. Better Auth Configuration
   - Install Better Auth dependencies
   - Set up Drizzle ORM for auth database
   - Configure auth instance (lib/auth/auth.ts)
   - Create API routes for auth
   - Configure middleware for protected routes

3. Environment Configuration
   - Create .env.example template
   - Configure next.config.js for production
   - Set up TypeScript strict mode
   - Configure ESLint and Prettier

**Acceptance**: Dev server runs successfully with Better Auth configured.

---

**Phase 2.2: Landing Page** (Priority: P1, Estimated: 4-6 hours)

1. Hero Section
   - Create hero component with kinetic typography
   - Implement Framer Motion animations
   - Add call-to-action buttons
   - Responsive layout (mobile/tablet/desktop)

2. Features Section
   - Create feature cards with icons
   - Implement scroll animations
   - Add micro-interactions on hover

3. How It Works Section
   - Create scrollytelling with progressive reveals
   - Implement scroll-triggered animations
   - Add step-by-step content

4. Landing Page Integration
   - Assemble landing page from components
   - Add smooth scroll navigation
   - Implement responsive navigation bar

**Skills**: `/landing-page-design-2026` (kinetic typography, scrollytelling, anticipatory UX)

**Acceptance**: Landing page renders at root URL with all sections, animations, and responsiveness.

---

**Phase 2.3: Authentication Flow** (Priority: P1, Estimated: 6-8 hours)

1. Sign Up Page
   - Create signup form with validation
   - Implement email/password registration
   - Add OAuth buttons (Google, GitHub)
   - Real-time form validation with Zod
   - Error handling and display

2. Sign In Page
   - Create signin form
   - Implement email/password authentication
   - Add OAuth provider buttons
   - Remember me functionality
   - Error messages

3. Protected Route Middleware
   - Create middleware.ts
   - Implement JWT token verification
   - Configure auth redirects
   - Protect (protected) route groups

4. User Menu and Sign Out
   - Create user menu dropdown
   - Display user name/avatar
   - Implement sign out functionality
   - Clear auth state on signout

**Skills**: `/better-auth-nextjs` (authentication setup, Drizzle ORM, OAuth integration)

**Acceptance**: Users can sign up (email/password + OAuth), sign in, and sign out with proper redirects.

---

**Phase 2.4: Ideas List & CRUD** (Priority: P1, Estimated: 8-12 hours)

1. Ideas List Page
   - Create ideas list component
   - Implement idea cards with all attributes
   - Add stage and priority badges
   - Display tags and timestamps
   - Empty state handling

2. Create Idea Flow
   - Create idea form component
   - Form validation with React Hook Form + Zod
   - Real-time validation feedback
   - Create API integration
   - Optimistic UI updates
   - Error handling with retry

3. Edit Idea Flow
   - Create edit idea page
   - Pre-fill form with existing data
   - Implement form submission
   - Handle concurrent edit conflicts

4. Delete Idea Flow
   - Add delete confirmation dialog
   - Implement delete action
   - Optimistic removal with rollback
   - Confirmation on success/failure

5. Idea Detail Page
   - Create idea detail view
   - Display all idea information
   - Link to edit functionality
   - Show creation/update history

**Skills**: `/nextjs16` (App Router, Server Components), `/styling-with-shadcn` (UI components)

**Acceptance**: Users can create, read, update, and delete ideas with validation, optimistic updates, and proper error handling.

---

**Phase 2.5: Filtering & Search** (Priority: P2, Estimated: 4-6 hours)

1. Filter Components
   - Create stage filter dropdown
   - Create priority filter dropdown
   - Implement multi-select tag filter
   - Add clear filters button

2. Search Component
   - Create search input with debounce
   - Implement search logic
   - Highlight search matches

3. URL State Management
   - Persist filters in URL searchParams
   - Handle browser back/forward
   - Shareable filter URLs

4. Integration with Ideas List
   - Apply filters to data fetching
   - Update displayed results
   - Show active filters

**Skills**: `/nextjs16` (URL state management with searchParams)

**Acceptance**: Users can filter by stage, tags, priority, and search by title/notes with URL state persistence.

---

**Phase 2.6: Dashboard** (Priority: P2, Estimated: 4-6 hours)

1. Dashboard Layout
   - Create dashboard page structure
   - Add quick actions section
   - Responsive layout

2. Statistics Cards
   - Create stats card component
   - Display total ideas
   - Show ideas by stage (idea, outline, draft, published)
   - Visual indicators (charts or progress bars)

3. Recent Ideas Widget
   - Display 5 most recently updated ideas
   - Link to idea detail
   - Show timestamps

4. Empty State
   - Handle no ideas scenario
   - Show CTA to create first idea
   - Link to create idea page

**Skills**: `/styling-with-shadcn` (stats cards, data visualization)

**Acceptance**: Dashboard displays accurate statistics, recent ideas, and empty state with actionable CTAs.

---

**Phase 2.7: Responsive Design** (Priority: P2, Estimated: 6-8 hours)

1. Mobile Layout (< 768px)
   - Hamburger menu for navigation
   - Stacked form layouts
   - Full-width content
   - Touch-friendly interactions

2. Tablet Layout (768-1024px)
   - 2-column idea grids
   - Collapsible sidebar
   - Responsive cards

3. Desktop Layout (> 1024px)
   - 3-column idea grids
   - Fixed sidebar
   - Hover states

4. Typography & Spacing
   - Responsive font sizes
   - Adaptive spacing
   - Touch targets for mobile

**Skills**: `/styling-with-shadcn` (responsive Tailwind utilities), `/modern-ui-ux-theming` (design tokens)

**Acceptance**: Application works seamlessly on mobile, tablet, and desktop with proper breakpoints and touch interactions.

---

**Phase 2.8: API Integration** (Priority: P1, Estimated: 4-6 hours)

1. HTTP Client
   - Create reusable API client
   - Implement JWT token injection
   - Add request/response interceptors
   - Error handling (401, 403, 404, 500)

2. SWR Configuration
   - Set up SWR data fetching
   - Configure revalidation strategy
   - Implement optimistic updates
   - Add loading and error states

3. Ideas API Client
   - Implement all ideas API methods
   - Type-safe request/response handling
   - Data transformation

4. User API Client
   - Implement user profile API methods
   - Session management integration

5. Error Handling
   - Toast notifications for all API errors
   - User-friendly error messages
   - Retry logic for 500 errors
   - Session expiry handling

**Skills**: `/frontend-backend-jwt-verification` (JWT token management, secure API communication)

**Acceptance**: All data operations persist to backend with proper error handling, JWT authentication, and optimistic updates.

---

**Phase 2.9: E2E Testing** (Priority: P3, Estimated: 6-8 hours)

1. Test Setup
   - Install and configure Playwright
   - Create test directory structure
   - Configure test environment variables

2. Authentication Tests
   - Sign up flow (email, Google, GitHub)
   - Sign in flow
   - Sign out flow
   - Protected route redirect tests

3. Ideas CRUD Tests
   - Create idea test
   - Read idea test
   - Update idea test
   - Delete idea test
   - Form validation tests

4. Filtering Tests
   - Stage filter test
   - Tag filter test
   - Priority filter test
   - Search functionality test

5. Cross-browser Tests
   - Run tests on Chrome, Firefox, Safari
   - Mobile responsive tests
   - Accessibility tests

**Skills**: `/systematic-debugging` (test strategy), `/nextjs-dev-tool` (debugging)

**Acceptance**: E2E tests cover 80%+ of critical user journeys with 95%+ pass rate.

---

## Phase 3: Implementation Execution

**Note**: This phase is executed during implementation by following task breakdown. See `/sp.tasks` for detailed task list.

**Execution Order**:
1. Complete Phase 2.1 (Foundation Setup) ✅
2. Complete Phase 2.2 (Landing Page) ✅
3. Complete Phase 2.3 (Authentication Flow) ✅
4. Complete Phase 2.4 (Ideas List & CRUD) ✅
5. Complete Phase 2.5 (Filtering & Search) ✅
6. Complete Phase 2.6 (Dashboard) ✅
7. Complete Phase 2.7 (Responsive Design) ✅
8. Complete Phase 2.8 (API Integration) ✅
9. Complete Phase 2.9 (E2E Testing) ✅

**Verification**: Each phase completed with acceptance criteria met before proceeding to next.

---

## Complexity Tracking

| Component | Complexity | Risk Mitigation |
|-----------|------------|------------------|
| Landing Page Animations | Medium | Use Framer Motion (well-documented) - limit to hero section only |
| Authentication (OAuth) | Medium | Better Auth handles complexity - focus on integration and error handling |
| State Management (SWR) | Low | Standard pattern with proven stability |
| Form Validation (Zod) | Low | Declarative, well-tested library |
| Responsive Design | Medium | Use Tailwind breakpoints and test on multiple devices early |
| E2E Testing | Low | Playwright well-documented - start with critical paths only |
| API Integration | Low | Fetch API + SWR = proven pattern |

**Overall**: Medium complexity with appropriate risk mitigation. No architectural risks identified.

---

## Success Metrics

**Phase Completion Criteria**:

| Phase | Metric | Target | Verification |
|-------|--------|---------|--------------|
| 2.1 Foundation Setup | Dev server runs | ✅ Manual verification |
| 2.2 Landing Page | LCP < 2.5s, FID < 100ms | ✅ Lighthouse testing |
| 2.3 Authentication | Sign up/sign in < 2min | ✅ Manual testing |
| 2.4 Ideas CRUD | CRUD ops work < 2s | ✅ Manual testing |
| 2.5 Filtering | Filter results < 1s | ✅ Manual testing |
| 2.6 Dashboard | Dashboard loads < 2s | ✅ Manual testing |
| 2.7 Responsive | Mobile usability 90%+ | ✅ Device testing |
| 2.8 API Integration | 99.9%+ API success | ✅ Monitoring |
| 2.9 E2E Testing | 80%+ coverage, 95%+ pass rate | ✅ Test execution |

**Overall Quality Gates**:
- ✅ Gate 1-7: Pass during implementation
- ⏳ Gate 8 (Testing): Complete during implementation - target 80%+ coverage

---

## Implementation Checklist

### Foundation Setup (Phase 2.1)
- [ ] Create Next.js 16 project with `npx create-next-app@latest`
- [ ] Install and configure TypeScript with strict mode
- [ ] Install and configure Tailwind CSS 3.4
- [ ] Install and initialize shadcn/ui
- [ ] Create project directory structure (app/, components/, lib/, etc.)
- [ ] Install Better Auth dependencies
- [ ] Set up Drizzle ORM for auth database
- [ ] Configure Better Auth instance
- [ ] Create auth API routes
- [ ] Set up middleware for protected routes
- [ ] Create .env.example template
- [ ] Configure next.config.js (images, domains, headers)
- [ ] Configure ESLint and Prettier
- [ ] Set up TypeScript strict mode in tsconfig.json
- [ ] Verify dev server runs successfully

### Landing Page (Phase 2.2)
- [ ] Create hero section component
- [ ] Implement kinetic typography with Framer Motion
- [ ] Add features section with cards
- [ ] Implement scroll animations
- [ ] Create "How It Works" section
- [ ] Implement scrollytelling with progressive reveals
- [ ] Add call-to-action buttons to hero and sections
- [ ] Implement responsive navigation bar
- [ ] Test on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [ ] Run Lighthouse audit (target: LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Authentication Flow (Phase 2.3)
- [ ] Create signup page component
- [ ] Implement signup form with email/password
- [ ] Add OAuth buttons (Google, GitHub)
- [ ] Implement real-time form validation with Zod
- [ ] Add error handling and display
- [ ] Create signin page component
- [ ] Implement email/password authentication
- [ ] Add "Remember me" functionality
- [ ] Create user menu dropdown component
- [ ] Implement sign out functionality
- [ ] Create middleware.ts for protected routes
- [ ] Implement JWT token verification
- [ ] Configure auth redirects (unauthenticated → signin, authenticated → dashboard)
- [ ] Test complete auth flow (signup → dashboard, sign in → dashboard, sign out → landing)

### Ideas List & CRUD (Phase 2.4)
- [ ] Create ideas list page component
- [ ] Create idea card component
- [ ] Implement stage badges (idea: blue, outline: yellow, draft: orange, published: green)
- [ ] Implement priority badges (high: red, medium: yellow, low: gray)
- [ ] Display tags and timestamps
- [ ] Create create idea form component
- [ ] Implement form validation with React Hook Form + Zod
- [ ] Create edit idea page component
- [ ] Pre-fill edit form with existing data
- [ ] Implement delete confirmation dialog
- [ ] Create idea detail page component
- [ ] Implement API client with JWT injection
- [ ] Create SWR data fetching hooks
- [ ] Implement optimistic updates
- [ ] Add loading skeletons
- [ ] Implement error handling with retry
- [ ] Test all CRUD operations manually

### Filtering & Search (Phase 2.5)
- [ ] Create stage filter dropdown component
- [ ] Create priority filter dropdown component
- [ ] Implement multi-select tag filter
- [ ] Add clear filters button
- [ ] Create search input component
- [ ] Implement debounce for search (useDebounce hook)
- [ ] Implement search logic (title + notes, case-insensitive)
- [ ] Persist filters in URL searchParams
- [ ] Test browser back/forward navigation
- [ ] Test shareable filter URLs
- [ ] Apply filters to data fetching (SWR)

### Dashboard (Phase 2.6)
- [ ] Create dashboard page component
- [ ] Create stats card component
- [ ] Display total ideas count
- [ ] Show ideas by stage counts
- [ ] Create recent ideas widget
- [ ] Display 5 most recently updated ideas
- [ ] Link to idea detail pages
- [ ] Create empty state for no ideas
- [ ] Add "Create Your First Idea" CTA
- [ ] Test dashboard accuracy with mock data

### Responsive Design (Phase 2.7)
- [ ] Define Tailwind breakpoints (mobile: < 768px, tablet: 768-1024px, desktop: > 1024px)
- [ ] Create mobile hamburger menu component
- [ ] Implement sidebar for desktop/tablet
- [ ] Stack form layouts on mobile
- [ ] Responsive idea card grids (1-col mobile, 2-col tablet, 3-col desktop)
- [ ] Test on physical mobile device
- [ ] Test on iPad/tablet
- [ ] Test on desktop
- [ ] Verify touch targets meet mobile standards (44x44px minimum)

### API Integration (Phase 2.8)
- [ ] Create reusable HTTP client function
- [ ] Implement JWT token injection from Better Auth session
- [ ] Create request/response interceptors
- [ ] Implement error handling for all status codes (401, 403, 404, 500)
- [ ] Configure SWR for client-side data fetching
- [ ] Implement automatic revalidation strategy
- [ ] Create Ideas API client with type-safe methods
- [ ] Create User API client with profile methods
- [ ] Implement toast notifications for success/error
- [ ] Add user-friendly error messages
- [ ] Implement retry logic for 500 errors
- [ ] Handle session expiry and redirect to signin
- [ ] Test API integration with FastAPI backend

### E2E Testing (Phase 2.9)
- [ ] Install and configure Playwright
- [ ] Create test directory structure
- [ ] Configure test environment variables
- [ ] Write signup flow tests (email, Google, GitHub)
- [ ] Write signin flow test
- [ ] Write sign out flow test
- [ ] Write protected route redirect tests
- [ ] Write ideas CRUD tests (create, read, update, delete)
- [ ] Write filtering tests (stage, tags, priority, search)
- [ ] Configure cross-browser testing (Chrome, Firefox, Safari)
- [ ] Add mobile responsive tests
- [ ] Add accessibility tests (keyboard navigation, screen readers)
- [ ] Configure test reporting (HTML report, JSON report)
- [ ] Run tests and verify 80%+ coverage
- [ ] Verify 95%+ pass rate
- [ ] Set up CI/CD for automated tests (optional)

### Quality Gates Verification
- [ ] ESLint passes without errors
- [ ] TypeScript compilation succeeds with strict mode
- [ ] All components accessible (keyboard navigation, ARIA labels)
- [ ] All forms have proper validation
- [ ] Error handling covers all edge cases
- [ ] Loading states display for all async operations
- [ ] Empty states display for no data scenarios
- [ ] Responsive design works on all breakpoints
- [ ] API integration tested with backend
- [ ] Core Web Vitals targets met (LCP, FID, CLS)

---

## Notes

**Manual Plan Creation**: Due to SpecKit validation requiring one spec directory per numeric prefix (we have both `001-backend-api` and `001-frontend-implementation`), this plan file was created manually following the plan template structure to proceed with frontend implementation.

**Next Steps**:
1. Review this plan and approve
2. Run `/sp.tasks` to generate detailed task breakdown
3. Begin implementation with skill-guided workflows
4. Update checklist as tasks are completed

---

**Ready for Implementation**: All phases defined with clear acceptance criteria and skill activation guidance.
