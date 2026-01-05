"""Correlation ID middleware for request tracing."""
from uuid import uuid4
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
import structlog


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Middleware to generate and inject correlation IDs for request tracing."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """
        Generate UUID correlation ID and inject into request state and logs.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware or route handler

        Returns:
            Response with X-Correlation-ID header
        """
        # Generate unique correlation ID for this request
        correlation_id = str(uuid4())

        # Inject into request state for access in route handlers
        request.state.correlation_id = correlation_id

        # Bind to structlog context for all logs in this request
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

        # Process request
        response = await call_next(request)

        # Add correlation ID to response headers for client tracing
        response.headers["X-Correlation-ID"] = correlation_id

        return response
