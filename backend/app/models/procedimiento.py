from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String, Text, text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Procedimiento(Base):
    __tablename__ = "procedimientos"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=False)
    precio = Column(Numeric(10, 2), nullable=False)
    url_imagen = Column(String(255), nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("TRUE"))
    fecha_ultima_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    citas_procedimientos = relationship("CitaProcedimiento", back_populates="procedimiento")
