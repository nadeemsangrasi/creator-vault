# =============================================================================
# CreatorVault Backend - Multi-Stage Production Dockerfile
# =============================================================================
# Target: Hugging Face Spaces (Docker mode, port 7860)
# Base: Python 3.13-slim
# Application: FastAPI + Uvicorn + Better Auth + SQLModel
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
# Builds Python wheels for all dependencies to minimize runtime image size
FROM python:3.13-slim AS builder

WORKDIR /app

# Install build dependencies required for compiling Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml uv.lock ./
COPY . .

# Install uv package manager
RUN pip install --upgrade pip && pip install uv

# Install dependencies using uv and build wheels
RUN uv sync --locked

# -----------------------------------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------------------------------
# Minimal production image with only runtime dependencies
FROM python:3.13-slim AS runtime

WORKDIR /app

# Install runtime dependencies only
# - curl: Required for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy the installed packages from builder stage
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY . .

# Create non-root user for security
# HF Spaces requirement: user must have UID 1000
RUN useradd -m -u 1000 appuser \
    && chown -R appuser:appuser /app

USER appuser

# -----------------------------------------------------------------------------
# Port Configuration
# -----------------------------------------------------------------------------
# Hugging Face Spaces REQUIRES port 7860
EXPOSE 7860

# -----------------------------------------------------------------------------
# Health Check
# -----------------------------------------------------------------------------
# Ensures the container is healthy before receiving traffic
# - interval: Check every 30 seconds
# - timeout: Allow 10 seconds for response
# - start-period: Wait 60 seconds for app startup before checking
# - retries: Mark unhealthy after 3 consecutive failures
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# -----------------------------------------------------------------------------
# Runtime Command
# -----------------------------------------------------------------------------
# Start uvicorn with:
# - Host 0.0.0.0: Accept connections from all interfaces
# - Port 7860: HF Spaces requirement
CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]