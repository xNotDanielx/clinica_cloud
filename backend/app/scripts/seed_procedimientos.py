import logging
from decimal import Decimal
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.procedimiento import Procedimiento
from app.seed_data.procedimientos import PROCEDIMIENTOS_INICIALES


logger = logging.getLogger(__name__)


def run_migrations() -> None:
    backend_root = Path(__file__).resolve().parents[2]
    config = Config(str(backend_root / "alembic.ini"))
    command.upgrade(config, "head")


def seed_procedimientos() -> None:
    with SessionLocal() as session:
        with session.begin():
            for item in PROCEDIMIENTOS_INICIALES:
                procedimiento = session.scalar(
                    select(Procedimiento).where(
                        Procedimiento.nombre == item["nombre"]
                    )
                )

                if procedimiento is not None:
                    continue

                session.add(
                    Procedimiento(
                        nombre=item["nombre"],
                        descripcion=item["descripcion"],
                        precio=Decimal(item["precio"]),
                        url_imagen=item["url_imagen"],
                        activo=True,
                    )
                )


def bootstrap_database() -> None:
    run_migrations()
    seed_procedimientos()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    bootstrap_database()
    logger.info("Base de datos preparada correctamente.")
