import os


os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault(
    "ADMIN_AUTH_SECRET",
    "test-secret-with-at-least-thirty-two-characters",
)
os.environ.pop("INITIAL_ADMIN_USER", None)
os.environ.pop("INITIAL_ADMIN_PASSWORD", None)
