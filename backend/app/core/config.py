from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ProjectTrace API"
    api_prefix: str = "/api"
    database_url: str = Field(
        default="postgresql+psycopg://projecttrace:projecttrace@localhost:5432/projecttrace"
    )
    jwt_secret_key: str = Field(default="change-me-in-production")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=480)
    seed_user_password: str = Field(default="ProjectTrace123!")
    seed_user_email: str = Field(default="admin@projecttrace.dev")
    cors_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173")
    log_level: str = Field(default="INFO")
    seed_data_version: int = Field(default=1)
    auto_create_tables: bool = Field(default=False)

    model_config = SettingsConfigDict(env_file=str(Path(__file__).resolve().parents[3] / ".env"), extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
