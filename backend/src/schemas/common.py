"""Common Pydantic schemas for API requests and responses."""
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Error detail structure."""

    code: str = Field(
        ...,
        description="Error code for programmatic handling"
    )
    message: str = Field(
        ...,
        description="Human-readable error message"
    )
    correlation_id: str = Field(
        ...,
        description="Correlation ID for request tracing"
    )


class ErrorResponse(BaseModel):
    """Structured error response with correlation ID."""

    error: ErrorDetail = Field(
        ...,
        description="Error details"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Idea not found",
                    "correlation_id": "550e8400-e29b-41d4-a716-446655440000"
                }
            }
        }


class PaginationMetadata(BaseModel):
    """Pagination metadata for list responses."""

    total: int = Field(
        ...,
        description="Total number of items",
        ge=0
    )
    limit: int = Field(
        ...,
        description="Maximum items per page",
        ge=1,
        le=100
    )
    offset: int = Field(
        ...,
        description="Number of items skipped",
        ge=0
    )
    has_more: bool = Field(
        ...,
        description="Whether more items exist beyond current page"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "total": 42,
                "limit": 20,
                "offset": 0,
                "has_more": True
            }
        }
