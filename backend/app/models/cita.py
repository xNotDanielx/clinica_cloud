from sqlalchemy import (
    func,
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    text,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Cita(Base):
    __tablename__ = "citas"
    __table_args__ = (
        CheckConstraint("hora_fin > hora_inicio", name="chk_horas_validas"),
        CheckConstraint(
            "estado IN ('pendiente_aprobacion', 'aprobada', 'cancelada', 'completada')",
            name="chk_estado",
        ),
        {"schema": "public"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_paciente = Column(
        String(20),
        ForeignKey(
            "public.pacientes.identificacion",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    id_codigo_promocional = Column(
        Integer,
        ForeignKey(
            "public.codigos_promocionales.id",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        nullable=True,
    )
    fecha_programada = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    monto_base = Column(Numeric(10, 2), nullable=True)
    monto_descuento = Column(Numeric(10, 2), nullable=True)
    monto_final = Column(Numeric(10, 2), nullable=True)
    nota = Column(Text, nullable=True)
    notas_asesoria = Column(Text, nullable=True)
    razon_rechazo = Column(Text, nullable=True)
    estado = Column(String(30), nullable=False)
    activo = Column(Boolean, nullable=False, server_default=text("true"))
    fecha_ultima_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=func.now(),
    )

    paciente = relationship("Paciente", back_populates="citas")
    codigo_promocional = relationship(
        "CodigoPromocional",
        back_populates="citas",
    )
    citas_procedimientos = relationship(
        "CitaProcedimiento",
        back_populates="cita",
        cascade="all, delete-orphan",
    )

    @property
    def nombre_paciente(self) -> str | None:
        return self.paciente.nombre_completo if self.paciente else None

    @property
    def procedimiento_ids(self) -> list[int]:
        return [
            item.id_procedimiento
            for item in self.citas_procedimientos
        ]
