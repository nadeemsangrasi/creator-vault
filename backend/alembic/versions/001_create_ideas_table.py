"""Create ideas table

Revision ID: 001
Revises:
Create Date: 2026-01-05

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM types
    stage_enum = ENUM('idea', 'outline', 'draft', 'published', name='stageenum', create_type=True)
    priority_enum = ENUM('high', 'medium', 'low', name='priorityenum', create_type=True)

    stage_enum.create(op.get_bind(), checkfirst=True)
    priority_enum.create(op.get_bind(), checkfirst=True)

    # Create ideas table
    op.create_table(
        'ideas',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('stage', stage_enum, nullable=False, server_default='idea'),
        sa.Column('priority', priority_enum, nullable=False, server_default='medium'),
        sa.Column('tags', JSONB, nullable=False, server_default='[]'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    )

    # Create indexes
    op.create_index('idx_ideas_user_id', 'ideas', ['user_id'])
    op.create_index('idx_ideas_user_stage', 'ideas', ['user_id', 'stage'])
    op.create_index('idx_ideas_user_priority', 'ideas', ['user_id', 'priority'])
    op.create_index('idx_ideas_user_created', 'ideas', ['user_id', sa.text('created_at DESC')])
    op.create_index('idx_ideas_tags', 'ideas', ['tags'], postgresql_using='gin')


def downgrade() -> None:
    op.drop_index('idx_ideas_tags', table_name='ideas')
    op.drop_index('idx_ideas_user_created', table_name='ideas')
    op.drop_index('idx_ideas_user_priority', table_name='ideas')
    op.drop_index('idx_ideas_user_stage', table_name='ideas')
    op.drop_index('idx_ideas_user_id', table_name='ideas')
    op.drop_table('ideas')

    # Drop ENUM types
    sa.Enum(name='priorityenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='stageenum').drop(op.get_bind(), checkfirst=True)
