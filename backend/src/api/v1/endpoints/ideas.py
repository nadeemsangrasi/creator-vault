"""Ideas API endpoints for CRUD operations."""
from uuid import UUID
from typing import Optional, Annotated
from fastapi import APIRouter, Path, Query, status, HTTPException

from src.api.deps import CurrentUser, DatabaseSession
from src.models.idea import StageEnum, PriorityEnum
from src.repositories.idea_repository import IdeaRepository
from src.services.idea_service import IdeaService
from src.schemas.idea import IdeaCreate, IdeaUpdate, IdeaResponse, IdeaListResponse
from src.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


def get_idea_service(db: DatabaseSession) -> IdeaService:
    """Dependency to get idea service with repository."""
    repository = IdeaRepository(db)
    return IdeaService(repository)


@router.post(
    "/{user_id}/ideas",
    response_model=IdeaResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Ideas"],
    summary="Create a new content idea",
    responses={
        201: {
            "description": "Idea created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "user_id": "user_123abc",
                        "title": "Top 5 AI Writing Tools for 2026",
                        "notes": "Compare ChatGPT, Claude, Jasper, Copy.ai, and Writesonic.",
                        "stage": "idea",
                        "priority": "high",
                        "tags": ["blog", "ai", "tools"],
                        "due_date": "2026-01-15T00:00:00Z",
                        "created_at": "2026-01-05T10:30:00Z",
                        "updated_at": "2026-01-05T10:30:00Z"
                    }
                }
            }
        },
        403: {"description": "Cannot create ideas for other users"}
    }
)
async def create_idea(
    user_id: Annotated[str, Path(description="User ID from URL path")],
    current_user: CurrentUser,
    idea_data: IdeaCreate,
    db: DatabaseSession
):
    """
    Create a new content idea.

    Requires authentication. User can only create ideas for themselves.

    Args:
        user_id: User ID from URL path
        current_user: Authenticated user ID from JWT token
        idea_data: Idea creation data
        db: Database session

    Returns:
        Created idea

    Raises:
        403: If path user_id doesn't match authenticated user
    """
    # Authorization: verify path user_id matches authenticated user
    if user_id != current_user:
        logger.warning(
            "Authorization failed: user_id mismatch",
            path_user_id=user_id,
            token_user_id=current_user
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create ideas for other users"
        )

    service = get_idea_service(db)
    return await service.create_idea(current_user, idea_data)


@router.get(
    "/{user_id}/ideas",
    response_model=IdeaListResponse,
    status_code=status.HTTP_200_OK,
    tags=["Ideas"],
    summary="List ideas with filtering and pagination"
)
async def list_ideas(
    user_id: Annotated[str, Path(description="User ID from URL path")],
    current_user: CurrentUser,
    db: DatabaseSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    search: Optional[str] = Query(None, description="Keyword search in title/notes"),
    stage: Optional[StageEnum] = Query(None, description="Filter by stage"),
    priority: Optional[PriorityEnum] = Query(None, description="Filter by priority"),
    tags: Optional[str] = Query(None, description="Comma-separated tags to filter"),
    sort: Annotated[str, Query(pattern="^(created_at|updated_at|title|priority|stage)$")] = "created_at",
    order: Annotated[str, Query(pattern="^(asc|desc)$")] = "desc"
):
    """
    List ideas with filtering, search, sorting, and pagination.

    Requires authentication. User can only list their own ideas.

    Args:
        user_id: User ID from URL path
        current_user: Authenticated user ID from JWT token
        db: Database session
        limit: Maximum results per page (1-100, default 20)
        offset: Number of results to skip (default 0)
        search: Keyword search in title and notes
        stage: Filter by stage (idea/outline/draft/published)
        priority: Filter by priority (high/medium/low)
        tags: Comma-separated tags (OR logic)
        sort: Sort field (created_at/updated_at/title/priority/stage)
        order: Sort order (asc/desc)

    Returns:
        Paginated list of ideas

    Raises:
        403: If path user_id doesn't match authenticated user
    """
    # Authorization check
    if user_id != current_user:
        logger.warning(
            "Authorization failed: user_id mismatch",
            path_user_id=user_id,
            token_user_id=current_user
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other users' ideas"
        )

    # Parse tags from comma-separated string
    tags_list = [tag.strip() for tag in tags.split(",")] if tags else None

    service = get_idea_service(db)
    return await service.list_ideas(
        user_id=current_user,
        limit=limit,
        offset=offset,
        search=search,
        stage=stage,
        priority=priority,
        tags=tags_list,
        sort_by=sort,
        sort_order=order
    )


