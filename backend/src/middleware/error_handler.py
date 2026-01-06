"""Global error handler middleware for structured error responses."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from src.core.logging import get_logger

logger = get_logger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware to catch all exceptions and return structured error responses."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """
        Catch all exceptions and return structured ErrorResponse with correlation ID.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware or route handler

        Returns:
            Response or JSONResponse with error details
        """
        try:
            response = await call_next(request)
            return response

        except Exception as exc:
            # Get correlation ID from request state (set by CorrelationIdMiddleware)
            correlation_id = getattr(request.state, "correlation_id", "unknown")

            # Log the exception with context
            logger.error(
                "Unhandled exception",
                exc_info=exc,
                correlation_id=correlation_id,
                path=request.url.path,
                method=request.method,
            )

            # Return structured error response
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred. Please try again later.",
                        "correlation_id": correlation_id,
                    }
                },
                headers={"X-Correlation-ID": correlation_id}
            )
