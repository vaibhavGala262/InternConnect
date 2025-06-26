"""Remove xyz column from contact_us

Revision ID: df8b016b8e41
Revises: 43067d4b78bd
Create Date: 2025-05-04 12:25:59.733024

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df8b016b8e41'
down_revision: Union[str, None] = '43067d4b78bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('contact_us', 'xyz')
    

def downgrade():
    # Recreate the 'xyz' column in case you need to downgrade
    op.add_column('contact_us', sa.Column('xyz', sa.String(), nullable=False, server_default='default_value'))
