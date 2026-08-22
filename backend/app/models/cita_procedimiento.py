from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.db.database import Base


class CitaProcedimiento(Base):
    __tablename__ = "citas_procedimientos"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_cita = Column(
        Integer,
        ForeignKey("public.citas.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    id_procedimiento = Column(
        Integer,
        ForeignKey("public.procedimientos.id", onupdate="CASCADE", ondelete="RESTRICT"),
        nullable=False,
    )
    precio_unitario_al_reservar = Column(Numeric(10, 2), nullable=True)

    cita = relationship("Cita", back_populates="citas_procedimientos")
    procedimiento = relationship("Procedimiento", back_populates="citas_procedimientos")
