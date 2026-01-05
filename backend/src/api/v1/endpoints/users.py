"""User profile endpoints."""
from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from src.api.deps import CurrentUser
from src.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


class UserProfile(BaseModel):
    """User profile response."""

    user_id: str = Field(
        ...,
        description="User identifier from JWT token"
    )
    authenticated: bool = Field(
        default=True,
        description="Authentication status"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123abc",
                "authenticated": True
            }
        }


@router.get(
    "/users/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    tags=["Users"],
    summary="Get current user profile"
)
async def get_current_user_profile(current_user: CurrentUser):
    """
    Get authenticated user's profile.

    Returns the user ID from the JWT token.

    Args:
        current_user: Authenticated user ID from JWT token

    Returns:
        User profile with user_id
    """
    logger.debug("Fetching user profile", user_id=current_user)

    return UserProfile(
        user_id=current_user,
        authenticated=True
    )
