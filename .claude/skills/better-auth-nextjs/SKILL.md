---
name: better-auth-nextjs
description: Implement authentication in Next.js 16 using better-auth library with Drizzle ORM and PostgreSQL (Neon). Use when adding authentication, setting up better-auth, configuring database adapters, implementing sign-in/sign-up flows, or integrating OAuth providers with Next.js App Router.
version: 1.0.0
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, WebFetch
author: Claude Code
tags: [authentication, nextjs, better-auth, drizzle-orm, postgresql, neon, oauth, app-router]
---

# Better Auth with Next.js 16

Implement production-ready authentication in Next.js 16 applications using better-auth, Drizzle ORM, and PostgreSQL (Neon). This skill guides you through setup, configuration, and implementation of secure authentication flows with OAuth providers.

## Overview

Better Auth is a TypeScript authentication library with comprehensive features. Implements email/password and OAuth authentication with Next.js 16 App Router, Drizzle ORM, and PostgreSQL (Neon).

## When to Use This Skill

**Activate when:**
- Adding authentication to Next.js 16 application
- Setting up better-auth with Drizzle ORM
- Configuring OAuth providers (Google, GitHub, etc.)
- Implementing sign-in/sign-up flows
- Creating protected API routes
- Managing user sessions

**Trigger keywords:** "better-auth", "authentication", "next.js auth", "drizzle auth", "oauth setup", "sign-in", "sign-up", "protected routes"

## Prerequisites

**Required:**
- Next.js 16 application (App Router)
- Node.js 18+
- PostgreSQL database (Neon account)
- npm or pnpm package manager

**Recommended:**
- TypeScript configured
- Environment variables setup (.env.local)
- Basic understanding of React Server Components

**External accounts (for OAuth):**
- Google Cloud Console (for Google OAuth)
- GitHub Developer Settings (for GitHub OAuth)

## Instructions

### Phase 1: Installation and Setup

#### Step 1: Install Dependencies

**Install core packages:**
```bash
npm install better-auth drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

**Verification:**
```bash
npm list better-auth drizzle-orm @neondatabase/serverless
```

#### Step 2: Configure Environment Variables

**Create/update `.env.local`:**
```env
DATABASE_URL="postgresql://user:password@host/dbname"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"
```

**Generate secret:**
```bash
openssl rand -base64 32
```

**See:** `references/environment-setup.md` for production configuration

#### Step 3: Create Database Schema

**Create `src/db/schema.ts` with user, session, and account tables:**
```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  // ... more fields
});
```

**See:** `references/schema-guide.md` for complete schema

#### Step 4: Configure Drizzle Client

**Create `src/db/index.ts` and `drizzle.config.ts`:**
```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
```

**See:** `references/drizzle-setup.md` for complete config

#### Step 5: Run Database Migration

**Generate migration:**
```bash
npx drizzle-kit generate
```

**Push to database:**
```bash
npx drizzle-kit push
```

**Verify tables created:**
```bash
npx drizzle-kit studio
```

### Phase 2: Better Auth Configuration

#### Step 6: Create Auth Instance

**Create `src/lib/auth.ts`:**
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  socialProviders: { /* Google, GitHub config */ },
});
```

**See:** `references/auth-configuration.md` for complete config

#### Step 7: Create API Route Handler

**Create `src/app/api/auth/[...all]/route.ts`:**
```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth.handler);
```

**Verify endpoint:**
```bash
curl http://localhost:3000/api/auth/ok
```

#### Step 8: Create Auth Client

**Create `src/lib/auth-client.ts`:**
```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

**See:** `references/client-setup.md` for hooks and utilities

### Phase 3: Implementation

#### Step 9: Create Sign-In Component

**Create `src/components/auth/sign-in.tsx`:**
```typescript
'use client';
import { signIn } from '@/lib/auth-client';

export function SignIn() {
  // Form with email/password inputs
  // Call signIn.email({ email, password })
}
```

**See:** `references/examples.md#complete-auth-forms`

#### Step 10: Create Protected Route Middleware

**Create `src/middleware.ts`:**
```typescript
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('better-auth.session_token');
  if (!session) return NextResponse.redirect('/sign-in');
  return NextResponse.next();
}
```

**See:** `references/middleware-guide.md`

#### Step 11: Implement Server Actions

**Create `src/app/actions/auth.ts`:**
```typescript
'use server';
export async function getSession() {
  // Get session from cookies and validate
}
```

**See:** `references/server-actions.md`

#### Step 12: Create User Dashboard

**Protected page at `src/app/dashboard/page.tsx`:**
```typescript
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/sign-in');
  return <div>Welcome, {session.user.name}</div>;
}
```

**See:** `references/examples.md#protected-pages`

### Phase 4: OAuth Configuration

#### Step 13: Configure OAuth Providers

**Setup steps:**
1. Create OAuth app in provider console (Google/GitHub)
2. Add callback URL: `http://localhost:3000/api/auth/callback/{provider}`
3. Add credentials to `.env.local`

**See:** `references/oauth-setup.md` for detailed setup

#### Step 14: Add OAuth Sign-In Buttons

**Add to sign-in component:**
```typescript
<button onClick={() => signIn.social({ provider: 'google' })}>
  Sign in with Google
</button>
```

**See:** `references/examples.md#oauth-flows`

### Phase 5: Testing and Validation

#### Step 15: Test Authentication Flow

**Test checklist:**
- [ ] Sign up with email/password works
- [ ] Sign in with email/password works
- [ ] OAuth providers redirect correctly
- [ ] Protected routes redirect to sign-in
- [ ] Session persists across page reloads
- [ ] Sign out clears session

