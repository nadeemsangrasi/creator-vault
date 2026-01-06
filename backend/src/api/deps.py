"""FastAPI route dependencies for authentication and database access."""
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_session
from src.core.security import extract_user_id
from src.core.logging import get_logger

logger = get_logger(__name__)

# HTTP Bearer token security scheme
bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]
) -> str:
    """
    Extract and verify JWT token, return authenticated user_id.

    This dependency:
    1. Extracts Bearer token from Authorization header
    2. Verifies JWT signature using RS256 with Better Auth public key
    3. Validates issuer, audience, and expiration
    4. Returns user_id from 'sub' claim

    Args:
        credentials: HTTP Authorization credentials with Bearer token

    Returns:
        str: Authenticated user_id from JWT 'sub' claim

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    try:
        token = credentials.credentials
        user_id = extract_user_id(token)
        logger.debug("User authenticated", user_id=user_id)
        return user_id
    except HTTPException:
        # Re-raise HTTP exceptions from security module
        raise
    except Exception as e:
        logger.error("Authentication failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Type aliases for dependency injection
CurrentUser = Annotated[str, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_session)]
