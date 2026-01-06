"""Idea repository for database operations with user scoping."""
from typing import Optional
from uuid import UUID
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.idea import Idea, StageEnum, PriorityEnum
from src.repositories.base_repository import BaseRepository


class IdeaRepository(BaseRepository[Idea]):
    """Repository for idea-specific database operations."""

    def __init__(self, session: AsyncSession):
        """Initialize idea repository with database session."""
        super().__init__(Idea, session)

    async def get_by_id_and_user(self, id: UUID, user_id: str) -> Optional[Idea]:
        """
        Get idea by ID with user scoping for authorization.

        Args:
            id: Idea UUID
            user_id: User ID from JWT token

        Returns:
            Idea instance or None if not found or not owned by user
        """
        result = await self.session.execute(
            select(Idea).where(Idea.id == id, Idea.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        search: Optional[str] = None,
        stage: Optional[StageEnum] = None,
        priority: Optional[PriorityEnum] = None,
        tags: Optional[list[str]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> list[Idea]:
        """
        Get ideas for user with filtering, search, and pagination.

        Args:
            user_id: User ID from JWT token
            limit: Maximum number of results (default 20, max 100)
            offset: Number of results to skip
            search: Keyword search in title and notes (case-insensitive)
            stage: Filter by stage
            priority: Filter by priority
            tags: Filter by tags (OR logic)
            sort_by: Field to sort by (created_at, updated_at, title, priority, stage)
            sort_order: Sort order (asc or desc)

        Returns:
            List of ideas matching criteria
        """
        query = select(Idea).where(Idea.user_id == user_id)

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Idea.title.ilike(search_pattern),
                    Idea.notes.ilike(search_pattern)
                )
            )

        # Apply stage filter
        if stage:
            query = query.where(Idea.stage == stage)

        # Apply priority filter
        if priority:
            query = query.where(Idea.priority == priority)

        # Apply tags filter (JSONB contains)
        if tags:
            for tag in tags:
                query = query.where(Idea.tags.contains([tag]))

        # Apply sorting
        sort_column = getattr(Idea, sort_by, Idea.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # Apply pagination
        query = query.limit(limit).offset(offset)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_by_user(
        self,
        user_id: str,
        search: Optional[str] = None,
        stage: Optional[StageEnum] = None,
        priority: Optional[PriorityEnum] = None,
        tags: Optional[list[str]] = None
    ) -> int:
        """
        Count ideas for user matching filters.

        Args:
            user_id: User ID from JWT token
            search: Keyword search in title and notes
            stage: Filter by stage
            priority: Filter by priority
            tags: Filter by tags

        Returns:
            Number of matching ideas
        """
        query = select(func.count()).select_from(Idea).where(Idea.user_id == user_id)

        # Apply same filters as get_by_user
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Idea.title.ilike(search_pattern),
                    Idea.notes.ilike(search_pattern)
                )
            )

        if stage:
            query = query.where(Idea.stage == stage)

        if priority:
            query = query.where(Idea.priority == priority)

        if tags:
            for tag in tags:
                query = query.where(Idea.tags.contains([tag]))

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def delete_by_id_and_user(self, id: UUID, user_id: str) -> bool:
        """
        Delete idea by ID with user authorization.

        Args:
            id: Idea UUID
            user_id: User ID from JWT token

        Returns:
            True if deleted, False if not found or not owned by user
        """
        idea = await self.get_by_id_and_user(id, user_id)
        if not idea:
            return False

        await self.session.delete(idea)
        await self.session.flush()
        return True
