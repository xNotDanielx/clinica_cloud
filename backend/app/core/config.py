from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import os


DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


@dataclass(frozen=True)
class Settings:
    database_url: str
    admin_auth_secret: str
    cors_origins: tuple[str, ...]
    initial_admin_user: str | None
    initial_admin_password: str | None
    token_expires_hours: int = 8

    @classmethod
    def from_environment(cls) -> "Settings":
        database_url = os.getenv("DATABASE_URL", "").strip()
        if not database_url:
            raise RuntimeError("DATABASE_URL no está configurada")

        # SQLAlchemy usa Psycopg 3 de forma explícita. Se conserva
        # compatibilidad con DATABASE_URL existentes que usan postgresql://.
        if database_url.startswith("postgresql://"):
            database_url = database_url.replace(
                "postgresql://",
                "postgresql+psycopg://",
                1,
            )
        elif database_url.startswith("postgres://"):
            database_url = database_url.replace(
                "postgres://",
                "postgresql+psycopg://",
                1,
            )

        admin_auth_secret = os.getenv("ADMIN_AUTH_SECRET", "").strip()
        if not admin_auth_secret:
            raise RuntimeError("ADMIN_AUTH_SECRET no está configurado")
        if len(admin_auth_secret) < 32:
            raise RuntimeError("ADMIN_AUTH_SECRET debe tener al menos 32 caracteres")

        raw_origins = os.getenv("CORS_ORIGINS", ",".join(DEFAULT_CORS_ORIGINS))
        cors_origins = tuple(
            origin.strip()
            for origin in raw_origins.split(",")
            if origin.strip()
        )

        initial_admin_user = os.getenv("INITIAL_ADMIN_USER") or None
        initial_admin_password = os.getenv("INITIAL_ADMIN_PASSWORD") or None

        if bool(initial_admin_user) != bool(initial_admin_password):
            raise RuntimeError(
                "INITIAL_ADMIN_USER e INITIAL_ADMIN_PASSWORD deben configurarse juntos"
            )

        if initial_admin_password and len(initial_admin_password) < 12:
            raise RuntimeError(
                "INITIAL_ADMIN_PASSWORD debe tener al menos 12 caracteres"
            )

        return cls(
            database_url=database_url,
            admin_auth_secret=admin_auth_secret,
            cors_origins=cors_origins,
            initial_admin_user=initial_admin_user,
            initial_admin_password=initial_admin_password,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings.from_environment()
