"""Pydantic schemas for idea request/response validation."""
from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field, field_validator

from src.models.idea import StageEnum, PriorityEnum


class IdeaBase(BaseModel):
    """Base idea schema with common fields."""
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Idea title or headline"
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Detailed notes or description"
    )
    stage: StageEnum = Field(
        default=StageEnum.IDEA,
        description="Current stage in content development pipeline"
    )
    priority: PriorityEnum = Field(
        default=PriorityEnum.MEDIUM,
        description="Priority level for ranking importance"
    )
    tags: list[str] = Field(
        default_factory=list,
        description="Content type tags"
    )
    due_date: Optional[datetime] = Field(
        default=None,
        description="Optional deadline (ISO 8601 UTC)"
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty or whitespace only."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class IdeaCreate(IdeaBase):
    """Schema for creating a new idea."""
    pass


class IdeaUpdate(BaseModel):
    """Schema for updating an existing idea (partial updates allowed)."""
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Idea title or headline"
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Detailed notes or description"
    )
    stage: Optional[StageEnum] = Field(
        default=None,
        description="Current stage in content development pipeline"
    )
    priority: Optional[PriorityEnum] = Field(
        default=None,
        description="Priority level for ranking importance"
    )
    tags: Optional[list[str]] = Field(
        default=None,
        description="Content type tags"
    )
    due_date: Optional[datetime] = Field(
        default=None,
        description="Optional deadline (ISO 8601 UTC)"
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate title is not empty or whitespace only if provided."""
        if v is not None and (not v or not v.strip()):
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip() if v else None


class IdeaResponse(IdeaBase):
    """Schema for idea response with database fields."""
    id: UUID = Field(
        ...,
        description="Unique identifier for the idea"
    )
    user_id: str = Field(
        ...,
        description="User identifier from JWT token"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when idea was created (UTC)"
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp when idea was last modified (UTC)"
    )

    class Config:
        from_attributes = True
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


class IdeaListResponse(BaseModel):
    """Schema for paginated list of ideas."""
    items: list[IdeaResponse] = Field(
        ...,
        description="List of ideas"
    )
    total: int = Field(
        ...,
        description="Total number of ideas",
        ge=0
    )
    limit: int = Field(
        ...,
        description="Maximum items per page",
        ge=1,
        le=100
    )
    offset: int = Field(
        ...,
        description="Number of items skipped",
        ge=0
    )
    has_more: bool = Field(
        ...,
        description="Whether more items exist beyond current page"
    )
