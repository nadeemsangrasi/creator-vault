# Troubleshooting Guide

## Common Errors and Solutions

### Database Connection Issues

#### Error: "Connection terminated unexpectedly"

**Cause:** Invalid DATABASE_URL or network issues with Neon

**Solutions:**
1. Verify DATABASE_URL format:
   ```env
   DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
   ```
2. Check Neon dashboard for connection pooler URL
3. Ensure SSL mode is enabled
4. Test connection:
   ```bash
   npx drizzle-kit studio
   ```

#### Error: "connect ETIMEDOUT"

**Cause:** Network timeout or firewall blocking connection

**Solutions:**
1. Check firewall settings
2. Verify Neon project is not paused
3. Try connection pooler URL instead of direct connection
4. Add timeout to connection config:
   ```typescript
   const sql = neon(process.env.DATABASE_URL!, {
     fetchOptions: {
       cache: 'no-store',
     },
   });
   ```

### Session and Authentication Issues

#### Error: "Session not found"

**Cause:** Cookie not being set or read correctly

**Solutions:**
1. Verify `BETTER_AUTH_URL` matches your domain:
   ```env
   BETTER_AUTH_URL="http://localhost:3000"  # Development
   BETTER_AUTH_URL="https://yourdomain.com"  # Production
   ```
2. Check browser cookies (DevTools → Application → Cookies)
3. Ensure cookie name is correct: `better-auth.session_token`
4. Check middleware configuration
5. Verify HTTPS in production

#### Error: "CSRF token mismatch"

**Cause:** Cross-site request forgery protection triggered

**Solutions:**
1. Ensure requests include proper headers
2. Use the provided client library (`@/lib/auth-client`)
3. Check `BETTER_AUTH_URL` is correct
4. Verify origin headers match

#### Error: "Unauthorized"

**Cause:** Invalid or expired session

**Solutions:**
1. Check session expiration in database
2. Verify session token in cookies
3. Implement proper error handling:
   ```typescript
   const session = await getSession();
   if (!session) {
     redirect('/sign-in');
   }
   ```
4. Clear cookies and sign in again

### OAuth Configuration Issues

#### Error: "OAuth redirect failed"

**Cause:** Incorrect callback URL configuration

**Solutions:**
1. Verify callback URL in OAuth provider:
   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`
2. Update OAuth app settings
3. Check authorized redirect URIs match exactly
4. Ensure API route handler is correct

#### Error: "Invalid client ID"

**Cause:** Wrong or missing OAuth credentials

**Solutions:**
1. Verify environment variables:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
2. Check credentials in OAuth provider console
3. Restart development server after adding env vars
4. Ensure no trailing spaces in .env.local

#### Error: "redirect_uri_mismatch"

**Cause:** OAuth redirect URI doesn't match configured URL

**Solutions:**
1. Update authorized redirect URIs in OAuth provider
2. Ensure protocol (http/https) matches
3. Check for trailing slashes
4. Verify port number (3000 vs custom port)

### Drizzle ORM Issues

#### Error: "Drizzle adapter error"

**Cause:** Schema mismatch between code and database

**Solutions:**
1. Regenerate and apply migrations:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit push
   ```
2. Check schema definition matches Better Auth requirements
3. Verify all required tables exist (user, session, account, verification)
4. Use Drizzle Studio to inspect database:
   ```bash
   npx drizzle-kit studio
   ```

#### Error: "Column does not exist"

**Cause:** Missing column in database schema

**Solutions:**
1. Run migrations:
   ```bash
   npx drizzle-kit push
   ```
2. Check schema definition
3. Drop and recreate tables (development only):
   ```bash
   npx drizzle-kit drop
   npx drizzle-kit push
   ```

#### Error: "relation does not exist"

**Cause:** Table not created in database

**Solutions:**
1. Apply migrations:
   ```bash
   npx drizzle-kit push
   ```
2. Verify schema file path in drizzle.config.ts
3. Check DATABASE_URL is correct

