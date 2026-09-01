"""add bookings table

Revision ID: b2a3e8f1c9d0
Revises: a7f39c2d10e4
Create Date: 2026-08-31 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2a3e8f1c9d0'
down_revision: Union[str, Sequence[str], None] = 'a7f39c2d10e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'bookings',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('ticket_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('customer_name', sa.String(), nullable=False),
        sa.Column('mobile', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('item_type', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('destination', sa.String(), nullable=True),
        sa.Column('travel_date', sa.String(), nullable=True),
        sa.Column('travelers', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('price', sa.Float(), nullable=False, server_default='0'),
        sa.Column('currency', sa.String(), nullable=False, server_default='INR'),
        sa.Column('status', sa.String(), nullable=False, server_default='confirmed'),
        sa.Column('email_sent', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('sms_sent', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_bookings_ticket_id'), 'bookings', ['ticket_id'], unique=True)
    op.create_index(op.f('ix_bookings_user_id'), 'bookings', ['user_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_bookings_user_id'), table_name='bookings')
    op.drop_index(op.f('ix_bookings_ticket_id'), table_name='bookings')
    op.drop_table('bookings')
