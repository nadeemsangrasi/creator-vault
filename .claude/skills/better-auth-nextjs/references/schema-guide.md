# Database Schema Guide

## Complete Schema Definition

### Full Schema for Better Auth

```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
});
```

## Schema with Plugins

### Two-Factor Authentication Tables

```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Existing tables...

export const twoFactor = pgTable('twoFactor', {
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  backupCodes: text('backupCodes').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});
```

### Username Plugin Tables

```typescript
// Extend user table
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  username: text('username').unique(), // Added for username plugin
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});
```

### Role-Based Access Control Schema

```typescript
import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin', 'moderator']);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});
```

## Schema Relations

### Define Relations for Type Safety

```typescript
import { relations } from 'drizzle-orm';

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
```

## Custom User Fields

### Extended User Schema

```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  // Required Better Auth fields
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),

  // Custom fields
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  phoneNumber: text('phoneNumber'),
  companyName: text('companyName'),
  jobTitle: text('jobTitle'),
});
```

## Migration Commands

### Generate Migration

```bash
npx drizzle-kit generate
```

This creates a migration file in `drizzle/` directory.

### Push to Database

```bash
npx drizzle-kit push
```

Applies schema changes directly without migrations (development only).

### Apply Migrations

```bash
npx drizzle-kit migrate
```

### Drizzle Studio

```bash
npx drizzle-kit studio
```

Opens visual database browser at `https://local.drizzle.studio`.

## Schema Best Practices

### 1. Always Use Cascading Deletes

```typescript
export const session = pgTable('session', {
  // ...
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});
```

### 2. Add Timestamps

```typescript
export const user = pgTable('user', {
  // ...
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
```

### 3. Use Appropriate Constraints

```typescript
export const user = pgTable('user', {
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
});
```

### 4. Index Frequently Queried Fields

```typescript
import { pgTable, text, index } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  // ...
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  usernameIdx: index('username_idx').on(table.username),
}));
```

## Schema Validation

### Type-Safe Schema Export

```typescript
// src/db/schema.ts
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const user = pgTable('user', {
  // ... schema definition
});

// Export types for use in your app
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
```

### Using Schema Types

```typescript
import { User } from '@/db/schema';

async function createUser(userData: NewUser): Promise<User> {
  const [user] = await db.insert(userTable).values(userData).returning();
  return user;
}
```

## Complete Schema with All Tables

```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User table
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Session table
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Account table (for OAuth and password)
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Verification table (for email verification, password reset)
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Type exports
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
```
