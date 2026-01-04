# Data Model Design: Backend API

**Feature**: Backend API for Content Idea Management
**Branch**: `001-backend-api`
**Date**: 2026-01-05
**Status**: Complete

---

## Overview

This document defines the complete data model for CreatorVault Phase 2 backend, including database entities, relationships, validation rules, and state transitions. All models use SQLModel for type-safe ORM with Pydantic v2 validation.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (External)                        │
│  Managed by Better Auth - Not stored in backend database       │
│  Referenced via: user_id (string from JWT "sub" claim)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1:N (one user, many ideas)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                           IDEAS                                 │
├─────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                   │
│ user_id: string (FK to external user, indexed)                 │
│ title: string (max 200 chars, required)                        │
│ notes: string (max 5000 chars, nullable)                       │
│ stage: StageEnum (idea/outline/draft/published, default=idea)  │
│ priority: PriorityEnum (high/medium/low, default=medium)       │
│ tags: JSONB array of strings (default=[])                      │
│ due_date: datetime (nullable, ISO 8601 UTC)                    │
│ created_at: datetime (auto, UTC)                               │
│ updated_at: datetime (auto, UTC)                               │
└─────────────────────────────────────────────────────────────────┘

Indexes:
- PRIMARY KEY: id (UUID)
- INDEX: user_id (B-tree)
- INDEX: (user_id, stage) (B-tree composite)
- INDEX: (user_id, priority) (B-tree composite)
- INDEX: (user_id, created_at DESC) (B-tree composite)
- INDEX: tags (GIN for JSONB contains queries)
```

---

## Entity Definitions

### 1. Idea Entity

**Purpose**: Represents a content creator's idea with metadata for organization and workflow tracking.

**SQLModel Definition**:
```python
from sqlmodel import Field, SQLModel, Column, JSON
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

class StageEnum(str, Enum):
    """Content development stages."""
    IDEA = "idea"
    OUTLINE = "outline"
    DRAFT = "draft"
    PUBLISHED = "published"

