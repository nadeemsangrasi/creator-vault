# Auth Configuration Guide

## Complete Auth Configuration

### Full Better Auth Config

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';

export const auth = betterAuth({
  // Database adapter
  database: drizzleAdapter(db, {
    provider: 'pg', // 'pg' | 'mysql' | 'sqlite'
  }),

  // Base URL for auth endpoints
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Secret for signing tokens
  secret: process.env.BETTER_AUTH_SECRET!,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    sendResetPasswordEmail: async (user, url) => {
      // Custom email sending logic
      console.log(`Reset password link for ${user.email}: ${url}`);
    },
    sendVerificationEmail: async (user, url) => {
      // Custom email sending logic
      console.log(`Verification link for ${user.email}: ${url}`);
    },
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Cookie configuration
  cookies: {
    sessionToken: {
      name: 'better-auth.session_token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Rate limiting
  rateLimit: {
    window: 60, // 1 minute
    max: 10, // max 10 requests per window
  },

  // Advanced options
  advanced: {
    cookiePrefix: 'better-auth',
    crossSubdomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === 'production',
    generateId: undefined, // Custom ID generation function
  },

  // Plugins
  plugins: [],
});
```

## Configuration Options Reference

### Database Adapter

```typescript
database: drizzleAdapter(db, {
  provider: 'pg', // PostgreSQL
  // OR
  provider: 'mysql', // MySQL
  // OR
  provider: 'sqlite', // SQLite
})
```

### Email and Password

```typescript
emailAndPassword: {
  enabled: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
  requireEmailVerification: false,
  autoSignIn: true, // Sign in after registration
  sendResetPasswordEmail: async (user, url) => {
    // Send email with reset link
  },
  sendVerificationEmail: async (user, url) => {
    // Send email with verification link
  },
}
```

### Social Providers

#### Google OAuth

```typescript
google: {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
  scope: ['openid', 'email', 'profile'], // Optional
  accessType: 'offline', // Optional: get refresh token
  prompt: 'consent', // Optional: force consent screen
}
```

#### GitHub OAuth

```typescript
github: {
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
  scope: ['user:email'], // Optional
}
```

#### Microsoft OAuth

```typescript
microsoft: {
  clientId: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/microsoft`,
  tenant: 'common', // Or specific tenant ID
}
```

#### Apple OAuth

```typescript
apple: {
  clientId: process.env.APPLE_CLIENT_ID!,
  clientSecret: process.env.APPLE_CLIENT_SECRET!,
  redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/apple`,
  teamId: process.env.APPLE_TEAM_ID!,
  keyId: process.env.APPLE_KEY_ID!,
  privateKey: process.env.APPLE_PRIVATE_KEY!,
}
```

### Session Configuration

```typescript
session: {
  // Session expiration time (in seconds)
  expiresIn: 60 * 60 * 24 * 7, // 7 days

  // Update session timestamp if older than this (in seconds)
  updateAge: 60 * 60 * 24, // 24 hours

  // Cookie cache for session validation
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes
  },

  // Custom session data
  additionalSessionData: async (user) => {
    return {
      role: user.role,
      permissions: await getUserPermissions(user.id),
    };
  },
}
```

### Cookie Configuration

```typescript
cookies: {
  sessionToken: {
    name: 'better-auth.session_token',
    options: {
      httpOnly: true, // Prevent JavaScript access
      sameSite: 'lax', // CSRF protection
      path: '/',
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: 60 * 60 * 24 * 7, // 7 days
      domain: undefined, // Set for subdomain cookies
    },
  },
}
```

### Rate Limiting

```typescript
rateLimit: {
  // Time window in seconds
  window: 60,

  // Maximum requests per window
  max: 10,

  // Custom rate limit handler
  handler: async (req) => {
    // Return user identifier for rate limiting
    return req.headers.get('x-forwarded-for') || 'anonymous';
  },

  // Custom error response
  onRateLimit: (req) => {
    return new Response('Too many requests', { status: 429 });
  },
}
```

### Logging

```typescript
logger: {
  level: 'info', // 'debug' | 'info' | 'warn' | 'error'
  disabled: false,
  verboseErrors: process.env.NODE_ENV === 'development',
}
```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
```

### OAuth Providers

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Microsoft OAuth
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# Apple OAuth
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"
APPLE_TEAM_ID="your-team-id"
APPLE_KEY_ID="your-key-id"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Email Configuration (Optional)

```env
# SMTP for email sending
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@yourdomain.com"
```

## Production Configuration

### Production Auth Config

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Enable in production
  },

  socialProviders: {
    // ... OAuth providers
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days in production
    updateAge: 60 * 60 * 24 * 7, // Update weekly
  },

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // Always true in production
        domain: '.yourdomain.com', // For subdomain cookies
      },
    },
  },

  rateLimit: {
    window: 60,
    max: 30, // More lenient in production
  },

  logger: {
    level: 'warn', // Less verbose in production
    verboseErrors: false,
  },

  advanced: {
    useSecureCookies: true,
    crossSubdomainCookies: {
      enabled: true,
      domain: '.yourdomain.com',
    },
  },
});
```

### Production Environment Variables

```env
# Production
NODE_ENV="production"
DATABASE_URL="your-production-neon-url"
BETTER_AUTH_SECRET="production-secret-key-min-32-chars"
BETTER_AUTH_URL="https://yourdomain.com"

# OAuth (production credentials)
GOOGLE_CLIENT_ID="production-client-id"
GOOGLE_CLIENT_SECRET="production-client-secret"
GITHUB_CLIENT_ID="production-github-id"
GITHUB_CLIENT_SECRET="production-github-secret"
```

## Multi-Environment Setup

### Environment-Specific Config

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  // ... base config

  session: {
    expiresIn: isDevelopment
      ? 60 * 60 * 24 // 1 day in dev
      : 60 * 60 * 24 * 30, // 30 days in prod
  },

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
      },
    },
  },

  logger: {
    level: isDevelopment ? 'debug' : 'warn',
    verboseErrors: isDevelopment,
  },

  emailAndPassword: {
    requireEmailVerification: isProduction,
  },
});
```

## Custom Configuration Examples

### With Custom Email Sending

```typescript
import { sendEmail } from '@/lib/email';

export const auth = betterAuth({
  // ... other config

  emailAndPassword: {
    enabled: true,
    sendResetPasswordEmail: async (user, url) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password',
        html: `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
        `,
      });
    },
    sendVerificationEmail: async (user, url) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email',
        html: `
          <h1>Verify Your Email</h1>
          <p>Click the link below to verify your email:</p>
          <a href="${url}">Verify Email</a>
        `,
      });
    },
  },
});
```

### With Custom Session Data

```typescript
export const auth = betterAuth({
  // ... other config

  session: {
    additionalSessionData: async (user) => {
      const userRole = await db
        .select({ role: userTable.role })
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .get();

      return {
        role: userRole?.role || 'user',
      };
    },
  },
});
```
