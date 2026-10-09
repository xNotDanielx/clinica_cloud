"""Add private tracking without changing existing appointments."""
from alembic import op
import sqlalchemy as sa

revision = "20261009_02"
down_revision = "20260910_01"
branch_labels = None
depends_on = None


def upgrade():
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("citas", schema="public")}
    if "seguimiento_hash" not in columns:
        op.add_column("citas", sa.Column("seguimiento_hash", sa.String(64), nullable=True), schema="public")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS unique_seguimiento_hash ON public.citas (seguimiento_hash)")


def downgrade():
    op.drop_index("unique_seguimiento_hash", table_name="citas", schema="public")
    op.drop_column("citas", "seguimiento_hash", schema="public")
