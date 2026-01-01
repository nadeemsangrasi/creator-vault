# Drizzle ORM Setup Guide

## Installation

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

## Database Client Configuration

### Neon PostgreSQL Setup

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
  schema
});
```

### Alternative: Neon Serverless

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });
```

### Alternative: Node-Postgres

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
```

## Drizzle Config File

### Basic Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### With Environment Variables

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### Multiple Schema Files

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    './src/db/schema/users.ts',
    './src/db/schema/posts.ts',
    './src/db/schema/auth.ts',
  ],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Migration Commands

### Generate Migration

Creates migration files based on schema changes:

```bash
npx drizzle-kit generate
```

Output:
```
drizzle/
├── 0000_initial.sql
├── 0001_add_username.sql
└── meta/
    └── _journal.json
```

### Push to Database (Development)

Applies schema changes directly without migration files:

```bash
npx drizzle-kit push
```

**Use for:**
- Rapid development
- Schema prototyping
- When you don't need migration history

**Don't use for:**
- Production databases
- When you need rollback capability
- Team collaboration

### Apply Migrations (Production)

Run migrations programmatically:

```typescript
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
```

Run with:
```bash
tsx src/db/migrate.ts
# or
node --loader tsx src/db/migrate.ts
```

### Drizzle Studio

Visual database browser:

```bash
npx drizzle-kit studio
```

Opens at: `https://local.drizzle.studio`

Features:
- Browse tables and data
- Run queries
- Edit records
- View schema
- No database connection needed (uses local)

### Check Command

Validate schema and show SQL:

```bash
npx drizzle-kit check
```

### Drop Command

Drop database and start fresh (⚠️ DESTRUCTIVE):

```bash
npx drizzle-kit drop
```

## Package.json Scripts

Add these scripts for convenience:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "db:check": "drizzle-kit check",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

## Database Queries

### Basic CRUD Operations

```typescript
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Create
const newUser = await db.insert(user).values({
  id: 'user_123',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}).returning();

// Read
const users = await db.select().from(user);
const oneUser = await db.select().from(user).where(eq(user.id, 'user_123'));

// Update
await db.update(user)
  .set({ name: 'Jane Doe' })
  .where(eq(user.id, 'user_123'));

// Delete
await db.delete(user).where(eq(user.id, 'user_123'));
```

### With Relations

```typescript
import { db } from '@/db';
import { user, session } from '@/db/schema';

// Get user with sessions
const userWithSessions = await db.query.user.findFirst({
  where: eq(user.id, 'user_123'),
  with: {
    sessions: true,
  },
});
```

### Transactions

```typescript
import { db } from '@/db';
import { user, account } from '@/db/schema';

await db.transaction(async (tx) => {
  const newUser = await tx.insert(user).values({...}).returning();

  await tx.insert(account).values({
    userId: newUser[0].id,
    providerId: 'google',
    accountId: 'google_123',
  });
});
```

## Environment Setup

### Development (.env.local)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Production (.env.production)

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

### Neon Connection String Format

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Example:
```
postgresql://myuser:mypassword@ep-cool-darkness-123456.us-east-2.aws.neon.tech/mydb?sslmode=require
```

## Seeding Database

### Create Seed Script

```typescript
// src/db/seed.ts
import { db } from './index';
import { user } from './schema';

async function seed() {
  console.log('Seeding database...');

  const users = await db.insert(user).values([
    {
      id: 'user_1',
      name: 'Alice',
      email: 'alice@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user_2',
      name: 'Bob',
      email: 'bob@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]).returning();

  console.log(`Created ${users.length} users`);
  console.log('Seeding complete!');
}

seed()
  .catch((err) => {
    console.error('Seeding failed!', err);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
```

Run:
```bash
npm run db:seed
```

## TypeScript Configuration

Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Common Patterns

### Connection Pooling

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
```

### Query Logging

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
  logger: true, // Enable query logging
});
```

### Prepared Statements

```typescript
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

const prepared = db.select()
  .from(user)
  .where(eq(user.email, placeholder('email')))
  .prepare('find_user_by_email');

const result = await prepared.execute({ email: 'john@example.com' });
```

## Troubleshooting

### Issue: "Cannot find module 'drizzle-orm'"

**Solution:**
```bash
npm install drizzle-orm @neondatabase/serverless
```

### Issue: "Invalid connection string"

**Solution:**
Check DATABASE_URL format:
```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
```

### Issue: "SSL connection required"

**Solution:**
Add `?sslmode=require` to connection string for Neon.

### Issue: "Migration failed"

**Solution:**
1. Check schema syntax
2. Verify database connection
3. Run `npx drizzle-kit check`
4. Drop and recreate (development only):
   ```bash
   npx drizzle-kit drop
   npx drizzle-kit push
   ```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Use prepared statements** for repeated queries
3. **Enable connection pooling** for better performance
4. **Generate migrations** for production (don't use push)
5. **Use Drizzle Studio** for database inspection
6. **Keep schema in separate files** for large projects
7. **Use type exports** for consistency
8. **Add indexes** for frequently queried fields
9. **Enable query logging** in development
10. **Use relations** for complex queries
