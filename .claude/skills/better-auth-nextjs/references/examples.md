# Complete Examples

## Complete Auth Forms

### Full Sign-In Component

```typescript
'use client';

import { signIn } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignIn() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>

      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <div className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <a href="/sign-up" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </div>
    </div>
  );
}
```

### Full Sign-Up Component

```typescript
'use client';

import { signUp } from '@/lib/auth-client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignUp() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <a href="/sign-in" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
```

## OAuth Flows

### Complete Social Sign-In Component

```typescript
'use client';

import { signIn } from '@/lib/auth-client';

export function SocialSignIn() {
  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    try {
      await signIn.social({
        provider,
        callbackURL: '/dashboard',
      });
    } catch (error) {
      console.error('Social sign-in failed:', error);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleSocialSignIn('google')}
        className="w-full flex items-center justify-center gap-3 px-4 py-2 border rounded-md hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          {/* Google Icon SVG */}
        </svg>
        Continue with Google
      </button>

      <button
        onClick={() => handleSocialSignIn('github')}
        className="w-full flex items-center justify-center gap-3 px-4 py-2 border rounded-md hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          {/* GitHub Icon SVG */}
        </svg>
        Continue with GitHub
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
    </div>
  );
}
```

## Protected Pages

### Dashboard with Session

```typescript
import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutButton />
      </header>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-600">Name</dt>
              <dd className="font-medium">{session.user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Email</dt>
              <dd className="font-medium">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Email Verified</dt>
              <dd className="font-medium">
                {session.user.emailVerified ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Session Info</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-600">Session ID</dt>
              <dd className="font-mono text-sm">{session.session.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Expires At</dt>
              <dd className="font-medium">
                {new Date(session.session.expiresAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
```

### Sign Out Button Component

```typescript
'use client';

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
    >
      Sign Out
    </button>
  );
}
```

## Password Reset

### Password Reset Request Form

```typescript
'use client';

import { useState } from 'react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-600">
          We've sent a password reset link to {email}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <a href="/sign-in" className="text-sm text-blue-600 hover:underline">
          Back to sign in
        </a>
      </div>
    </div>
  );
}
```

## Email/Password Only Pattern

### Minimal Auth Config

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
});
```

## OAuth Only Pattern

### OAuth-Only Auth Config

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
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
});
```

## Complete Project Structure

```
your-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts
│   │   ├── actions/
│   │   │   └── auth.ts
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── components/
│   │   └── auth/
│   │       ├── sign-in.tsx
│   │       ├── sign-up.tsx
│   │       ├── social-sign-in.tsx
│   │       └── sign-out-button.tsx
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   └── lib/
│       ├── auth.ts
│       └── auth-client.ts
├── drizzle/
│   └── [migrations]
├── drizzle.config.ts
├── .env.local
└── package.json
```
