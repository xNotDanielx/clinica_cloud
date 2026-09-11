from app.core.config import Settings


def test_postgresql_url_is_normalized_to_psycopg3(monkeypatch):
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql://user:pass@db:5432/clinica",
    )
    monkeypatch.setenv(
        "ADMIN_AUTH_SECRET",
        "a-secret-with-at-least-thirty-two-characters",
    )
    monkeypatch.delenv("INITIAL_ADMIN_USER", raising=False)
    monkeypatch.delenv("INITIAL_ADMIN_PASSWORD", raising=False)

    settings = Settings.from_environment()

    assert settings.database_url.startswith(
        "postgresql+psycopg://"
    )
