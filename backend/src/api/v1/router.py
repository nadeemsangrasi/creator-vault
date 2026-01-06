"""API v1 router aggregator for all v1 endpoints."""
from fastapi import APIRouter

# Import endpoint routers
from src.api.v1.endpoints import ideas, users

# Create v1 API router
api_router = APIRouter()

# Register endpoint routers with authentication
api_router.include_router(ideas.router, tags=["Ideas"])
api_router.include_router(users.router, tags=["Users"])
