"""FastAPI application entry point for CreatorVault backend API."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import get_settings
from src.core.database import close_db_connection
from src.core.logging import configure_logging, get_logger
from src.middleware.correlation_id import CorrelationIdMiddleware
from src.middleware.error_handler import ErrorHandlerMiddleware
from src.middleware.security_headers import SecurityHeadersMiddleware

# Initialize settings and logging
settings = get_settings()
configure_logging(settings.LOG_LEVEL)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events (startup and shutdown)."""
    # Startup
    logger.info("Starting CreatorVault Backend API", version="0.1.0")
    yield
    # Shutdown
    logger.info("Shutting down CreatorVault Backend API")
    await close_db_connection()


# Create FastAPI application
app = FastAPI(
    title="CreatorVault API",
    description="Backend API for Content Idea Management - Phase 2",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middleware (order matters - first added = outermost)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# Register health endpoints (public, no auth required)
from src.api.v1.endpoints import health
app.include_router(health.router)

# Register API v1 routers (authenticated endpoints)
from src.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "service": "CreatorVault Backend API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
