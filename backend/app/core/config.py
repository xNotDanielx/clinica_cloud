import os
from dataclasses import dataclass


def _as_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://user:pass@db:5432/clinica",
    )
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    )
    ai_provider: str = os.getenv("AI_PROVIDER", "local").strip().lower()
    ai_fallback_to_local: bool = _as_bool(os.getenv("AI_FALLBACK_TO_LOCAL", "true"))
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    bedrock_model_id: str = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-micro-v1:0")


settings = Settings()
