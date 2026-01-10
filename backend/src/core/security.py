"""JWT verification utilities for Better Auth integration."""
from typing import Any
from jose import JWTError, jwt
from fastapi import HTTPException, status

from src.core.config import get_settings
from src.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


def decode_jwt_token(token: str) -> dict[str, Any]:
    """
    Decode and verify JWT token from Better Auth using HS256 algorithm.

    Args:
        token: JWT token string from Authorization header

    Returns:
        dict: Decoded token payload with user_id in 'sub' claim

    Raises:
        HTTPException: If token is invalid, expired, or verification fails
    """
    try:
        # Better Auth uses HS256 algorithm with the same secret for signing and verification
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": False,
                "verify_iat": True,
                "verify_aud": False,  # Better Auth may not set audience
                "verify_iss": False,  # Better Auth may not set issuer
            }
        )

        # Extract user_id from 'sub' claim
        user_id = payload.get("sub")
        if not user_id:
            logger.error("JWT token missing 'sub' claim", payload=payload)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except JWTError as e:
        logger.warning("JWT verification failed", error=str(e), token_prefix=token[:20])
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def extract_user_id(token: str) -> str:
    """
    Extract user_id from JWT token 'sub' claim.

    Args:
        token: JWT token string

    Returns:
        str: User ID from token 'sub' claim

    Raises:
        HTTPException: If token is invalid or missing user_id
    """
    payload = decode_jwt_token(token)
    return payload["sub"]