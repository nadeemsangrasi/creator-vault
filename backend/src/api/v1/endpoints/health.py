"""Health check endpoints for monitoring and readiness probes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import DatabaseSession
from src.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Health"])


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Basic health check endpoint - API availability.

    Returns 200 OK if the API is running.
    This endpoint does not require authentication.

    Returns:
        dict: Status message
    """
    return {
        "status": "ok",
        "service": "creatorvault-backend",
        "version": "0.1.0"
    }


@router.get("/health/db", status_code=status.HTTP_200_OK)
async def health_check_db(db: DatabaseSession):
    """
    Database connectivity health check.

    Executes a simple SELECT 1 query to verify database connection.
    Returns 200 OK if database is reachable, 503 if not.

    Args:
        db: Database session dependency

    Returns:
        dict: Database status message

    Raises:
        500: If database connection fails
    """
    try:
        # Execute simple query to test connectivity
        result = await db.execute(text("SELECT 1"))
        result.scalar()

        logger.debug("Database health check passed")
        return {
            "status": "ok",
            "database": "connected"
        }
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }


@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness_check(db: DatabaseSession):
    """
    Readiness probe for Kubernetes/container orchestration.

    Checks if the application is ready to accept traffic:
    - API is running
    - Database is connected and responsive

    Returns 200 OK if ready, 503 if not ready.

    Args:
        db: Database session dependency

    Returns:
        dict: Readiness status
    """
    try:
        # Test database connectivity
        result = await db.execute(text("SELECT 1"))
        result.scalar()

        logger.debug("Readiness check passed")
        return {
            "status": "ready",
            "checks": {
                "api": "ok",
                "database": "ok"
            }
        }
    except Exception as e:
        logger.warning("Readiness check failed", error=str(e))
        return {
            "status": "not_ready",
            "checks": {
                "api": "ok",
                "database": "failed"
            },
            "error": str(e)
        }
