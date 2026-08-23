from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.procedimiento import Procedimiento


class ProcedimientoService:
    @staticmethod
    def listar_activos(session: Session) -> list[Procedimiento]:
        stmt = select(Procedimiento).where(Procedimiento.activo.is_(True)).order_by(Procedimiento.nombre)
        return list(session.scalars(stmt).all())
