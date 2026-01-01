# Better Auth with Next.js 16

A comprehensive Claude Code skill for implementing authentication in Next.js 16 applications using better-auth, Drizzle ORM, and PostgreSQL (Neon).

## Overview

This skill provides step-by-step guidance for setting up production-ready authentication with:
- Email/password authentication
- OAuth providers (Google, GitHub, Microsoft, Apple)
- Drizzle ORM with PostgreSQL (Neon)
- Next.js 16 App Router
- Protected routes and server actions
- Session management

## Installation

### Option 1: Copy to Project Skills

```bash
cp -r better-auth-nextjs /path/to/your-project/.claude/skills/
```

### Option 2: Copy to Global Skills

```bash
cp -r better-auth-nextjs ~/.claude/skills/
```

## Usage

Activate the skill by using trigger keywords in your conversation with Claude Code:

**Trigger keywords:**
- "better-auth"
- "authentication"
- "next.js auth"
- "drizzle auth"
- "oauth setup"
- "sign-in"
- "sign-up"
- "protected routes"

**Example prompts:**
- "Set up better-auth with Next.js and Drizzle ORM"
- "Add Google OAuth authentication to my app"
- "Create protected routes for authenticated users"
- "Implement sign-in and sign-up forms"

## Features

### Core Authentication
- ✅ Email/password authentication
- ✅ Multiple OAuth providers
- ✅ Session management
- ✅ Protected routes with middleware
- ✅ Server actions for auth operations

### Database
- ✅ Drizzle ORM integration
- ✅ PostgreSQL (Neon) support
- ✅ Type-safe schema definitions
- ✅ Automated migrations

### Security
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secure cookie handling
- ✅ Session validation

### Developer Experience
- ✅ TypeScript support
- ✅ Progressive disclosure documentation
- ✅ Complete code examples
- ✅ Troubleshooting guide
- ✅ Production deployment guide

## Prerequisites

- Next.js 16 application with App Router
- Node.js 18+
- PostgreSQL database (Neon account recommended)
- npm or pnpm package manager

## Quick Start

1. **Invoke the skill:**
   ```
   "Set up better-auth with Next.js and Drizzle"
   ```

2. **Follow the guided workflow:**
   - Installation and setup
   - Database configuration
   - Better Auth configuration
   - Implementation
   - OAuth setup (optional)
   - Testing and validation

3. **Reference documentation:**
   - Check `references/` directory for detailed examples
   - Use `references/troubleshooting.md` for common issues
   - See `references/examples.md` for complete implementations

## Documentation Structure

```
better-auth-nextjs/
├── SKILL.md                          # Main skill (< 500 lines)
├── README.md                         # This file
├── references/
│   ├── examples.md                   # Complete code examples
│   ├── schema-guide.md               # Database schemas
│   ├── auth-configuration.md         # Auth config options
│   ├── troubleshooting.md            # Common issues
│   ├── drizzle-setup.md              # Drizzle ORM setup
│   ├── oauth-setup.md                # OAuth provider setup
│   ├── middleware-guide.md           # Middleware patterns
│   ├── server-actions.md             # Server actions
│   ├── security-guide.md             # Security best practices
│   └── deployment-guide.md           # Production deployment
└── scripts/
    └── validate-env.sh               # Environment validation script
```

## Common Use Cases

### Basic Authentication
Set up email/password authentication with sign-in and sign-up forms.

```
"Add email/password authentication to my Next.js app"
```

### OAuth Integration
Add social login with Google, GitHub, or other providers.

```
"Add Google OAuth authentication"
```

### Protected Routes
Create authenticated-only pages and API routes.

```
"Create protected dashboard routes"
```

### Session Management
Implement server-side session validation and management.

```
"Add session management with server actions"
```

## Support

- **Better Auth Docs:** https://better-auth.com
- **GitHub Issues:** https://github.com/better-auth/better-auth/issues
- **Discord:** https://discord.gg/better-auth

## Contributing

Improvements to this skill are welcome! Please ensure:
- SKILL.md stays under 500 lines (progressive disclosure)
- Complete examples go in `references/`
- Troubleshooting entries are actionable
- All code examples are tested

## License

This skill is provided as-is for use with Claude Code. It integrates with:
- Better Auth (MIT License)
- Next.js (MIT License)
- Drizzle ORM (Apache 2.0 License)

## Version

**v1.0.0** - Initial release (2026-01-01)

## Changelog

### v1.0.0 (2026-01-01)
- Initial release
- Next.js 16 App Router support
- Drizzle ORM with Neon PostgreSQL
- Email/password and OAuth authentication
- Complete reference documentation
- Troubleshooting guide
- Production deployment guide
