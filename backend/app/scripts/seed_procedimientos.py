import time
from decimal import Decimal

from sqlalchemy import inspect, select, text

from app.db.database import Base, engine, SessionLocal
from app.models.procedimiento import Procedimiento
from app.seed_data.procedimientos import PROCEDIMIENTOS_INICIALES


def seed_procedimientos() -> None:
    ultimo_error: Exception | None = None

    for _ in range(30):
        try:
            with engine.connect():
                break
        except Exception as error:
            ultimo_error = error
            time.sleep(2)
    else:
        raise ultimo_error or RuntimeError("No fue posible conectar con la base de datos")

    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    procedimientos_columns = {column["name"] for column in inspector.get_columns("procedimientos", schema="public")}
    if "url_imagen" not in procedimientos_columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE public.procedimientos ADD COLUMN url_imagen VARCHAR(255)")
            )

    session = SessionLocal()
    try:
        with session.begin():
            for item in PROCEDIMIENTOS_INICIALES:
                procedimiento = session.scalar(
                    select(Procedimiento).where(Procedimiento.nombre == item["nombre"])
                )

                if procedimiento is None:
                    procedimiento = Procedimiento(
                        nombre=item["nombre"],
                        descripcion=item["descripcion"],
                        precio=Decimal(item["precio"]),
                        url_imagen=item["url_imagen"],
                        activo=True,
                    )
                    session.add(procedimiento)
                    continue

                procedimiento.descripcion = item["descripcion"]
                procedimiento.precio = Decimal(item["precio"])
                procedimiento.url_imagen = item["url_imagen"]
                procedimiento.activo = True
    finally:
        session.close()


if __name__ == "__main__":
    seed_procedimientos()
    print("Procedimientos iniciales cargados correctamente.")