from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://user:pass@db:5432/clinica"

engine = create_engine(DATABASE_URL)

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