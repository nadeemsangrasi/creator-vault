from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError
from app.core.config import settings

security = HTTPBearer()


class TokenPayload(BaseModel):
    """JWT token payload structure"""
    sub: str  # User ID
    email: Optional[str] = None
    exp: int  # Expiration timestamp
    iat: int  # Issued at timestamp
    iss: str  # Issuer
    aud: str | list[str]  # Audience


class User(BaseModel):
    """User extracted from JWT"""
    id: str
    email: str
    is_active: bool = True


async def verify_jwt_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Verify JWT token from Authorization header and return user.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            key=settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
        )

        token_data = TokenPayload(**payload)

        if not token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return User(
            id=token_data.sub,
            email=token_data.email or "",
        )

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(user: User = Depends(verify_jwt_token)) -> User:
    """
    Dependency to get the current authenticated user.
    """
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    return user