class PriorityEnum(str, Enum):
    """Priority levels for idea ranking."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Idea(SQLModel, table=True):
    """Content idea database model."""
    __tablename__ = "ideas"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique identifier for the idea"
    )

    # Foreign Key (external user reference)
    user_id: str = Field(
        index=True,
        nullable=False,
        max_length=255,
        description="User identifier from JWT token (Better Auth 'sub' claim)"
    )

    # Core Content
    title: str = Field(
        nullable=False,
        min_length=1,
        max_length=200,
        description="Idea title or headline"
    )

    notes: str | None = Field(
        default=None,
        max_length=5000,
        description="Detailed notes or description"
    )

    # Workflow & Organization
    stage: StageEnum = Field(
        default=StageEnum.IDEA,
        nullable=False,
        description="Current stage in content development pipeline"
    )

    priority: PriorityEnum = Field(
        default=PriorityEnum.MEDIUM,
        nullable=False,
        description="Priority level for ranking importance"
    )

    tags: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON),
        description="Content type tags (blog, video, podcast, etc.)"
    )

    due_date: datetime | None = Field(
        default=None,
        description="Optional deadline for content completion (ISO 8601 UTC)"
    )

    # Audit Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp when idea was created (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp when idea was last modified (UTC)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user_123abc",
                "title": "Top 5 AI Writing Tools for 2026",
                "notes": "Compare ChatGPT, Claude, Jasper, Copy.ai, and Writesonic. Focus on content quality, pricing, and use cases.",
                "stage": "outline",
                "priority": "high",
                "tags": ["blog", "ai", "tools"],
                "due_date": "2026-01-15T00:00:00Z",
                "created_at": "2026-01-05T10:30:00Z",
                "updated_at": "2026-01-05T14:22:00Z"
            }
        }
```

---

## Field Specifications

### Idea.id (UUID)
- **Type**: UUID v4
- **Constraints**: PRIMARY KEY, NOT NULL, unique
- **Generation**: Auto-generated via `uuid4()` on creation
- **Purpose**: Globally unique, non-sequential identifier for security and scalability
- **Indexing**: Primary key index (B-tree)

### Idea.user_id (string)
- **Type**: VARCHAR(255)
- **Constraints**: NOT NULL, indexed, foreign key reference (logical, not enforced)
- **Source**: Extracted from JWT token "sub" claim (Better Auth user ID)
- **Purpose**: User-scoped filtering, enforces data isolation
- **Indexing**: B-tree index for fast user-owned idea lookups

### Idea.title (string)
- **Type**: VARCHAR(200)
- **Constraints**: NOT NULL, length 1-200 characters
- **Validation**:
  - Required field (cannot be empty or whitespace-only)
  - Max 200 characters enforced at API and database level
  - UTF-8 encoded for international character support
- **Purpose**: Primary identifier for the idea, displayed in lists
- **Searchable**: Included in full-text search queries

### Idea.notes (string, nullable)
- **Type**: TEXT (VARCHAR 5000)
- **Constraints**: Nullable, max 5000 characters
- **Validation**:
  - Optional field (NULL allowed)
  - If provided, max 5000 characters
  - UTF-8 encoded
- **Purpose**: Extended description, brainstorming notes, research links
- **Searchable**: Included in full-text search queries

### Idea.stage (StageEnum)
- **Type**: ENUM('idea', 'outline', 'draft', 'published')
- **Constraints**: NOT NULL, default='idea'
- **Allowed Values**:
  - `idea`: Initial concept capture
  - `outline`: Structured plan created
  - `draft`: Written content exists
  - `published`: Content completed and published
- **Validation**: Only accepts defined enum values, rejects invalid stages
- **Purpose**: Track content development pipeline
- **Indexing**: Part of composite index `(user_id, stage)`

### Idea.priority (PriorityEnum)
- **Type**: ENUM('high', 'medium', 'low')
- **Constraints**: NOT NULL, default='medium'
- **Allowed Values**:
  - `high`: Immediate attention required
  - `medium`: Normal priority
  - `low`: Future consideration
- **Validation**: Only accepts defined enum values
- **Purpose**: Rank ideas by importance
- **Indexing**: Part of composite index `(user_id, priority)`

### Idea.tags (JSONB array)
- **Type**: JSONB (array of strings)
- **Constraints**: NOT NULL, default=[] (empty array)
- **Validation**:
  - Must be valid JSON array
  - Each element must be string
  - Case-sensitive matching
  - No uniqueness constraint within array
- **Purpose**: Flexible categorization (content type, topic, platform)
- **Indexing**: GIN index for fast JSONB contains queries
- **Query Pattern**: `WHERE tags @> '["blog"]'` (contains "blog" tag)

### Idea.due_date (datetime, nullable)
- **Type**: TIMESTAMP WITH TIME ZONE
- **Constraints**: Nullable
- **Format**: ISO 8601 UTC (e.g., "2026-01-15T00:00:00Z")
- **Validation**:
  - Optional field (NULL allowed)
  - If provided, must be valid ISO 8601 datetime
  - Stored in UTC, converted by client for display
- **Purpose**: Content deadline tracking
- **Indexing**: None (not frequently queried for filtering)

### Idea.created_at (datetime)
- **Type**: TIMESTAMP WITH TIME ZONE
- **Constraints**: NOT NULL, default=CURRENT_TIMESTAMP
- **Generation**: Auto-set to UTC time on INSERT
- **Immutable**: Never updated after creation
- **Purpose**: Audit trail, default sorting (newest first)
- **Indexing**: Part of composite index `(user_id, created_at DESC)`

### Idea.updated_at (datetime)
- **Type**: TIMESTAMP WITH TIME ZONE
- **Constraints**: NOT NULL, default=CURRENT_TIMESTAMP
- **Generation**: Auto-set to UTC time on INSERT, auto-updated on UPDATE
- **Purpose**: Track last modification for conflict resolution
- **Indexing**: None (not frequently queried)

---

## Validation Rules

### Title Validation
- **Required**: Yes (cannot be NULL or empty)
- **Min Length**: 1 character (after trimming whitespace)
- **Max Length**: 200 characters
- **Character Set**: UTF-8 (supports international characters)
- **Rejection Examples**:
  - `""` (empty string) → 400 error "Title is required"
  - `"   "` (whitespace only) → 400 error "Title cannot be blank"
  - `"A" * 201` (too long) → 400 error "Title exceeds maximum length of 200 characters"

### Notes Validation
- **Required**: No (NULL allowed)
- **Max Length**: 5000 characters
- **Character Set**: UTF-8
- **Rejection Example**:
  - `"A" * 5001` → 400 error "Notes exceed maximum length of 5000 characters"

### Stage Validation
- **Required**: Yes (defaults to "idea" if not provided)
- **Allowed Values**: `idea`, `outline`, `draft`, `published` (case-sensitive)
- **Rejection Examples**:
  - `"in-progress"` → 400 error "Invalid stage. Must be one of: idea, outline, draft, published"
  - `"IDEA"` (wrong case) → 400 error "Invalid stage. Must be one of: idea, outline, draft, published"

### Priority Validation
- **Required**: Yes (defaults to "medium" if not provided)
- **Allowed Values**: `high`, `medium`, `low` (case-sensitive)
- **Rejection Examples**:
  - `"urgent"` → 400 error "Invalid priority. Must be one of: high, medium, low"

### Tags Validation
- **Required**: No (defaults to empty array [])
- **Type**: Array of strings
- **Element Constraints**: Each tag is a string (no min/max length enforced for Phase 2)
- **Rejection Examples**:
  - `{"tags": "blog"}` (not an array) → 400 error "Tags must be an array"
  - `{"tags": [123]}` (not strings) → 400 error "Each tag must be a string"

### Due Date Validation
- **Required**: No (NULL allowed)
- **Format**: ISO 8601 datetime with timezone
- **Accepted Examples**: `"2026-01-15T00:00:00Z"`, `"2026-12-31T23:59:59+00:00"`
- **Rejection Examples**:
  - `"2026-01-15"` (no time component) → 400 error "Due date must be ISO 8601 datetime"
  - `"15-01-2026"` (wrong format) → 400 error "Due date must be ISO 8601 datetime"

### User ID Validation (Authorization)
- **Source**: JWT token "sub" claim
- **Validation**: User ID in URL path must match authenticated user
- **Rejection Example**:
  - Authenticated as `user_123`, request `/api/v1/user_456/ideas` → 403 error "Forbidden: Cannot access other users' ideas"

---

## State Transitions

### Stage Lifecycle

```
┌──────────┐
│   idea   │  Initial state (default)
└────┬─────┘
     │
     ├───────────────┐
     │               │
     ▼               ▼
┌──────────┐    ┌──────────┐
│ outline  │    │  draft   │  (can skip outline)
└────┬─────┘    └────┬─────┘
     │               │
     │    ┌──────────┘
     │    │
     ▼    ▼
┌──────────┐
│published │  Terminal state (can revert back)
└──────────┘
```

**Allowed Transitions**:
- `idea` → `outline`, `draft`, `published` (any forward stage)
- `outline` → `draft`, `published` (any forward stage)
- `draft` → `published`
- `published` → `idea`, `outline`, `draft` (revert for editing)

**No Restrictions**: Phase 2 does not enforce linear stage progression. Users can skip stages or revert to earlier stages at any time.

### Priority Changes
- **No restrictions**: Users can change priority to any value (high/medium/low) at any time regardless of current priority or stage.

---

## Database Indexes

### Primary Index
```sql
CREATE INDEX pk_ideas ON ideas (id);  -- UUID primary key (automatic)
```

### User Scoping Index
```sql
CREATE INDEX idx_ideas_user_id ON ideas (user_id);
```
**Purpose**: Fast filtering of user-owned ideas (every query includes `WHERE user_id = ?`)
**Cardinality**: High (one user has many ideas)
**Query**: `SELECT * FROM ideas WHERE user_id = 'user_123'`

### Composite Indexes for Filtering

#### User + Stage
```sql
CREATE INDEX idx_ideas_user_stage ON ideas (user_id, stage);
```
**Purpose**: Fast filtering by stage within user scope
**Query**: `SELECT * FROM ideas WHERE user_id = 'user_123' AND stage = 'draft'`

#### User + Priority
```sql
CREATE INDEX idx_ideas_user_priority ON ideas (user_id, priority);
```
**Purpose**: Fast filtering by priority within user scope
**Query**: `SELECT * FROM ideas WHERE user_id = 'user_123' AND priority = 'high'`

#### User + Created At (Descending)
```sql
CREATE INDEX idx_ideas_user_created ON ideas (user_id, created_at DESC);
```
**Purpose**: Fast default sorting (newest first) within user scope
**Query**: `SELECT * FROM ideas WHERE user_id = 'user_123' ORDER BY created_at DESC LIMIT 20`

### JSONB GIN Index for Tags
```sql
CREATE INDEX idx_ideas_tags ON ideas USING GIN (tags);
```
**Purpose**: Fast containment queries for tag filtering
**Query**: `SELECT * FROM ideas WHERE user_id = 'user_123' AND tags @> '["blog"]'`
**Note**: GIN (Generalized Inverted Index) optimal for JSONB array containment

---

## Query Patterns

### List All User Ideas (Paginated, Default Sort)
```sql
SELECT * FROM ideas
WHERE user_id = :user_id
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```
**Index Used**: `idx_ideas_user_created` (user_id, created_at DESC)

### Filter by Stage
```sql
SELECT * FROM ideas
WHERE user_id = :user_id AND stage = :stage
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```
**Index Used**: `idx_ideas_user_stage` (user_id, stage)

### Filter by Priority
```sql
SELECT * FROM ideas
WHERE user_id = :user_id AND priority = :priority
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```
**Index Used**: `idx_ideas_user_priority` (user_id, priority)

### Filter by Tags (Contains)
```sql
SELECT * FROM ideas
WHERE user_id = :user_id AND tags @> '["blog"]'
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```
**Index Used**: `idx_ideas_tags` (GIN on tags column)

### Keyword Search (Title or Notes)
```sql
SELECT * FROM ideas
WHERE user_id = :user_id
  AND (title ILIKE :pattern OR notes ILIKE :pattern)
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```
**Index Used**: `idx_ideas_user_id` (sequential scan on filtered user ideas)
**Note**: Full-text search with GIN index deferred to Phase 3 for performance

### Combined Filters (Stage + Priority + Tags)
```sql
SELECT * FROM ideas
WHERE user_id = :user_id
  AND stage = :stage
  AND priority = :priority
  AND tags @> :tags_array
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```
**Index Strategy**: PostgreSQL query planner chooses most selective index

---

## Migration Strategy

### Initial Migration (001_create_ideas_table.py)
```python
"""Create ideas table