@router.get(
    "/{user_id}/ideas/{idea_id}",
    response_model=IdeaResponse,
    status_code=status.HTTP_200_OK,
    tags=["Ideas"]
)
async def get_idea(
    user_id: Annotated[str, Path(description="User ID from URL path")],
    idea_id: Annotated[UUID, Path(description="Idea UUID")],
    current_user: CurrentUser,
    db: DatabaseSession
):
    """
    Get idea by ID.

    Requires authentication. User can only access their own ideas.

    Args:
        user_id: User ID from URL path
        idea_id: Idea UUID
        current_user: Authenticated user ID from JWT token
        db: Database session

    Returns:
        Idea details

    Raises:
        403: If path user_id doesn't match authenticated user
        404: If idea not found
    """
    # Authorization check
    if user_id != current_user:
        logger.warning(
            "Authorization failed: user_id mismatch",
            path_user_id=user_id,
            token_user_id=current_user
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other users' ideas"
        )

    service = get_idea_service(db)
    return await service.get_idea(idea_id, current_user)


@router.patch(
    "/{user_id}/ideas/{idea_id}",
    response_model=IdeaResponse,
    status_code=status.HTTP_200_OK,
    tags=["Ideas"]
)
async def update_idea_partial(
    user_id: Annotated[str, Path(description="User ID from URL path")],
    idea_id: Annotated[UUID, Path(description="Idea UUID")],
    current_user: CurrentUser,
    update_data: IdeaUpdate,
    db: DatabaseSession
):
    """
    Partially update idea (PATCH - only provided fields are updated).

    Requires authentication. User can only update their own ideas.

    Args:
        user_id: User ID from URL path
        idea_id: Idea UUID
        current_user: Authenticated user ID from JWT token
        update_data: Fields to update
        db: Database session

    Returns:
        Updated idea

    Raises:
        403: If path user_id doesn't match authenticated user
        404: If idea not found
    """
    # Authorization check
    if user_id != current_user:
        logger.warning(
            "Authorization failed: user_id mismatch",
            path_user_id=user_id,
            token_user_id=current_user
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other users' ideas"
        )

    service = get_idea_service(db)
    return await service.update_idea(idea_id, current_user, update_data)


@router.put(
    "/{user_id}/ideas/{idea_id}",
    response_model=IdeaResponse,
    status_code=status.HTTP_200_OK,
    tags=["Ideas"]
)
async def update_idea_full(
    user_id: Annotated[str, Path(description="User ID from URL path")],
    idea_id: Annotated[UUID, Path(description="Idea UUID")],
    current_user: CurrentUser,
    update_data: IdeaCreate,
    db: DatabaseSession
):
    """
    Fully update/replace idea (PUT - all fields must be provided).

    Requires authentication. User can only update their own ideas.

    Args:
        user_id: User ID from URL path
        idea_id: Idea UUID
        current_user: Authenticated user ID from JWT token
        update_data: Complete idea data
        db: Database session

    Returns:
        Updated idea

    Raises:
        403: If path user_id doesn't match authenticated user
        404: If idea not found
    """
    # Authorization check
    if user_id != current_user:
        logger.warning(
            "Authorization failed: user_id mismatch",
            path_user_id=user_id,
            token_user_id=current_user
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other users' ideas"
        )

    # Convert IdeaCreate to IdeaUpdate (all fields present)
    update = IdeaUpdate(**update_data.model_dump())

    service = get_idea_service(db)
    return await service.update_idea(idea_id, current_user, update)


@router.delete(
    "/{user_id}/ideas/{idea_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Ideas"]
)
async def delete_idea(
    user_id: Annotated[str, Path(description="User ID from URL path")],
    idea_id: Annotated[UUID, Path(description="Idea UUID")],
    current_user: CurrentUser,
    db: DatabaseSession
):
    """
    Delete idea.

    Requires authentication. User can only delete their own ideas.

    Args:
        user_id: User ID from URL path
        idea_id: Idea UUID
        current_user: Authenticated user ID from JWT token
        db: Database session

    Returns:
        204 No Content on success

    Raises:
        403: If path user_id doesn't match authenticated user
        404: If idea not found
    """
    # Authorization check
    if user_id != current_user:
        logger.warning(
            "Authorization failed: user_id mismatch",
            path_user_id=user_id,
            token_user_id=current_user
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete other users' ideas"
        )

    service = get_idea_service(db)
    await service.delete_idea(idea_id, current_user)
