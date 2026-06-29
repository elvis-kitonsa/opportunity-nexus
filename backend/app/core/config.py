from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    PROJECT_NAME: str = "Opportunity Nexus API"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = (
        "postgresql+psycopg2://nexus:nexus_dev_password@localhost:5432/opportunity_nexus"
    )

    # JWT
    SECRET_KEY: str = "change-me-to-a-long-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Institution email-domain verification
    VERIFIED_INSTITUTION_DOMAINS: list[str] = ["mak.ac.ug", "kyu.ac.ug", "mubs.ac.ug"]

    @field_validator("BACKEND_CORS_ORIGINS", "VERIFIED_INSTITUTION_DOMAINS", mode="before")
    @classmethod
    def _split_csv(cls, v):
        """Allow these list fields to be provided as a comma-separated string."""
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
