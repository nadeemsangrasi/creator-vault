"""Idea service for business logic and authorization."""
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import Optional
from fastapi import HTTPException, status

from src.models.idea import Idea, StageEnum, PriorityEnum
from src.repositories.idea_repository import IdeaRepository
from src.schemas.idea import IdeaCreate, IdeaUpdate, IdeaResponse, IdeaListResponse
from src.core.logging import get_logger

logger = get_logger(__name__)


class IdeaService:
    """Business logic for idea operations."""

    def __init__(self, repository: IdeaRepository):
        """Initialize service with repository."""
        self.repository = repository

    async def create_idea(self, user_id: str, idea_data: IdeaCreate) -> IdeaResponse:
        """
        Create new idea for user.

        Args:
            user_id: Authenticated user ID from JWT
            idea_data: Idea creation data

        Returns:
            Created idea response

        Raises:
            HTTPException: If validation fails
        """
        # Create idea instance (convert tags list to comma-separated string)
        idea = Idea(
            id=uuid4(),
            user_id=user_id,
            title=idea_data.title,
            notes=idea_data.notes,
            stage=idea_data.stage,
            priority=idea_data.priority,
            tags=",".join(idea_data.tags) if idea_data.tags else "",
            due_date=idea_data.due_date,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        # Save to database
        created_idea = await self.repository.create(idea)

        logger.info("Idea created", idea_id=str(created_idea.id), user_id=user_id)

        return IdeaResponse.model_validate(created_idea)

    async def get_idea(self, idea_id: UUID, user_id: str) -> IdeaResponse:
        """
        Get idea by ID with authorization check.

        Args:
            idea_id: Idea UUID
            user_id: Authenticated user ID from JWT

        Returns:
            Idea response

        Raises:
            HTTPException: 404 if not found, 403 if not authorized
        """
        idea = await self.repository.get_by_id_and_user(idea_id, user_id)

        if not idea:
            logger.warning("Idea not found or unauthorized", idea_id=str(idea_id), user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Idea {idea_id} not found"
            )

        return IdeaResponse.model_validate(idea)

    async def list_ideas(
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
    ) -> IdeaListResponse:
        """
        List ideas for user with filtering and pagination.

        Args:
            user_id: Authenticated user ID from JWT
            limit: Maximum results per page (1-100)
            offset: Number of results to skip
            search: Keyword search
            stage: Filter by stage
            priority: Filter by priority
            tags: Filter by tags
            sort_by: Sort field
            sort_order: Sort order (asc/desc)

        Returns:
            Paginated list of ideas
        """
        # Enforce limit bounds
        limit = max(1, min(limit, 100))

        # Get ideas
        ideas = await self.repository.get_by_user(
            user_id=user_id,
            limit=limit,
            offset=offset,
            search=search,
            stage=stage,
            priority=priority,
            tags=tags,
            sort_by=sort_by,
            sort_order=sort_order
        )

        # Get total count
        total = await self.repository.count_by_user(
            user_id=user_id,
            search=search,
            stage=stage,
            priority=priority,
            tags=tags
        )

        # Convert to response schemas
        idea_responses = [IdeaResponse.model_validate(idea) for idea in ideas]

        return IdeaListResponse(
            items=idea_responses,
            total=total,
            limit=limit,
            offset=offset,
            has_more=(offset + len(ideas)) < total
        )

    async def update_idea(
        self,
        idea_id: UUID,
        user_id: str,
        update_data: IdeaUpdate
    ) -> IdeaResponse:
        """
        Update idea with authorization check.

        Args:
            idea_id: Idea UUID
            user_id: Authenticated user ID from JWT
            update_data: Fields to update

        Returns:
            Updated idea response

        Raises:
            HTTPException: 404 if not found, 403 if not authorized
        """
        # Get existing idea
        idea = await self.repository.get_by_id_and_user(idea_id, user_id)

        if not idea:
            logger.warning("Idea not found for update", idea_id=str(idea_id), user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Idea {idea_id} not found"
            )

        # Update fields (only non-None values)
        update_dict = update_data.model_dump(exclude_unset=True)

        # Convert tags list to comma-separated string if provided
        if "tags" in update_dict and update_dict["tags"] is not None:
            update_dict["tags"] = ",".join(update_dict["tags"]) if update_dict["tags"] else ""

        for field, value in update_dict.items():
            setattr(idea, field, value)

        # Update timestamp
        idea.updated_at = datetime.now(timezone.utc)

        # Save changes
        updated_idea = await self.repository.update(idea)

        logger.info("Idea updated", idea_id=str(idea_id), user_id=user_id)

        return IdeaResponse.model_validate(updated_idea)

    async def delete_idea(self, idea_id: UUID, user_id: str) -> None:
        """
        Delete idea with authorization check.

        Args:
            idea_id: Idea UUID
            user_id: Authenticated user ID from JWT

        Raises:
            HTTPException: 404 if not found, 403 if not authorized
        """
        deleted = await self.repository.delete_by_id_and_user(idea_id, user_id)

        if not deleted:
            logger.warning("Idea not found for deletion", idea_id=str(idea_id), user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Idea {idea_id} not found"
            )

        logger.info("Idea deleted", idea_id=str(idea_id), user_id=user_id)