### Build and Runtime Errors

#### Error: "Module not found: Can't resolve 'better-auth'"

**Cause:** Package not installed or wrong import path

**Solutions:**
1. Install dependencies:
   ```bash
   npm install better-auth
   ```
2. Check import paths:
   ```typescript
   import { betterAuth } from 'better-auth';
   // NOT: import { betterAuth } from '@better-auth/core';
   ```
3. Clear .next directory and rebuild:
   ```bash
   rm -rf .next && npm run dev
   ```

#### Error: "useSession must be used within AuthProvider"

**Cause:** Missing or incorrectly configured auth provider

**Solutions:**
1. Wrap app with SessionProvider (if using)
2. Use server-side session fetching instead:
   ```typescript
   const session = await getSession(); // Server Component
   ```
3. Ensure client hooks are only used in 'use client' components

#### Error: "process.env.X is undefined"

**Cause:** Environment variable not loaded

**Solutions:**
1. Verify .env.local exists and contains variable
2. Restart development server
3. Check variable name spelling
4. For client-side access, prefix with `NEXT_PUBLIC_`:
   ```env
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

### Email and Password Issues

#### Error: "Email already exists"

**Cause:** Attempting to create account with existing email

**Solutions:**
1. Implement duplicate check:
   ```typescript
   if (result.error?.code === 'USER_EXISTS') {
     setError('Email already registered');
   }
   ```
2. Add "Sign in instead" link
3. Implement proper error messaging

#### Error: "Invalid password"

**Cause:** Password doesn't meet requirements or wrong password

**Solutions:**
1. Check password requirements:
   ```typescript
   emailAndPassword: {
     enabled: true,
     minPasswordLength: 8,
     maxPasswordLength: 128,
   }
   ```
2. Add client-side validation
3. Show password requirements to user

### Production Deployment Issues

#### Error: "Cookie not set in production"

**Cause:** HTTPS/SSL configuration issues

**Solutions:**
1. Ensure HTTPS is enabled
2. Update auth configuration:
   ```typescript
   export const auth = betterAuth({
     // ... other config
     cookies: {
       secure: process.env.NODE_ENV === 'production',
     },
   });
   ```
3. Check `BETTER_AUTH_URL` uses https://
4. Verify SSL certificate is valid

#### Error: "OAuth works locally but not in production"

**Cause:** Callback URLs not updated for production

**Solutions:**
1. Add production callback URLs to OAuth providers:
   - `https://yourdomain.com/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/github`
2. Update environment variables in hosting platform
3. Test OAuth flow on production domain

## Debugging Tips

### 1. Check Better Auth Endpoint

Visit `http://localhost:3000/api/auth/ok` - should return `{ "ok": true }`

### 2. Inspect Database

```bash
npx drizzle-kit studio
```

Check for:
- User records in `user` table
- Active sessions in `session` table
- OAuth accounts in `account` table

### 3. Browser DevTools

**Cookies:**
- Application tab → Cookies
- Look for `better-auth.session_token`

**Network:**
- Monitor API requests to `/api/auth/*`
- Check request/response headers
- Verify payload data

**Console:**
- Look for error messages
- Check network errors

### 4. Server Logs

Add logging to debug:

```typescript
export const auth = betterAuth({
  // ... config
  logger: {
    level: 'debug', // or 'info', 'warn', 'error'
  },
});
```

### 5. Verify Environment Variables

```typescript
// Add to a test page or API route
console.log({
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'Set' : 'Missing',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
});
```

## Getting Help

If you're still stuck:

1. **Better Auth Discord:** https://discord.gg/better-auth
2. **GitHub Issues:** https://github.com/better-auth/better-auth/issues
3. **Documentation:** https://better-auth.com/docs
4. **Drizzle Discord:** https://discord.gg/drizzle
5. **Next.js Discord:** https://discord.gg/nextjs

When asking for help, provide:
- Error message (full stack trace)
- Relevant code snippets
- Node.js version
- Package versions
- What you've tried so far
