# ChatKit Deployment Guide

## Overview

Deploy ChatKit applications to production with proper authentication, security, performance, and observability.

## Deployment Architecture

### Standard Deployment

```
┌─────────────────┐
│   Next.js App   │
│  (Frontend)     │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  API Gateway    │
│  (Rate Limit)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Session Endpoint│
│ (Backend)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  OpenAI API     │
│  (ChatKit)      │
└─────────────────┘
```

## Development Environment

### Local Development Setup

```bash
# Install dependencies
npm install

# Create .env.local
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
SESSION_SECRET=your-secret-key
EOF

# Run development server
npm run dev

# Access at http://localhost:3000
```

### Development Configuration

```typescript
// lib/config.ts
export const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    logLevel: 'debug',
    enableMocking: true,
    cacheTTL: 0, // No caching
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    logLevel: 'info',
    enableMocking: false,
    cacheTTL: 3600,
  },
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config];
};
```

## Building for Production

### Next.js Build

```bash
# Build optimized bundle
npm run build

# Check output size
npm run analyze

# Local production test
npm run build && npm start
```

### Build Configuration

```javascript
// next.config.js
export default {
  // Enable image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.openai.com',
      },
    ],
  },

  // Enable compression
  compress: true,

  // Generate source maps (remove for production)
  productionBrowserSourceMaps: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  chatkit-app:
    build: .
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SESSION_SECRET: ${SESSION_SECRET}
      NEXT_PUBLIC_API_URL: https://yourdomain.com
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - chatkit-network

  nginx:
    image: nginx:alpine
    ports:
      - '443:443'
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - chatkit-app
    networks:
      - chatkit-network

networks:
  chatkit-network:
    driver: bridge
```

### Nginx Configuration

```nginx
upstream chatkit_app {
  server chatkit-app:3000;
}

server {
  listen 80;
  server_name _;

  # Redirect to HTTPS
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/nginx/certs/cert.pem;
  ssl_certificate_key /etc/nginx/certs/key.pem;

  # SSL/TLS Configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
  limit_req zone=api_limit burst=20 nodelay;

  location / {
    proxy_pass http://chatkit_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # Cache static assets
  location /_next/static {
    proxy_pass http://chatkit_app;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location /public {
    proxy_pass http://chatkit_app;
    expires 30d;
    add_header Cache-Control "public";
  }
}
```

## Vercel Deployment

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Environment Variables

```bash
# Set in Vercel dashboard or via CLI
vercel env add OPENAI_API_KEY
vercel env add SESSION_SECRET
vercel env add NEXT_PUBLIC_API_URL
```

### Deployment

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel deploy --prod
```

## Security Checklist

### HTTPS/TLS

- [x] Enable HTTPS for all endpoints
- [x] Use TLS 1.2 or higher
- [x] Configure strong ciphers
- [x] Set HSTS header
- [x] Renew certificates regularly

### Authentication

- [x] Verify user authentication on session endpoint
- [x] Use secure session secrets
- [x] Implement token rotation
- [x] Add rate limiting on session creation
- [x] Log authentication events

### API Security

- [x] Validate all user input
- [x] Sanitize API responses
- [x] Implement CORS properly
- [x] Use API keys securely
- [x] Add request signatures

### Environment

- [x] Use environment variables for secrets
- [x] Never commit `.env` files
- [x] Rotate API keys regularly
- [x] Use separate keys for dev/prod
- [x] Enable audit logging

## Performance Optimization

### Caching Strategy

```typescript
// Cache session endpoint responses
export async function POST(req: Request) {
  const cacheKey = `session:${userId}`;
  const cached = await redis.get(cacheKey);

  if (cached && !isExpired(cached)) {
    return Response.json(JSON.parse(cached));
  }

  // Create new session
  const session = await openai.chatkit.sessions.create({ user_id: userId });

  // Cache for 30 minutes
  await redis.setex(cacheKey, 1800, JSON.stringify(session));

  return Response.json(session);
}
```

### CDN Configuration

```typescript
// next.config.js
export default {
  // Optimize images with Vercel/Cloudflare CDN
  images: {
    domains: ['cdn.yourdomain.com'],
    loader: 'custom',
    loaderFile: './image-loader.ts',
  },

  // Cache static files
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};
```

### Database Connection Pooling

```typescript
// With Neon serverless PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

## Monitoring and Observability

### Logging

```typescript
import structlog from 'structlog';

const logger = structlog.get_logger();

// Log session creation
logger.info('session_created', {
  user_id: userId,
  timestamp: new Date().toISOString(),
  ip: request.ip,
});

// Log errors
logger.error('session_failed', {
  user_id: userId,
  error: error.message,
  stack: error.stack,
});
```

### Error Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### Metrics Collection

```typescript
// Custom metrics
import { StatsD } from 'statsd-client';

const statsd = new StatsD({
  host: 'metrics.yourdomain.com',
  port: 8125,
});

// Track session creation latency
const start = Date.now();
const session = await openai.chatkit.sessions.create({ user_id });
const duration = Date.now() - start;

statsd.timing('chatkit.session.create', duration);
statsd.increment('chatkit.session.created');
```

## Scaling

### Horizontal Scaling

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatkit-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatkit-app
  template:
    metadata:
      labels:
        app: chatkit-app
    spec:
      containers:
      - name: chatkit-app
        image: yourregistry.azurecr.io/chatkit-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secrets
              key: api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: chatkit-app-service
spec:
  selector:
    app: chatkit-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 100 https://yourdomain.com/

# Using k6
k6 run load-test.js
```

### Load Test Script

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  let sessionRes = http.post(
    'https://yourdomain.com/api/chatkit/session',
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + __ENV.TOKEN,
      },
    }
  );

  check(sessionRes, {
    'session created': (r) => r.status === 200,
    'client_secret present': (r) => r.json('client_secret') !== null,
  });

  sleep(1);
}
```

## Rollback Strategy

### Blue-Green Deployment

```bash
# Run new version alongside old
docker service update --image yourregistry/chatkit:v2 chatkit-app-blue

# Test new version
curl https://blue.yourdomain.com/api/health

# If successful, switch traffic
nginx -s reload  # Switch Nginx to blue

# If failed, rollback
nginx -s reload  # Switch Nginx back to green
```

### Database Migrations

```bash
# Before deploying new version
npm run migrate:up

# If deployment fails, rollback
npm run migrate:down
```

## Post-Deployment

### Health Checks

```bash
# Check API health
curl https://yourdomain.com/api/health

# Check session endpoint
curl -X POST https://yourdomain.com/api/chatkit/session \
  -H "Authorization: Bearer $TOKEN"

# Check OpenAI connectivity
curl https://api.openai.com/v1/models
```

### Warm-up Connections

```typescript
// On deployment, warm up connections
async function warmupConnections() {
  const users = await db.users.findMany({ take: 10 });

  await Promise.all(
    users.map(user =>
      createSession(user.id)
        .then(() => console.log(`Warmed session for ${user.id}`))
        .catch(err => console.error('Warmup failed:', err))
    )
  );
}

// Call on startup
if (process.env.NODE_ENV === 'production') {
  warmupConnections();
}
```

