"""Application configuration using Pydantic Settings."""
from functools import lru_cache
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Database Configuration
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection URL (async psycopg)"
    )

    # JWT Configuration (Better Auth Integration)
    JWT_PUBLIC_KEY: str = Field(
        ...,
        description="RS256 public key for JWT verification"
    )
    JWT_ALGORITHM: str = Field(
        default="RS256",
        description="JWT signing algorithm"
    )
    JWT_AUDIENCE: str = Field(
        ...,
        description="Expected JWT audience claim"
    )
    JWT_ISSUER: str = Field(
        ...,
        description="Expected JWT issuer claim"
    )

    # CORS Configuration
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    # Logging Configuration
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR)"
    )

    # Server Configuration
    HOST: str = Field(
        default="0.0.0.0",
        description="Server host"
    )
    PORT: int = Field(
        default=8000,
        description="Server port"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def parse_cors_origins(cls, v: str) -> list[str]:
        """Parse comma-separated CORS origins into list."""
        return [origin.strip() for origin in v.split(",")]

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level is one of the allowed values."""
        allowed_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v_upper = v.upper()
        if v_upper not in allowed_levels:
            raise ValueError(f"LOG_LEVEL must be one of {allowed_levels}")
        return v_upper


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
