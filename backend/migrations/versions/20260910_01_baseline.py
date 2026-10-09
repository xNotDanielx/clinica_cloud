"""Baseline del esquema actual y correcciones de compatibilidad.

Esta revisión está diseñada para funcionar tanto sobre una base nueva como sobre
la base existente previa a Alembic. Las tablas faltantes se crean desde los
modelos actuales y después se aplican ajustes idempotentes específicos de
PostgreSQL.

Revision ID: 20260910_01
Revises:
"""

from alembic import op
from sqlalchemy import inspect

from app.db.database import Base
import app.models  # noqa: F401


revision = "20260910_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    # Baseline pragmático: en instalaciones nuevas crea todas las tablas; en
    # instalaciones existentes create_all no modifica ni elimina datos.
    Base.metadata.create_all(bind=bind)

    inspector = inspect(bind)
    tables = set(inspector.get_table_names(schema="public"))

    if "procedimientos" in tables:
        columns = {
            column["name"]
            for column in inspector.get_columns(
                "procedimientos",
                schema="public",
            )
        }
        if "url_imagen" not in columns:
            op.execute(
                "ALTER TABLE public.procedimientos "
                "ADD COLUMN url_imagen VARCHAR(255)"
            )

    if "citas" in tables:
        columns = {
            column["name"]
            for column in inspector.get_columns(
                "citas",
                schema="public",
            )
        }
        if "notas_asesoria" not in columns:
            op.execute(
                "ALTER TABLE public.citas "
                "ADD COLUMN notas_asesoria TEXT"
            )
        if "razon_rechazo" not in columns:
            op.execute(
                "ALTER TABLE public.citas "
                "ADD COLUMN razon_rechazo TEXT"
            )

        # La restricción antigua impedía reutilizar un horario cancelado.
        op.execute(
            "ALTER TABLE public.citas "
            "DROP CONSTRAINT IF EXISTS unique_cita"
        )

        conflicto = bind.exec_driver_sql(
            """
            SELECT a.id, b.id
            FROM public.citas AS a
            JOIN public.citas AS b
              ON a.id < b.id
             AND a.fecha_programada = b.fecha_programada
             AND a.hora_inicio < b.hora_fin
             AND a.hora_fin > b.hora_inicio
            WHERE a.activo IS TRUE
              AND b.activo IS TRUE
              AND a.estado <> 'cancelada'
              AND b.estado <> 'cancelada'
            LIMIT 1
            """
        ).first()

        if conflicto:
            raise RuntimeError(
                "No se puede crear la restricción de horarios porque existen "
                f"citas activas solapadas: {conflicto[0]} y {conflicto[1]}. "
                "Corrige ese conflicto antes de volver a ejecutar Alembic."
            )

        # Evita solapamientos reales entre citas activas/no canceladas incluso
        # bajo concurrencia, no solo por lógica de aplicación.
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'excl_citas_horario_no_solapado'
                      AND conrelid = 'public.citas'::regclass
                ) THEN
                    ALTER TABLE public.citas
                    ADD CONSTRAINT excl_citas_horario_no_solapado
                    EXCLUDE USING gist (
                        tsrange(
                            fecha_programada + hora_inicio,
                            fecha_programada + hora_fin,
                            '[)'
                        ) WITH &&
                    )
                    WHERE (
                        activo IS TRUE
                        AND estado <> 'cancelada'
                    );
                END IF;
            END
            $$;
            """
        )


def downgrade() -> None:
    # Al ser una baseline compatible con bases preexistentes, el downgrade no
    # elimina tablas ni datos. Solo retira la restricción introducida aquí.
    op.execute(
        "ALTER TABLE public.citas "
        "DROP CONSTRAINT IF EXISTS excl_citas_horario_no_solapado"
    )
