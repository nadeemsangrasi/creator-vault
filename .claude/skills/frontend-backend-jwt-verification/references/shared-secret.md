# Shared Secret Configuration

## Overview

Both Better Auth (frontend) and FastAPI (backend) must use the **same secret key** for JWT signing and verification. This ensures tokens issued by Better Auth can be verified by FastAPI.

## Environment Variables

### Frontend (.env.local)

```env
# Required: Shared secret for signing JWTs
# Must be 32+ characters for HS256
BETTER_AUTH_SECRET=your-super-secret-key-here

# Optional: Configuration
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECURE=true
```

### Backend (.env)

```env
# Required: Same secret as BETTER_AUTH_SECRET
JWT_SECRET_KEY=your-super-secret-key-here

# Required: Must match Better Auth configuration
JWT_ALGORITHM=HS256
JWT_ISSUER=https://your-domain.com
JWT_AUDIENCE=https://api.your-domain.com

# Optional: Database
DATABASE_URL=postgresql://user:pass@localhost:5432/app
```

## Key Requirements

### Length Requirements

| Algorithm | Minimum Key Length |
|-----------|-------------------|
| HS256 | 32 characters (256 bits) |
| HS384 | 48 characters (384 bits) |
| HS512 | 64 characters (512 bits) |

### Generating a Secure Secret

```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## Configuration Files

### Frontend Configuration

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "https://your-domain.com",
      audience: ["https://api.your-domain.com"],
    }),
  ],
});
```

### Backend Configuration

```python
# app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    JWT_SECRET_KEY: str  # Must match BETTER_AUTH_SECRET
    JWT_ALGORITHM: str = "HS256"  # Must match Better Auth algorithm
    JWT_ISSUER: str = "https://your-domain.com"  # Must match
    JWT_AUDIENCE: str = "https://api.your-domain.com"  # Must match

    class Config:
        env_file = ".env"


settings = Settings()
```

## Production Setup

### Using a Password Manager

1. Generate a secure random secret
2. Store in password manager
3. Add to both frontend and backend environment variables
4. Never commit to version control

### Using Secrets Management

**AWS Secrets Manager:**
```bash
# Frontend (build time or runtime)
aws secretsmanager get-secret-value --secret-id better-auth-secret

# Backend (environment)
export JWT_SECRET_KEY=$(aws secretsmanager get-secret-value --secret-id better-auth-secret --query SecretString --output text | jq -r .secret)
```

**HashiCorp Vault:**
```bash
export JWT_SECRET_KEY=$(vault kv get -field=secret_key secret/better-auth)
```

**GitHub Secrets (for CI/CD):**
```yaml
# .github/workflows/deploy.yml
env:
  BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
  JWT_SECRET_KEY: ${{ secrets.BETTER_AUTH_SECRET }}
```

## Verification Steps

### 1. Verify Secret Matches

```bash
# Frontend
echo $BETTER_AUTH_SECRET

# Backend
echo $JWT_SECRET_KEY

# Should be identical
```

### 2. Test Token Verification

```bash
# On frontend, get token and decode
node -e "
const jwt = require('jsonwebtoken');
const token = 'eyJ...'; // Your token
const decoded = jwt.decode(token, { complete: true });
console.log(JSON.stringify(decoded.payload, null, 2));
"

# On backend, verify same token works
python -c "
import jwt
token = 'eyJ...'
decoded = jwt.decode(token, 'YOUR_SECRET', algorithms=['HS256'])
print(decoded)
"
```

### 3. Test Full Flow

```bash
# 1. Login on frontend (via browser)
# 2. Copy token from session
# 3. Test on backend
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/tasks
# Should return 200 with task data, not 401
```

## Common Issues

### Secret Mismatch

**Error:** `jwt.verify()` fails with signature mismatch

**Solution:**
```bash
# Compare secrets
diff <(echo $BETTER_AUTH_SECRET) <(echo $JWT_SECRET_KEY)
```

### Wrong Algorithm

**Error:** Algorithm mismatch

**Solution:** Ensure both use HS256 (default for both)

### Issuer/Audience Mismatch

**Error:** `iss` or `aud` claim validation fails

**Solution:** Configure issuer/audience consistently

## Security Best Practices

1. **Use strong secrets** - Minimum 32 random characters
2. **Never commit secrets** - Use .env files, gitignore
3. **Rotate periodically** - Plan for secret rotation
4. **Use HTTPS** - Never transmit tokens over HTTP
5. **Set reasonable expiry** - 7 days is common for web
6. **Monitor for leaks** - Log authentication failures
