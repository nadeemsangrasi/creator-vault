"""Create ideas table

Revision ID: 001
Revises:
Create Date: 2026-01-05

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ideas table with simple string types (no enums)
    op.create_table(
        'ideas',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('stage', sa.String(20), nullable=False, server_default='idea'),
        sa.Column('priority', sa.String(10), nullable=False, server_default='medium'),
        sa.Column('tags', sa.String(1000), nullable=False, server_default=''),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )

    # Create indexes
    op.create_index('idx_ideas_user_id', 'ideas', ['user_id'])
    op.create_index('idx_ideas_user_stage', 'ideas', ['user_id', 'stage'])
    op.create_index('idx_ideas_user_priority', 'ideas', ['user_id', 'priority'])
    op.create_index('idx_ideas_user_created', 'ideas', ['user_id'], postgresql_include=['created_at'])


def downgrade() -> None:
    op.drop_index('idx_ideas_user_created', table_name='ideas')
    op.drop_index('idx_ideas_user_priority', table_name='ideas')
    op.drop_index('idx_ideas_user_stage', table_name='ideas')
    op.drop_index('idx_ideas_user_id', table_name='ideas')
    op.drop_table('ideas')
