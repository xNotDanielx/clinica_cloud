from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.common.security import get_current_administrador
from app.models.administrador import Administrador
from app.routes.deps import get_db
from app.schemas.cita import (
    CitaCambiarEstadoRequest,
    CitaCreateRequest,
    CitaOut,
    CitaPublicaRequest,
    CitaUpdate,
)
from app.services.cita_service import CitaService


router = APIRouter(prefix="/citas", tags=["Citas"])


@router.post(
    "",
    response_model=CitaOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_cita(
    payload: CitaCreateRequest,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    cita = CitaService.crear_cita(
        db,
        id_paciente=payload.id_paciente,
        fecha_programada=payload.fecha_programada,
        hora_inicio=payload.hora_inicio,
        hora_fin=payload.hora_fin,
        procedimiento_ids=payload.procedimiento_ids,
        valor_consulta=payload.valor_consulta,
        id_codigo_promocional=payload.id_codigo_promocional,
        nota=payload.nota,
        estado=payload.estado,
    )
    db.commit()
    db.refresh(cita)
    return cita


@router.post(
    "/publica",
    response_model=CitaOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_cita_publica(
    payload: CitaPublicaRequest,
    db: Session = Depends(get_db),
):
    cita = CitaService.crear_cita_publica(
        db,
        nombre_completo=payload.nombre_completo,
        tipo_identificacion=payload.tipo_identificacion,
        identificacion=payload.identificacion,
        telefono=payload.telefono,
        email=payload.email,
        direccion=payload.direccion,
        sexo=payload.sexo,
        fecha_programada=payload.fecha_programada,
        hora=payload.hora,
        procedimiento_ids=payload.procedimiento_ids,
        nota=payload.nota,
    )
    db.commit()
    db.refresh(cita)
    return cita


@router.patch("/{cita_id}", response_model=CitaOut)
def actualizar_cita(
    cita_id: int,
    payload: CitaUpdate,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    cita = CitaService.actualizar_cita(db, cita_id, payload)
    db.commit()
    db.refresh(cita)
    return cita


@router.get("/filtrar", response_model=list[CitaOut])
def filtrar_citas(
    buscar: str | None = None,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    return CitaService.filtrar_citas(db, buscar)


@router.patch("/{cita_id}/estado", response_model=CitaOut)
def cambiar_estado_cita(
    cita_id: int,
    payload: CitaCambiarEstadoRequest,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    cita = CitaService.cambiar_estado_cita(
        db,
        cita_id,
        payload.estado,
    )
    db.commit()
    db.refresh(cita)
    return cita


@router.get("/todas", response_model=list[CitaOut])
def listar_citas(
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    return CitaService.listar_citas(db)


@router.get("/pendientes-aprobacion", response_model=list[CitaOut])
def listar_citas_pendientes_aprobacion(
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    return CitaService.listar_citas_pendientes_aprobacion(db)


@router.patch("/{cita_id}/aprobar", response_model=CitaOut)
def aprobar_cita(
    cita_id: int,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    cita = CitaService.autorizar_cita(db, cita_id)
    db.commit()
    db.refresh(cita)
    return cita


@router.patch("/{cita_id}/rechazar", response_model=CitaOut)
def rechazar_cita(
    cita_id: int,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    cita = CitaService.rechazar_cita(db, cita_id)
    db.commit()
    db.refresh(cita)
    return cita


@router.delete(
    "/{cita_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_cita(
    cita_id: int,
    db: Session = Depends(get_db),
    _: Administrador = Depends(get_current_administrador),
):
    CitaService.eliminar_cita(db, cita_id)
    db.commit()


@router.get("/horarios-disponibles")
def horarios_disponibles(
    fecha: date = Query(...),
    db: Session = Depends(get_db),
):
    return {
        "fecha": fecha.isoformat(),
        "horarios": CitaService.obtener_horarios_disponibles(
            db,
            fecha,
        ),
    }
