from sqlalchemy import String, cast, or_
from sqlalchemy.orm import Session

from app.common.exceptions import ConflictError, NotFoundError
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate


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
    def buscar_por_identificacion(
        session: Session,
        identificacion: str,
    ) -> Paciente | None:
        return session.get(Paciente, identificacion)

    @staticmethod
    def obtener_por_identificacion(
        session: Session,
        identificacion: str,
    ) -> Paciente:
        paciente = PacienteService.buscar_por_identificacion(session, identificacion)
        if not paciente:
            raise NotFoundError("Paciente no encontrado")
        return paciente

    @staticmethod
    def crear_o_obtener_paciente(
        session: Session,
        data: PacienteCreate,
    ) -> Paciente:
        paciente = PacienteService.buscar_por_identificacion(
            session,
            data.identificacion,
        )
        if paciente:
            return paciente
        return PacienteService.crear_paciente(session, data)

    @staticmethod
    def actualizar_datos(
        session: Session,
        identificacion: str,
        data: PacienteUpdate,
    ) -> Paciente:
        paciente = PacienteService.obtener_por_identificacion(
            session,
            identificacion,
        )

        for campo, valor in data.model_dump(exclude_unset=True).items():
            setattr(paciente, campo, valor)

        session.flush()
        return paciente

    @staticmethod
    def listar_pacientes_activos(session: Session) -> list[Paciente]:
        return (
            session.query(Paciente)
            .filter(Paciente.activo.is_(True))
            .order_by(Paciente.nombre_completo)
            .all()
        )

    @staticmethod
    def filtrar_pacientes(
        session: Session,
        buscar: str | None = None,
    ) -> list[Paciente]:
        query = session.query(Paciente).filter(Paciente.activo.is_(True))

        if buscar:
            termino = f"%{buscar.strip()}%"
            query = query.filter(
                or_(
                    cast(Paciente.identificacion, String).ilike(termino),
                    Paciente.nombre_completo.ilike(termino),
                    Paciente.telefono.ilike(termino),
                    Paciente.email.ilike(termino),
                    Paciente.direccion.ilike(termino),
                    Paciente.nacionalidad.ilike(termino),
                    Paciente.sexo.ilike(termino),
                    Paciente.genero.ilike(termino),
                )
            )

        return query.order_by(Paciente.nombre_completo).all()

    @staticmethod
    def eliminar_paciente(session: Session, identificacion: str) -> None:
        paciente = PacienteService.obtener_por_identificacion(
            session,
            identificacion,
        )
        paciente.activo = False
        session.flush()
