# CreatorVault Frontend Architecture - Phase 2

**Version:** 1.0.0
**Date:** 2026-01-06
**Phase:** Phase 2 - Full-Stack Web Application
**Status:** Design Document - Ready for Implementation

---

## Executive Summary

This document defines the complete frontend architecture for CreatorVault Phase 2, a privacy-first content idea manager built with Next.js 16, TypeScript, and shadcn/ui. The architecture is designed to support authenticated multi-user interactions, modern 2026 design principles with anticipatory UX, and seamless integration with the FastAPI backend.

**Key Architectural Decisions:**
- Next.js 16 App Router with Server Components and Server Actions
- Better Auth for authentication with JWT token management
- shadcn/ui component library with Tailwind CSS for consistent design
- TypeScript for type safety across the application
- Framer Motion for micro-interactions and animations
- Modern 2026 design: anticipatory UX, kinetic typography, scrollytelling

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [Routing & Navigation](#routing--navigation)
5. [Authentication Flow](#authentication-flow)
6. [State Management](#state-management)
7. [Project Structure](#project-structure)
8. [Component Architecture](#component-architecture)
9. [API Integration](#api-integration)
10. [Design System](#design-system)
11. [Error Handling](#error-handling)
12. [Performance & Optimization](#performance--optimization)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Architecture](#deployment-architecture)
15. [Phase 3 Preparation](#phase-3-preparation)
16. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Web Browser     │         │  Mobile Browser  │             │
│  │  (Desktop)       │         │  (iOS/Android)   │             │
│  └─────────┬────────┘         └─────────┬────────┘             │
└────────────┼──────────────────────────────┼────────────────────┘
             │                              │
             └────────────┬─────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js 16 App Router (React Server Components)         │  │
│  │  - Landing Page (Public)                                 │  │
│  │  - Authentication Pages (Public)                         │  │
│  │  - Dashboard (Protected)                                 │  │
│  │  - Ideas Management (Protected)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Better Auth (Drizzle ORM + PostgreSQL/Neon)            │  │
│  │  - Email/Password Authentication                         │  │
│  │  - OAuth Providers (Google, GitHub)                      │  │
│  │  - JWT Token Generation (RS256)                          │  │
│  │  - Session Management                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API INTEGRATION LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HTTP Client (fetch API / axios)                         │  │
│  │  - JWT Token Injection (Authorization: Bearer)           │  │
│  │  - Request Interceptors                                  │  │
│  │  - Response Error Handling                               │  │
│  │  - Type-safe API calls (TypeScript)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API (JSON)
                          │ Bearer Token
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI Backend (Port 8000)                             │  │
│  │  - Ideas CRUD Operations                                 │  │
│  │  - User Profile Management                               │  │
│  │  - JWT Verification                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Server-First Architecture:** Leverage React Server Components for optimal performance
2. **Progressive Enhancement:** Core functionality works without JavaScript
3. **Type Safety:** TypeScript throughout with strict type checking
4. **Component Composition:** Atomic design with reusable components
5. **Anticipatory UX:** Predict user intent and pre-fetch data
6. **Accessibility First:** WCAG 2.1 AA compliance with semantic HTML
7. **Privacy-First:** Client-side encryption for sensitive content (Phase 3)

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Framework** | Next.js | 16+ | App Router, RSC, Server Actions, built-in optimization |
| **Runtime** | Node.js | 20+ | LTS version with native fetch support |
| **Language** | TypeScript | 5.6+ | Type safety, enhanced DX, reduced runtime errors |
| **UI Library** | React | 19+ | Latest with concurrent features |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, responsive, highly customizable |
| **Component Library** | shadcn/ui | Latest | Accessible, customizable, TypeScript-first |
| **Animation** | Framer Motion | 11+ | Declarative animations, gesture support |
| **Authentication** | Better Auth | 1.0+ | Modern auth with JWT, OAuth, session management |
| **ORM (Auth DB)** | Drizzle ORM | 0.36+ | Type-safe, lightweight, PostgreSQL compatible |
| **Database (Auth)** | Neon PostgreSQL | 16+ | Serverless PostgreSQL for auth data |
| **Form Management** | React Hook Form | 7.53+ | Performant, flexible, validation support |
| **Validation** | Zod | 3.23+ | TypeScript-first schema validation |
| **HTTP Client** | Fetch API / SWR | Native / 2.2+ | Native fetch with SWR for data fetching |
| **Date Management** | date-fns | 4.1+ | Lightweight, tree-shakeable, i18n support |
| **Icons** | Lucide React | 0.460+ | Beautiful, consistent icon set |
| **Package Manager** | npm/pnpm | Latest | Fast, efficient dependency management |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | JavaScript/TypeScript linting |
| **Prettier** | Code formatting |
| **TypeScript Compiler** | Type checking |
| **Playwright** | E2E testing |
| **Jest** | Unit testing |
| **React Testing Library** | Component testing |
| **Storybook** | Component documentation |

---

## System Components

### 1. Pages Layer (`/app/`)

**Responsibility:** Route definition, layout composition, server-side data fetching

**Components:**
- `(public)/` - Public routes (landing, auth)
  - `page.tsx` - Landing page with 2026 design
  - `signin/page.tsx` - Sign in page
  - `signup/page.tsx` - Sign up page
- `(protected)/` - Authenticated routes
  - `dashboard/page.tsx` - User dashboard
  - `ideas/page.tsx` - Ideas list view
  - `ideas/[id]/page.tsx` - Idea detail view
  - `profile/page.tsx` - User profile settings

**Key Features:**
- Server Components for initial page load
- Automatic code splitting per route
- Nested layouts for consistent UI
- Dynamic routes with type-safe params

### 2. Components Layer (`/components/`)

**Responsibility:** Reusable UI components, composition patterns

**Organization:**
```
components/
├── ui/              # shadcn/ui primitives (button, input, card, etc.)
├── layout/          # Layout components (header, footer, sidebar)
├── auth/            # Authentication components (login form, signup form)
├── ideas/           # Idea-specific components (idea card, idea form, filters)
├── dashboard/       # Dashboard widgets and visualizations
└── shared/          # Shared utilities (loading, error, empty states)
```

**Key Features:**
- Atomic design pattern (atoms, molecules, organisms)
- TypeScript interfaces for all props
- Accessibility attributes (ARIA labels, roles)
- Consistent styling via Tailwind variants

### 3. Lib Layer (`/lib/`)

**Responsibility:** Business logic, utilities, API clients, configuration

**Components:**
- `api/` - Backend API client and type definitions
  - `client.ts` - HTTP client with interceptors
  - `ideas.ts` - Ideas API methods
  - `users.ts` - User API methods
  - `types.ts` - Shared TypeScript types
- `auth/` - Better Auth configuration
  - `auth.ts` - Auth instance and config
  - `auth-client.ts` - Client-side auth helpers
  - `middleware.ts` - Auth middleware for protected routes
- `utils/` - Utility functions
  - `cn.ts` - Class name merger (clsx + tailwind-merge)
  - `format.ts` - Date/string formatting
  - `validation.ts` - Zod schemas
- `hooks/` - Custom React hooks
  - `useIdeas.ts` - Ideas data fetching
  - `useAuth.ts` - Auth state management
  - `useDebounce.ts` - Debounced values

### 4. Actions Layer (`/actions/`)

**Responsibility:** Server Actions for mutations and form handling

**Components:**
- `ideas.ts` - Server Actions for idea operations
- `profile.ts` - Server Actions for profile updates
- `auth.ts` - Server Actions for authentication

**Key Features:**
- Type-safe with Zod validation
- Direct database access (for auth operations)
- Revalidate paths/tags after mutations
- Error handling with try-catch

### 5. Middleware (`/middleware.ts`)

**Responsibility:** Request interception, authentication checks, redirects

**Key Features:**
- JWT token verification
- Protected route enforcement
- Redirect unauthenticated users to /signin
- Set auth headers for API requests

---

## Routing & Navigation

### Route Structure

```
/                           # Landing page (public)
├── /signin                 # Sign in page (public)
├── /signup                 # Sign up page (public)
├── /dashboard              # User dashboard (protected)
├── /ideas                  # Ideas list (protected)
│   ├── /ideas/new          # Create new idea (protected)
│   ├── /ideas/[id]         # View idea details (protected)
│   └── /ideas/[id]/edit    # Edit idea (protected)
├── /profile                # User profile (protected)
└── /settings               # User settings (protected)
```

### Navigation Components

**Primary Navigation (Authenticated):**
```typescript
// components/layout/main-nav.tsx
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]
```

**Landing Page Navigation (Public):**
```typescript
// components/layout/landing-nav.tsx
const navItems = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/signin', label: 'Sign In' },
  { href: '/signup', label: 'Get Started', primary: true },
]
```

### Protected Route Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/ideas') ||
                          request.nextUrl.pathname.startsWith('/profile')

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (session && request.nextUrl.pathname === '/signin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/ideas/:path*', '/profile/:path*', '/signin', '/signup']
}
```

---

## Authentication Flow

### Better Auth Configuration

```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase 3
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  jwt: {
    algorithm: "RS256",
    expiresIn: "7d",
  },
})
```

### Authentication Flow Diagram

```
┌─────────────────┐
│  User visits    │
│  /signin page   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User enters     │     ┌──────────────────┐
│ credentials     │────▶│  Form Validation │
└─────────────────┘     │  (Zod schema)    │
                        └────────┬─────────┘
                                 │ Valid?
                    ┌────────────┴────────────┐
                    │                         │
                    ▼ YES                     ▼ NO
         ┌─────────────────────┐    ┌────────────────┐
         │ POST to Better Auth │    │ Show errors    │
         │ /api/auth/signin    │    │ inline         │
         └──────────┬──────────┘    └────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Better Auth verifies│
         │ credentials against │
         │ Neon PostgreSQL     │
         └──────────┬──────────┘
                    │
                    ▼ Success
         ┌─────────────────────┐
         │ Generate JWT token  │
         │ (RS256, 7d expiry)  │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Set session cookie  │
         │ (httpOnly, secure)  │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Redirect to         │
         │ /dashboard          │
         └─────────────────────┘
```

### JWT Token Usage

**Frontend → Backend API:**
```typescript
// lib/api/client.ts
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const session = await auth.api.getSession()

  const headers = {
    'Content-Type': 'application/json',
    ...(session?.token && {
      'Authorization': `Bearer ${session.token}`
    }),
    ...options?.headers,
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
```

### Session Management

**Server Component:**
```typescript
// app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/signin')
  }

  return <DashboardContent user={session.user} />
}
```

**Client Component:**
```typescript
// components/auth/user-menu.tsx
'use client'

import { useSession, signOut } from '@/lib/auth-client'

export function UserMenu() {
  const { data: session, isPending } = useSession()

  if (isPending) return <Skeleton />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session?.user?.image} />
          <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => signOut()}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## State Management

### State Management Strategy

**Principle:** Minimize client-side state, leverage server state, use React 19 features

| State Type | Solution | Example |
|------------|----------|---------|
| **Server State** | React Server Components + SWR | Idea lists, user profile |
| **URL State** | searchParams + useRouter | Filters, pagination, search |
| **Form State** | React Hook Form | Create/edit forms |
| **UI State** | React.useState | Modals, dropdowns, local toggles |
| **Global UI** | Context API | Theme, sidebar state |
| **Auth State** | Better Auth hooks | User session, auth status |

### Data Fetching Patterns

**Server Component (Preferred):**
```typescript
// app/ideas/page.tsx
import { getIdeas } from '@/lib/api/ideas'

export default async function IdeasPage({ searchParams }) {
  const ideas = await getIdeas({
    stage: searchParams.stage,
    tags: searchParams.tags,
  })

  return <IdeasList ideas={ideas} />
}
```

**Client Component with SWR:**
```typescript
// components/ideas/ideas-list.tsx
'use client'

import useSWR from 'swr'
import { getIdeas } from '@/lib/api/ideas'

export function IdeasList({ initialData }) {
  const { data: ideas, error, mutate } = useSWR(
    '/api/ideas',
    getIdeas,
    { fallbackData: initialData }
  )

  if (error) return <ErrorState />
  if (!ideas) return <LoadingState />

  return (
    <div className="grid gap-4">
      {ideas.map(idea => (
        <IdeaCard key={idea.id} idea={idea} onUpdate={mutate} />
      ))}
    </div>
  )
}
```

### Form State with React Hook Form

```typescript
// components/ideas/idea-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ideaSchema } from '@/lib/validation'

export function IdeaForm({ idea, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(ideaSchema),
    defaultValues: idea || {
      title: '',
      notes: '',
      stage: 'idea',
      tags: [],
      priority: 'medium',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional fields */}
        <Button type="submit">Save Idea</Button>
      </form>
    </Form>
  )
}
```

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes
│   │   ├── layout.tsx            # Public layout (landing nav)
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── signin/
│   │   │   └── page.tsx          # Sign in page
│   │   └── signup/
│   │       └── page.tsx          # Sign up page
│   ├── (protected)/              # Protected routes
│   │   ├── layout.tsx            # Protected layout (app nav, sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard
│   │   ├── ideas/
│   │   │   ├── page.tsx          # Ideas list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create idea
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # View idea
│   │   │       └── edit/
│   │   │           └── page.tsx  # Edit idea
│   │   ├── profile/
│   │   │   └── page.tsx          # User profile
│   │   └── settings/
│   │       └── page.tsx          # Settings
│   ├── api/                      # API routes (Better Auth)
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts      # Better Auth handlers
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── providers.tsx             # Client providers (SWR, theme)
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── main-nav.tsx
│   │   └── landing-nav.tsx
│   ├── auth/                     # Auth components
│   │   ├── signin-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── oauth-buttons.tsx
│   │   └── user-menu.tsx
│   ├── ideas/                    # Idea components
│   │   ├── idea-card.tsx
│   │   ├── idea-form.tsx
│   │   ├── idea-filters.tsx
│   │   ├── idea-search.tsx
│   │   ├── stage-badge.tsx
│   │   └── priority-badge.tsx
│   ├── dashboard/                # Dashboard components
│   │   ├── stats-card.tsx
│   │   ├── recent-ideas.tsx
│   │   └── stage-chart.tsx
│   └── shared/                   # Shared components
│       ├── loading.tsx
│       ├── error-boundary.tsx
│       ├── empty-state.tsx
│       └── pagination.tsx
├── lib/
│   ├── api/                      # Backend API client
│   │   ├── client.ts             # HTTP client
│   │   ├── ideas.ts              # Ideas API
│   │   ├── users.ts              # Users API
│   │   └── types.ts              # TypeScript types
│   ├── auth/                     # Better Auth
│   │   ├── auth.ts               # Auth config (server)
│   │   ├── auth-client.ts        # Auth client hooks
│   │   └── middleware.ts         # Auth middleware
│   ├── db/                       # Drizzle ORM (auth database)
│   │   ├── index.ts              # DB connection
│   │   └── schema.ts             # Auth schema
│   ├── hooks/                    # Custom hooks
│   │   ├── use-ideas.ts
│   │   ├── use-auth.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Class name merger
│   │   ├── format.ts             # Formatting utilities
│   │   └── constants.ts          # App constants
│   └── validation/               # Zod schemas
│       ├── idea.ts
│       └── user.ts
├── actions/                      # Server Actions
│   ├── ideas.ts
│   ├── profile.ts
│   └── auth.ts
├── public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── styles/                       # Additional styles
│   └── animations.css            # Framer Motion presets
├── types/                        # Global TypeScript types
│   └── index.ts
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
├── .env.local                    # Local environment variables
├── .env.example                  # Environment template
└── README.md                     # Frontend documentation
```

---

## Component Architecture

### Design System Components (shadcn/ui)

**Installation:**
```bash
npx shadcn@latest init
npx shadcn@latest add button card input form dialog dropdown-menu
```

**Example Component:**
```typescript
// components/ideas/idea-card.tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash } from 'lucide-react'
import { motion } from 'framer-motion'

interface IdeaCardProps {
  idea: Idea
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export function IdeaCard({ idea, onEdit, onDelete }: IdeaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{idea.title}</CardTitle>
            <div className="flex gap-2">
              <StageBadge stage={idea.stage} />
              <PriorityBadge priority={idea.priority} />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(idea.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(idea.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2">
            {idea.notes}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {idea.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Updated {formatDistanceToNow(new Date(idea.updated_at))} ago
        </CardFooter>
      </Card>
    </motion.div>
  )
}
```

### Atomic Design Pattern

**Atoms:** Basic building blocks
- Button, Input, Label, Badge, Avatar

**Molecules:** Simple component groups
- FormField (Label + Input + Error)
- SearchBar (Input + Icon + Button)
- StageBadge (Badge with stage-specific styling)

**Organisms:** Complex components
- IdeaCard, IdeaForm, IdeaFilters
- Header, Sidebar, UserMenu

**Templates:** Page layouts
- DashboardLayout, IdeasLayout, LandingLayout

**Pages:** Complete pages
- Dashboard, IdeasList, IdeaDetail, Landing

---

## API Integration

### API Client Setup

```typescript
// lib/api/client.ts
import { auth } from '@/lib/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any
  ) {
    super(`API Error: ${status}`)
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const session = await auth.api.getSession()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(session?.token && {
      'Authorization': `Bearer ${session.token}`
    }),
    ...options?.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new ApiError(response.status, errorData)
  }

  return response.json()
}
```

### Ideas API

```typescript
// lib/api/ideas.ts
import { apiClient } from './client'
import type { Idea, IdeaCreate, IdeaUpdate, IdeaFilters } from './types'

export async function getIdeas(
  userId: string,
  filters?: IdeaFilters
): Promise<Idea[]> {
  const params = new URLSearchParams()
  if (filters?.stage) params.append('stage', filters.stage)
  if (filters?.tags) params.append('tags', filters.tags.join(','))
  if (filters?.priority) params.append('priority', filters.priority)
  if (filters?.search) params.append('search', filters.search)

  const queryString = params.toString()
  const endpoint = `/api/v1/${userId}/ideas${queryString ? `?${queryString}` : ''}`

  const response = await apiClient<{ data: Idea[] }>(endpoint)
  return response.data
}

export async function getIdea(
  userId: string,
  ideaId: number
): Promise<Idea> {
  const response = await apiClient<{ data: Idea }>(
    `/api/v1/${userId}/ideas/${ideaId}`
  )
  return response.data
}

export async function createIdea(
  userId: string,
  data: IdeaCreate
): Promise<Idea> {
  const response = await apiClient<{ data: Idea }>(
    `/api/v1/${userId}/ideas`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )
  return response.data
}

export async function updateIdea(
  userId: string,
  ideaId: number,
  data: IdeaUpdate
): Promise<Idea> {
  const response = await apiClient<{ data: Idea }>(
    `/api/v1/${userId}/ideas/${ideaId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  )
  return response.data
}

export async function deleteIdea(
  userId: string,
  ideaId: number
): Promise<void> {
  await apiClient(`/api/v1/${userId}/ideas/${ideaId}`, {
    method: 'DELETE',
  })
}
```

### TypeScript Types

```typescript
// lib/api/types.ts
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
```

---

## Design System

### Color Palette (2026 Design)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // Neutral colors
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          500: '#737373',
          900: '#171717',
        },
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
}
```

### Typography Scale

```css
/* app/globals.css */
@layer base {
  h1 {
    @apply text-4xl font-bold tracking-tight lg:text-5xl;
  }
  h2 {
    @apply text-3xl font-semibold tracking-tight;
  }
  h3 {
    @apply text-2xl font-semibold tracking-tight;
  }
  h4 {
    @apply text-xl font-semibold tracking-tight;
  }
  p {
    @apply leading-7;
  }
  .text-muted {
    @apply text-muted-foreground;
  }
}
```

### 2026 Design Principles

**Anticipatory UX:**
- Pre-fetch data on hover (idea cards, navigation links)
- Smart defaults based on user behavior
- Contextual suggestions (tags, stage transitions)

**Kinetic Typography:**
```typescript
// components/landing/hero-text.tsx
import { motion } from 'framer-motion'

export function HeroText() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="text-6xl font-display font-bold tracking-tight"
    >
      Capture Ideas.{' '}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-primary-600"
      >
        Create Content.
      </motion.span>
    </motion.h1>
  )
}
```

**Micro-interactions:**
```typescript
// components/ui/button.tsx (enhanced)
export const Button = motion(ButtonPrimitive)

// Usage
<Button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</Button>
```

---

## Error Handling

### Error Boundary

```typescript
// components/shared/error-boundary.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
```

### API Error Handling

```typescript
// lib/api/error-handler.ts
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const errorData = error.data?.error

    switch (error.status) {
      case 400:
        return errorData?.message || 'Invalid request'
      case 401:
        return 'Please sign in to continue'
      case 403:
        return 'You do not have permission to perform this action'
      case 404:
        return 'Resource not found'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return 'An unexpected error occurred'
    }
  }

  return 'Network error. Please check your connection.'
}
```

### Toast Notifications

```typescript
// components/shared/toast-provider.tsx
import { Toaster } from '@/components/ui/sonner'

export function ToastProvider() {
  return <Toaster position="top-right" />
}

// Usage in components
import { toast } from 'sonner'

function createIdea(data: IdeaCreate) {
  try {
    const idea = await createIdea(userId, data)
    toast.success('Idea created successfully!')
    router.push(`/ideas/${idea.id}`)
  } catch (error) {
    toast.error(handleApiError(error))
  }
}
```

---

## Performance & Optimization

### Next.js Optimizations

**Image Optimization:**
```typescript
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="CreatorVault Dashboard"
  width={1200}
  height={600}
  priority
  className="rounded-lg"
/>
```

**Font Optimization:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

**Code Splitting:**
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const IdeaEditor = dynamic(() => import('@/components/ideas/idea-editor'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

### Performance Budget

| Metric | Target | Maximum |
|--------|--------|---------|
| **First Contentful Paint (FCP)** | < 1.5s | < 2.5s |
| **Largest Contentful Paint (LCP)** | < 2.5s | < 4.0s |
| **Time to Interactive (TTI)** | < 3.5s | < 5.0s |
| **Cumulative Layout Shift (CLS)** | < 0.1 | < 0.25 |
| **Total Bundle Size** | < 200KB | < 350KB |
| **Initial JS Bundle** | < 100KB | < 150KB |

### Data Fetching Optimization

**Parallel Fetching:**
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const [stats, recentIdeas, user] = await Promise.all([
    getStats(userId),
    getIdeas(userId, { limit: 5 }),
    getUser(userId),
  ])

  return <DashboardContent stats={stats} ideas={recentIdeas} user={user} />
}
```

**Request Deduplication (SWR):**
```typescript
import useSWR from 'swr'

// Multiple components can call this - only 1 request is made
function useIdeas() {
  return useSWR('/api/ideas', getIdeas, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })
}
```

### Caching Strategy

**Static Generation (where possible):**
```typescript
// app/(public)/page.tsx - Landing page
export const revalidate = 3600 // Revalidate every hour

export default async function LandingPage() {
  return <Landing />
}
```

**Dynamic with Caching:**
```typescript
// lib/api/ideas.ts
export async function getIdeas(userId: string) {
  return apiClient(`/api/v1/${userId}/ideas`, {
    next: {
      tags: ['ideas', `user-${userId}`],
      revalidate: 60 // Cache for 60 seconds
    }
  })
}

// Revalidate after mutation
import { revalidateTag } from 'next/cache'

export async function createIdea(userId: string, data: IdeaCreate) {
  const idea = await apiClient(...)
  revalidateTag(`user-${userId}`)
  revalidateTag('ideas')
  return idea
}
```

---

## Testing Strategy

### Test Pyramid

```
        ┌──────────────┐
        │  E2E Tests   │  10% - User journeys (Playwright)
        │  (Playwright)│
        ├──────────────┤
        │              │
        │ Integration  │  30% - Component + API
        │    Tests     │
        │ (React Test  │
        │   Library)   │
        ├──────────────┤
        │              │
        │              │
        │  Unit Tests  │  60% - Utilities, hooks, logic
        │   (Jest)     │
        │              │
        │              │
        └──────────────┘
```

### Unit Tests

```typescript
// __tests__/lib/utils/format.test.ts
import { formatDate, truncate } from '@/lib/utils/format'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-01-06T10:00:00Z')
    expect(formatDate(date)).toBe('Jan 6, 2026')
  })
})

describe('truncate', () => {
  it('truncates long strings', () => {
    const long = 'This is a very long string'
    expect(truncate(long, 10)).toBe('This is a...')
  })

  it('does not truncate short strings', () => {
    const short = 'Short'
    expect(truncate(short, 10)).toBe('Short')
  })
})
```

### Component Tests

```typescript
// __tests__/components/ideas/idea-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { IdeaCard } from '@/components/ideas/idea-card'

const mockIdea = {
  id: 1,
  title: 'Test Idea',
  notes: 'Test notes',
  stage: 'idea' as const,
  tags: ['test'],
  priority: 'high' as const,
  created_at: '2026-01-06T10:00:00Z',
  updated_at: '2026-01-06T10:00:00Z',
}

describe('IdeaCard', () => {
  it('renders idea information', () => {
    render(<IdeaCard idea={mockIdea} onEdit={jest.fn()} onDelete={jest.fn()} />)

    expect(screen.getByText('Test Idea')).toBeInTheDocument()
    expect(screen.getByText('Test notes')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn()
    render(<IdeaCard idea={mockIdea} onEdit={onEdit} onDelete={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(1)
  })
})
```

### E2E Tests

```typescript
// e2e/ideas.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Ideas Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in
    await page.goto('/signin')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('create new idea', async ({ page }) => {
    await page.goto('/ideas/new')

    await page.fill('[name="title"]', 'Test Idea')
    await page.fill('[name="notes"]', 'Test notes')
    await page.selectOption('[name="priority"]', 'high')

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/ideas\/\d+/)
    await expect(page.locator('h1')).toContainText('Test Idea')
  })

  test('filter ideas by stage', async ({ page }) => {
    await page.goto('/ideas')

    await page.selectOption('[name="stage"]', 'draft')

    const ideas = page.locator('[data-testid="idea-card"]')
    await expect(ideas).toHaveCount(3)
  })
})
```

### Test Coverage Target

**Minimum Coverage:** 80% overall
- Utilities: 90%
- Hooks: 85%
- Components: 75%
- Pages: 70%

**Run Tests:**
```bash
# Unit + Integration tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## Deployment Architecture

### Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

**Environment Variables (.env.local):**
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Database (for Better Auth)
DATABASE_URL=postgresql://user:pass@localhost:5432/creatorvault_auth

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Production Deployment (Vercel)

**Vercel Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "BETTER_AUTH_SECRET": "@auth-secret",
    "DATABASE_URL": "@database-url"
  }
}
```

**Build Optimization:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
```

### Environment-Specific Configuration

**Development:**
- Local API (http://localhost:8000)
- Local PostgreSQL for auth
- Hot reload enabled
- Detailed error messages

**Staging:**
- Staging API (https://api-staging.creatorvault.com)
- Neon branch database
- Simulates production
- Error tracking enabled

**Production:**
- Production API (https://api.creatorvault.com)
- Neon production database
- Optimized builds
- Analytics enabled

---

## Phase 3 Preparation

### AI Chatbot Integration

**Phase 3 Requirement:** OpenAI Agents SDK with natural language idea management

**Frontend Changes Needed:**

1. **Chat Interface Component:**
```typescript
// components/chat/chat-interface.tsx
'use client'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    // Send to OpenAI Agents SDK endpoint
    const response = await fetch('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input }),
    })

    const { reply, actions } = await response.json()

    // Update messages
    setMessages([...messages, { role: 'user', content: input }])
    setMessages([...messages, { role: 'assistant', content: reply }])

    // Execute any tool actions (create idea, update stage, etc.)
    if (actions) {
      executeActions(actions)
    }
  }

  return <ChatUI messages={messages} onSend={handleSend} />
}
```

2. **MCP Tool Execution:**
```typescript
// lib/mcp/execute-actions.ts
export async function executeActions(actions: MCPAction[]) {
  for (const action of actions) {
    switch (action.tool) {
      case 'add_idea':
        await createIdea(userId, action.params)
        break
      case 'update_stage':
        await updateIdea(userId, action.params.id, { stage: action.params.stage })
        break
      case 'list_ideas':
        return await getIdeas(userId, action.params.filters)
    }
  }
}
```

3. **Chat Page Route:**
```typescript
// app/(protected)/chat/page.tsx
import { ChatInterface } from '@/components/chat/chat-interface'