**Run development server:**
```bash
npm run dev
```

**Navigate to:** `http://localhost:3000/sign-in`

**See:** `references/testing-guide.md` for automated tests

#### Step 16: Verify Database Records

**Check user creation:**
```bash
npx drizzle-kit studio
```

**Verify tables:**
- `user` table has new entries
- `session` table tracks active sessions
- `account` table has OAuth accounts

## Common Patterns

### Pattern 1: Email/Password Only Setup
**Quick:** Remove `socialProviders` from auth config. Only `emailAndPassword: { enabled: true }` needed.

**See:** `references/examples.md#email-password-only`

### Pattern 2: OAuth Only Setup
**Quick:** Remove `emailAndPassword`, keep only `socialProviders` with desired providers.

**See:** `references/examples.md#oauth-only`

### Pattern 3: Two-Factor Authentication
**Quick:** Add `twoFactor` plugin to better-auth config.

**See:** `references/plugins-guide.md#two-factor`

### Pattern 4: Magic Link Authentication
**Quick:** Add `magicLink` plugin and configure email transport.

**See:** `references/plugins-guide.md#magic-link`

### Pattern 5: Role-Based Access Control
**Quick:** Extend user schema with `role` field, check in middleware.

**See:** `references/rbac-guide.md`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Database connection failed | Invalid DATABASE_URL | Verify Neon connection string |
| Session not found | Cookie not set | Check BETTER_AUTH_URL matches domain |
| OAuth redirect failed | Wrong callback URL | Update OAuth provider settings |
| Email sign-up failed | User exists | Implement duplicate check |
| Missing environment variable | .env.local not loaded | Restart dev server |
| Drizzle adapter error | Schema mismatch | Re-run migrations |

**See:** `references/troubleshooting.md` for complete error catalog

## Security Best Practices

- Never commit `.env.local`
- Use strong random `BETTER_AUTH_SECRET`
- Set `secure: true` cookies in production
- Validate redirect URIs for OAuth

**See:** `references/security-guide.md`

## Production Deployment

**Checklist:**
- [ ] Update `BETTER_AUTH_URL` to production domain
- [ ] Set environment variables in hosting platform
- [ ] Update OAuth callbacks to production URLs
- [ ] Run migrations on production database

**See:** `references/deployment-guide.md`

## Integration with nextjs-dev-tool

**Use nextjs-dev-tool skill to enhance auth development:**

**Verify Routes:**
- Check `/sign-in`, `/sign-up`, `/api/auth/[...all]` are registered
- Use `get_page_metadata` to inspect routes

**Debug Issues:**
- Use `get_errors` to detect hydration errors in auth components
- Use `browser_eval` to test sign-in/sign-up flows
- Check console errors with browser automation

**Test Auth Flows:**
- Automate testing of authentication workflows
- Verify middleware protection
- Test OAuth redirects

**See:** nextjs-dev-tool skill `references/integration-guides.md#better-auth`

## Advanced Features

- **Multi-Factor Authentication:** `references/plugins-guide.md#mfa`
- **Email Verification:** `references/plugins-guide.md#email-verification`
- **Password Reset:** `references/examples.md#password-reset`
- **Account Linking:** `references/advanced-features.md#account-linking`
- **Custom Claims:** `references/advanced-features.md#custom-claims`
- **Rate Limiting:** `references/security-guide.md#rate-limiting`

## Validation Checklist

**Structure:**
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Migrations run successfully
- [ ] Auth instance configured

**Functionality:**
- [ ] API routes respond correctly
- [ ] Sign-up creates users
- [ ] Sign-in authenticates users
- [ ] OAuth providers work
- [ ] Protected routes redirect
- [ ] Sessions persist correctly
- [ ] Sign-out clears session

**Production Ready:**
- [ ] HTTPS enabled
- [ ] Secrets secured
- [ ] OAuth callbacks updated
- [ ] Error handling implemented
- [ ] Logging configured

## References

**Local Documentation:**
- Environment setup: `references/environment-setup.md`
- Complete schemas: `references/schema-guide.md`
- Drizzle configuration: `references/drizzle-setup.md`
- Auth configuration: `references/auth-configuration.md`
- Client setup: `references/client-setup.md`
- Complete examples: `references/examples.md`
- Middleware patterns: `references/middleware-guide.md`
- Server actions: `references/server-actions.md`
- OAuth setup: `references/oauth-setup.md`
- Testing guide: `references/testing-guide.md`
- Plugins guide: `references/plugins-guide.md`
- RBAC guide: `references/rbac-guide.md`
- Troubleshooting: `references/troubleshooting.md`
- Security guide: `references/security-guide.md`
- Deployment guide: `references/deployment-guide.md`
- Advanced features: `references/advanced-features.md`

**Official Documentation:**
- Better Auth: https://better-auth.com
- Next.js 16: https://nextjs.org
- Drizzle ORM: https://orm.drizzle.team
- Neon PostgreSQL: https://neon.tech

## Tips for Success

1. **Start simple** - Begin with email/password, add OAuth later
2. **Test locally first** - Verify all flows before deploying
3. **Use Drizzle Studio** - Visual database inspection is invaluable
4. **Check cookies** - Most auth issues are cookie-related
5. **Read error messages** - Better Auth provides detailed errors
6. **Use TypeScript** - Catch configuration errors at build time
7. **Follow security practices** - Review security guide before production

## Version History

**v1.0.0 (2026-01-01)**
- Initial release
- Next.js 16 App Router support
- Drizzle ORM with Neon PostgreSQL
- Email/password and OAuth authentication
- Progressive disclosure structure (< 500 lines)
- Comprehensive reference documentation
