# OAuth Provider Setup Guide

## Google OAuth

### 1. Create OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**

### 2. Configure OAuth Consent Screen

1. Navigate to **OAuth consent screen**
2. Select **External** (or Internal for workspace)
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### 3. Set Authorized Redirect URIs

**Development:**
```
http://localhost:3000/api/auth/callback/google
```

**Production:**
```
https://yourdomain.com/api/auth/callback/google
```

### 4. Get Credentials

Copy:
- Client ID
- Client Secret

### 5. Add to Environment

```env
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123..."
```

## GitHub OAuth

### 1. Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in details:
   - Application name: Your App Name
   - Homepage URL: `http://localhost:3000` (dev) or your domain
   - Authorization callback URL: See below

### 2. Set Callback URL

**Development:**
```
http://localhost:3000/api/auth/callback/github
```

**Production:**
```
https://yourdomain.com/api/auth/callback/github
```

### 3. Generate Client Secret

1. After creating app, click **Generate a new client secret**
2. Copy immediately (shown only once)

### 4. Get Credentials

Copy:
- Client ID
- Client Secret

### 5. Add to Environment

```env
GITHUB_CLIENT_ID="Iv1.abc123..."
GITHUB_CLIENT_SECRET="abc123..."
```

## Microsoft OAuth

### 1. Register Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: Your App Name
   - Supported account types: Choose appropriate
   - Redirect URI: See below

### 2. Set Redirect URI

**Development:**
```
http://localhost:3000/api/auth/callback/microsoft
```

**Production:**
```
https://yourdomain.com/api/auth/callback/microsoft
```

### 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description and expiration
4. Copy value immediately

### 4. Configure API Permissions

1. Go to **API permissions**
2. Add permissions:
   - Microsoft Graph → Delegated → `User.Read`
   - Microsoft Graph → Delegated → `email`
   - Microsoft Graph → Delegated → `profile`

### 5. Get Credentials

Copy from **Overview**:
- Application (client) ID
- Directory (tenant) ID

### 6. Add to Environment

```env
MICROSOFT_CLIENT_ID="abc123-..."
MICROSOFT_CLIENT_SECRET="abc~..."
MICROSOFT_TENANT_ID="common"  # or specific tenant ID
```

## Discord OAuth

### 1. Create Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name your application

### 2. Configure OAuth2

1. Go to **OAuth2** section
2. Add redirect:

**Development:**
```
http://localhost:3000/api/auth/callback/discord
```

**Production:**
```
https://yourdomain.com/api/auth/callback/discord
```

### 3. Get Credentials

From **OAuth2** page:
- Client ID
- Client Secret

### 4. Add to Environment

```env
DISCORD_CLIENT_ID="123456789..."
DISCORD_CLIENT_SECRET="abc123..."
```

## Twitter/X OAuth

### 1. Create App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Navigate to app settings

### 2. Configure OAuth 2.0

1. Enable OAuth 2.0
2. Set callback URL:

**Development:**
```
http://localhost:3000/api/auth/callback/twitter
```

**Production:**
```
https://yourdomain.com/api/auth/callback/twitter
```

### 3. Get Credentials

From **Keys and tokens**:
- Client ID
- Client Secret

### 4. Add to Environment

```env
TWITTER_CLIENT_ID="abc123..."
TWITTER_CLIENT_SECRET="abc123..."
```

## Testing OAuth Flow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Sign-In Button

```typescript
<button onClick={() => signIn.social({ provider: 'google' })}>
  Sign in with Google
</button>
```

### 3. Verify Redirect

- Should redirect to provider's consent screen
- After approval, redirects to callback URL
- Should create user and session in database

### 4. Check Database

```bash
npx drizzle-kit studio
```

Verify:
- New user in `user` table
- Account in `account` table with provider info
- Active session in `session` table

## Common Issues

### Redirect URI Mismatch

**Error:** "redirect_uri_mismatch"

**Solutions:**
- Ensure exact match (including protocol, port, path)
- Check for trailing slashes
- Verify both development and production URLs are added

### Invalid Client

**Error:** "invalid_client"

**Solutions:**
- Verify client ID and secret are correct
- Check for extra spaces in .env file
- Restart development server after adding credentials

### Scope Issues

**Error:** "insufficient_scope"

**Solutions:**
- Add required scopes in OAuth provider console
- For Google: `email`, `profile`, `openid`
- For GitHub: `user:email`
- For Microsoft: `User.Read`, `email`, `profile`

## Production Checklist

- [ ] Update redirect URIs to production domain
- [ ] Use production OAuth credentials (separate from dev)
- [ ] Enable HTTPS
- [ ] Set secure cookies
- [ ] Update `BETTER_AUTH_URL` to production URL
- [ ] Test OAuth flow on production
- [ ] Verify user data is saved correctly
- [ ] Check session persistence

## Security Best Practices

1. **Use separate credentials for dev/prod**
2. **Never commit .env files**
3. **Rotate secrets regularly**
4. **Use HTTPS in production**
5. **Validate redirect URIs**
6. **Implement CSRF protection** (built into Better Auth)
7. **Store secrets in environment variables**
8. **Use secure cookie settings in production**
