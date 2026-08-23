from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, String
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate
from app.common.exceptions import ConflictError, NotFoundError


class PacienteService:
    @staticmethod
    def crear_paciente(session: Session, data: PacienteCreate) -> Paciente:
        existente = session.get(Paciente, data.identificacion)
        if existente:
            raise ConflictError("Ya existe un paciente con esa identificación")

        paciente = Paciente(**data.model_dump())
        session.add(paciente)
        session.flush()
        return paciente
    
    @staticmethod
    def crear_o_obtener_paciente(session: Session, data: PacienteCreate) -> Paciente:
        paciente = PacienteService.buscar_por_identificacion(session, data.identificacion)
        if paciente:
            return paciente
        return PacienteService.crear_paciente(session, data)

    @staticmethod
    def buscar_por_identificacion(session: Session, identificacion: str) -> Paciente:
        paciente = session.get(Paciente, identificacion)
        if not paciente:
            return
        return paciente

    @staticmethod
    def actualizar_datos(session: Session, identificacion: str, data: PacienteUpdate) -> Paciente:
        paciente = PacienteService.buscar_por_identificacion(session, identificacion)
        cambios = data.model_dump(exclude_unset=True)
        for campo, valor in cambios.items():
            setattr(paciente, campo, valor)
        session.flush()
        return paciente

    @staticmethod
    def listar_pacientes_activos(session: Session):
        return session.query(Paciente).filter(Paciente.activo.is_(True)).all()
    
    @staticmethod
    def filtrar_pacientes(session: Session, buscar: str | None = None):
        query = session.query(Paciente).filter(
            Paciente.activo.is_(True)
        )

        if buscar:
            query = query.filter(
                or_(
                    cast(Paciente.identificacion, String).ilike(f"%{buscar}%"),
                    Paciente.nombre_completo.ilike(f"%{buscar}%"),
                    Paciente.telefono.ilike(f"%{buscar}%"),
                    Paciente.email.ilike(f"%{buscar}%"),
                    Paciente.direccion.ilike(f"%{buscar}%"),
                    Paciente.nacionalidad.ilike(f"%{buscar}%"),
                    Paciente.sexo.ilike(f"%{buscar}%"),
                    Paciente.genero.ilike(f"%{buscar}%"),
                )
            )

        return query.all()
    
    @staticmethod
    def eliminar_paciente(session: Session, identificacion: str):
        paciente = PacienteService.buscar_por_identificacion(session, identificacion)
        if not paciente:
            raise NotFoundError("Paciente no encontrado")
        
        paciente.activo = False
        session.flush()