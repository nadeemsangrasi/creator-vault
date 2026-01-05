"""Idea SQLModel for content idea management."""
from datetime import datetime, timezone
from enum import Enum
from uuid import UUID
from typing import Optional
from sqlmodel import Field, SQLModel, Column, JSON


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
    """Content idea database model with workflow tracking."""

    __tablename__ = "ideas"

    # Primary Key
    id: UUID = Field(
        default=None,
        primary_key=True,
        nullable=False,
        description="Unique identifier for the idea"
    )

    # Foreign Key (external user reference from Better Auth)
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

    notes: Optional[str] = Field(
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

    due_date: Optional[datetime] = Field(
        default=None,
        description="Optional deadline for content completion (ISO 8601 UTC)"
    )

    # Audit Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        description="Timestamp when idea was created (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        description="Timestamp when idea was last modified (UTC)"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user_123abc",
                "title": "Top 5 AI Writing Tools for 2026",
                "notes": "Compare ChatGPT, Claude, Jasper, Copy.ai, and Writesonic.",
                "stage": "outline",
                "priority": "high",
                "tags": ["blog", "ai", "tools"],
                "due_date": "2026-01-15T00:00:00Z",
                "created_at": "2026-01-05T10:30:00Z",
                "updated_at": "2026-01-05T14:22:00Z"
            }
        }
