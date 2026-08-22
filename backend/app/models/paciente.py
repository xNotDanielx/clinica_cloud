
from sqlalchemy import CheckConstraint, Column, DateTime, Float, String, text, Boolean
from sqlalchemy.orm import relationship

from app.db.database import Base


class Paciente(Base):
    __tablename__ = "pacientes"
    __table_args__ = (
        CheckConstraint(
            "sexo IN ('masculino', 'femenino')",
            name="chk_paciente_sexo",
        ),
        CheckConstraint(
            "tipo_identificacion IN ("
            "'cedula_chilena', "
            "'cedula_extranjero', "
            "'pasaporte_chileno', "  
            "'pasaporte_extranjero', "
            "'documento_extranjero'"
            ")",
            name="chk_paciente_tipo_documento",
        ),
        CheckConstraint(
            "genero IN ("
            "'masculino', "
            "'femenino', "
            "'no_binario', "
            "'transgenero', "
            "'genero_fluido', "
            "'prefiero_no_decir', "
            "'otro'"
            ")",
            name="chk_paciente_genero",
        ),
        {"schema": "public"},
    )
    

    identificacion = Column(String(20), primary_key=True)
    tipo_identificacion = Column(String(100), nullable=False)
    nombre_completo = Column(String(150), nullable=False)
    telefono = Column(String(30), nullable=False)
    email = Column(String(100), nullable=False)
    direccion = Column(String(150), nullable=False)
    sexo = Column(String(10), nullable=False)
    nacionalidad = Column(String(150), nullable=True)
    genero = Column(String(50), nullable=True)
    fecha_nacimiento = Column(DateTime, nullable=True)
    altura = Column(Float, nullable=True)
    peso = Column(Float, nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("true"))
    fecha_ultima_actualizacion = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    citas = relationship("Cita", back_populates="paciente")