export default function ChatPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
      <ChatInterface />
    </div>
  )
}
```

### Conversation Storage

**New Tables (auth database):**
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES conversations(id),
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Checklist

### Phase 2 Frontend Implementation Tasks

#### Setup & Configuration
- [ ] Initialize Next.js 16 project with App Router
- [ ] Install and configure TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Initialize shadcn/ui component library
- [ ] Set up Better Auth with Drizzle ORM
- [ ] Configure Neon PostgreSQL for auth database
- [ ] Set up environment variables (.env.local, .env.example)

#### Authentication
- [ ] Implement Better Auth configuration (`lib/auth/auth.ts`)
- [ ] Create auth database schema with Drizzle
- [ ] Implement signin page with email/password
- [ ] Implement signup page with validation
- [ ] Add OAuth buttons (Google, GitHub)
- [ ] Create auth middleware for protected routes
- [ ] Implement user menu with signout
- [ ] Add session management hooks

#### Core Components (shadcn/ui)
- [ ] Install button, card, input, form, dialog components
- [ ] Install dropdown-menu, badge, avatar components
- [ ] Install select, textarea, label components
- [ ] Install toast/sonner for notifications
- [ ] Customize theme colors and typography

#### Layout Components
- [ ] Create root layout with providers
- [ ] Create public layout (landing nav)
- [ ] Create protected layout (app nav + sidebar)
- [ ] Implement header component
- [ ] Implement footer component
- [ ] Implement sidebar with navigation
- [ ] Implement user menu dropdown

#### Landing Page (2026 Design)
- [ ] Design hero section with kinetic typography
- [ ] Implement features section with animations
- [ ] Create "How It Works" section with scrollytelling
- [ ] Design pricing section (if applicable)
- [ ] Add call-to-action sections
- [ ] Implement smooth scroll navigation
- [ ] Add Framer Motion micro-interactions

#### Ideas Management
- [ ] Create ideas list page with filters
- [ ] Implement idea card component
- [ ] Create idea detail page
- [ ] Implement idea form (create/edit)
- [ ] Add idea search functionality
- [ ] Implement tag filtering
- [ ] Add stage/priority badges
- [ ] Create empty state component
- [ ] Implement pagination

#### Dashboard
- [ ] Create dashboard page layout
- [ ] Implement stats cards (total ideas, by stage)
- [ ] Create recent ideas widget
- [ ] Add stage distribution chart
- [ ] Implement quick actions

#### API Integration
- [ ] Create API client with JWT injection
- [ ] Implement ideas API methods (CRUD)
- [ ] Implement users API methods
- [ ] Add TypeScript types for all API responses
- [ ] Create error handling utilities
- [ ] Set up SWR for client-side data fetching
- [ ] Implement optimistic updates

#### Forms & Validation
- [ ] Set up React Hook Form
- [ ] Create Zod schemas for validation
- [ ] Implement idea form with validation
- [ ] Add profile form with validation
- [ ] Create reusable form components

#### State Management
- [ ] Set up URL state for filters/search
- [ ] Implement form state with React Hook Form
- [ ] Create custom hooks (useIdeas, useAuth)
- [ ] Add debounce hook for search

#### Error Handling
- [ ] Create error boundary component
- [ ] Implement API error handler
- [ ] Add toast notifications
- [ ] Create loading states
- [ ] Add 404 page
- [ ] Add error pages

#### Performance Optimization
- [ ] Implement Next.js Image optimization
- [ ] Add font optimization
- [ ] Set up dynamic imports for heavy components
- [ ] Configure caching strategies
- [ ] Implement request deduplication with SWR
- [ ] Add loading skeletons

#### Testing
- [ ] Set up Jest and React Testing Library
- [ ] Write unit tests for utilities (80% coverage)
- [ ] Write component tests for key components
- [ ] Set up Playwright for E2E tests
- [ ] Write E2E tests for critical user journeys
- [ ] Add GitHub Actions CI pipeline

#### Documentation
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Create component documentation (Storybook)
- [ ] Document API integration patterns
- [ ] Add deployment guide

#### Deployment Prep
- [ ] Configure next.config.js for production
- [ ] Set up Vercel project
- [ ] Configure production environment variables
- [ ] Test production build locally
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)

---

## Appendix

### Environment Variables Reference

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://api.creatorvault.com

# Better Auth
BETTER_AUTH_SECRET=your-256-bit-secret-key
BETTER_AUTH_URL=https://creatorvault.com

# Database (Auth data - Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/creatorvault_auth?sslmode=require

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_CHAT=false  # Phase 3
```

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E with UI

