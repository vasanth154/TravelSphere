"""add trips, members, items and expenses tables

Revision ID: 5c9a2f01e8b4
Revises: 3f08499e8900
Create Date: 2026-08-30 17:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5c9a2f01e8b4'
down_revision: Union[str, Sequence[str], None] = '3f08499e8900'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'trips',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('owner_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('origin', sa.String(), nullable=True),
        sa.Column('destination', sa.String(), nullable=True),
        sa.Column('start_date', sa.String(), nullable=True),
        sa.Column('end_date', sa.String(), nullable=True),
        sa.Column('travelers', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('budget', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='planning'),
        sa.Column('created_at', sa.String(), nullable=True),
        sa.Column('updated_at', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_trips_code'), 'trips', ['code'], unique=True)

    op.create_table(
        'trip_members',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('trip_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='member'),
        sa.Column('joined_at', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_trip_members_trip_id'), 'trip_members', ['trip_id'])

    op.create_table(
        'trip_items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('trip_id', sa.String(), nullable=False),
        sa.Column('added_by', sa.String(), nullable=False),
        sa.Column('item_type', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('provider', sa.String(), nullable=True),
        sa.Column('mode', sa.String(), nullable=True),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('destination', sa.String(), nullable=True),
        sa.Column('date', sa.String(), nullable=True),
        sa.Column('departure', sa.String(), nullable=True),
        sa.Column('arrival', sa.String(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False, server_default='0'),
        sa.Column('currency', sa.String(), nullable=False, server_default='INR'),
        sa.Column('travelers', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('status', sa.String(), nullable=False, server_default='saved'),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['added_by'], ['users.id']),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_trip_items_trip_id'), 'trip_items', ['trip_id'])

    op.create_table(
        'expenses',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('trip_id', sa.String(), nullable=False),
        sa.Column('added_by', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False, server_default='other'),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('paid_by', sa.String(), nullable=True),
        sa.Column('date', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['added_by'], ['users.id']),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_expenses_trip_id'), 'expenses', ['trip_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_expenses_trip_id'), table_name='expenses')
    op.drop_table('expenses')
    op.drop_index(op.f('ix_trip_items_trip_id'), table_name='trip_items')
    op.drop_table('trip_items')
    op.drop_index(op.f('ix_trip_members_trip_id'), table_name='trip_members')
    op.drop_table('trip_members')
    op.drop_index(op.f('ix_trips_code'), table_name='trips')
    op.drop_table('trips')
