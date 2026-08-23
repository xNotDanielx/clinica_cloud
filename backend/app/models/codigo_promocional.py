from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class CodigoPromocional(Base):
    __tablename__ = "codigos_promocionales"
    __table_args__ = (
        CheckConstraint("tipo_descuento IN ('porcentaje')", name="chk_tipo_descuento"),
        CheckConstraint(
            "valor_descuento >= 0 AND valor_descuento <= 100",
            name="chk_valor_descuento",
        ),
        CheckConstraint(
            "fecha_fin IS NULL OR fecha_fin >= fecha_inicio",
            name="chk_fechas_codigo",
        ),
        {"schema": "public"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    codigo = Column(String(10), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    tipo_descuento = Column(String(20), nullable=False)
    valor_descuento = Column(Numeric(10, 2), nullable=False)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    usos_maximos = Column(Integer, nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("TRUE"))
    fecha_ultima_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    citas = relationship("Cita", back_populates="codigo_promocional")