# shadcn/ui
npx shadcn@latest add [component]  # Add component
npx shadcn@latest diff [component] # Check for updates

# Database (Drizzle ORM)
npx drizzle-kit generate  # Generate migrations
npx drizzle-kit migrate   # Run migrations
npx drizzle-kit studio    # Open Drizzle Studio

# Type Checking
npm run type-check        # Run TypeScript compiler

# Deployment
vercel                    # Deploy to Vercel
vercel --prod             # Deploy to production
```

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "@radix-ui/react-*": "latest",
    "better-auth": "^1.0.0",
    "drizzle-orm": "^0.36.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "swr": "^2.2.0",
    "date-fns": "^4.1.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "jest": "^29.7.0",
    "prettier": "^3.3.0",
    "drizzle-kit": "^0.28.0"
  }
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-06 | Claude Sonnet 4.5 | Initial frontend architecture for Phase 2 |

---

**Next Steps:**
1. Review this architecture document
2. Initialize Next.js project with `/nextjs16` skill
3. Set up Better Auth with `/better-auth-nextjs` skill
4. Design landing page with `/landing-page-design-2026` skill
5. Integrate with backend API using `/frontend-backend-jwt-verification` skill
6. Style with shadcn/ui using `/styling-with-shadcn` skill

**Estimated Implementation Time:** 4-5 days (with spec-driven development)

**Phase 2 Completion Criteria:**
- [ ] Landing page deployed with modern 2026 design
- [ ] Authentication working (email/password + OAuth)
- [ ] Dashboard showing user ideas with stats
- [ ] Full CRUD operations for ideas
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] 80%+ test coverage
- [ ] Deployed to Vercel with custom domain