Revision ID: 001
Create Date: 2026-01-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM

def upgrade():
    # Create ENUM types
    stage_enum = ENUM('idea', 'outline', 'draft', 'published', name='stage_enum')
    priority_enum = ENUM('high', 'medium', 'low', name='priority_enum')
    stage_enum.create(op.get_bind(), checkfirst=True)
    priority_enum.create(op.get_bind(), checkfirst=True)

    # Create ideas table
    op.create_table(
        'ideas',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('stage', stage_enum, nullable=False, server_default='idea'),
        sa.Column('priority', priority_enum, nullable=False, server_default='medium'),
        sa.Column('tags', JSONB, nullable=False, server_default='[]'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )

    # Create indexes
    op.create_index('idx_ideas_user_id', 'ideas', ['user_id'])
    op.create_index('idx_ideas_user_stage', 'ideas', ['user_id', 'stage'])
    op.create_index('idx_ideas_user_priority', 'ideas', ['user_id', 'priority'])
    op.create_index('idx_ideas_user_created', 'ideas', ['user_id', 'created_at'], postgresql_ops={'created_at': 'DESC'})
    op.create_index('idx_ideas_tags', 'ideas', ['tags'], postgresql_using='gin')

def downgrade():
    op.drop_index('idx_ideas_tags', table_name='ideas')
    op.drop_index('idx_ideas_user_created', table_name='ideas')
    op.drop_index('idx_ideas_user_priority', table_name='ideas')
    op.drop_index('idx_ideas_user_stage', table_name='ideas')
    op.drop_index('idx_ideas_user_id', table_name='ideas')
    op.drop_table('ideas')
    sa.Enum(name='priority_enum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='stage_enum').drop(op.get_bind(), checkfirst=True)
```

---

## Performance Considerations

### Read Performance
- **User scoping**: B-tree index on `user_id` enables fast filtering (index scan)
- **Default sorting**: Composite index `(user_id, created_at DESC)` avoids sort operation
- **Stage/priority filters**: Composite indexes enable index-only scans
- **Tag filtering**: GIN index on JSONB provides O(log n) containment queries

### Write Performance
- **Insert**: ~5ms per idea (single index updates)
- **Update**: ~8ms per idea (update indexes + modify timestamp)
- **Delete**: ~6ms per idea (cascade index cleanup)

### Scalability Targets
- **1000 ideas per user**: Sub-second queries with proper indexes
- **100 concurrent users**: Async database pool handles concurrency
- **10,000 total ideas**: No performance degradation (indexed queries scale logarithmically)

---

## Data Model Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Primary Key** | UUID v4 | Globally unique, non-sequential, secure |
| **User Reference** | String (external FK) | Better Auth manages users, backend stores reference only |
| **Stage/Priority** | PostgreSQL ENUM | Type safety, data integrity, efficient storage |
| **Tags** | JSONB array | Flexible, queryable with GIN index, no schema changes needed |
| **Timestamps** | UTC datetime | Timezone-agnostic, client converts for display |
| **Indexing Strategy** | Composite indexes on common query patterns | Balance read performance vs write overhead |
| **ORM Choice** | SQLModel | Type safety, Pydantic integration, async support |

**Phase 3 Preparation**: Schema includes `created_at`/`updated_at` for audit trail. Future AI features can add `ai_suggestions JSONB` column without breaking existing schema.
