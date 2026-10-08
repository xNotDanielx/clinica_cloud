from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema_compatibility() -> None:
	with engine.begin() as connection:
		connection.execute(
			text(
				"ALTER TABLE public.citas "
				"ADD COLUMN IF NOT EXISTS notas_asesoria TEXT, "
				"ADD COLUMN IF NOT EXISTS razon_rechazo TEXT, "
				"ADD COLUMN IF NOT EXISTS seguimiento_hash VARCHAR(64)"
			)
		)
		connection.execute(text(
			"CREATE UNIQUE INDEX IF NOT EXISTS unique_cita_activa "
			"ON public.citas (fecha_programada, hora_inicio) "
			"WHERE activo = true AND estado <> 'cancelada'"
		))
		connection.execute(text(
			"CREATE UNIQUE INDEX IF NOT EXISTS unique_seguimiento_hash "
			"ON public.citas (seguimiento_hash)"
		))
		connection.execute(text(
			"ALTER TABLE public.citas DROP CONSTRAINT IF EXISTS unique_cita"
		))
