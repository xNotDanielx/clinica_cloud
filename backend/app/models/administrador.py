from sqlalchemy import Boolean, Column, DateTime, Integer, String, text

from app.db.database import Base


class Administrador(Base):
    __tablename__ = "administradores"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario = Column(String(50), nullable=False, unique=True)
    contrasena_hash = Column(String(255), nullable=False)
    activo = Column(Boolean, nullable=False, server_default=text("TRUE"))
    fecha_ultima_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    ultimo_acceso = Column(DateTime, nullable=True)