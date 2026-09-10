import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
	raise RuntimeError("DATABASE_URL no está configurada")

engine = create_engine(
	DATABASE_URL, 
	pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema_compatibility() -> None:
	with engine.begin() as connection:
		connection.execute(
			text(
				"ALTER TABLE public.citas "
				"ADD COLUMN IF NOT EXISTS notas_asesoria TEXT, "
				"ADD COLUMN IF NOT EXISTS razon_rechazo TEXT"
			)
		)