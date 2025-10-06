"""Initial schema baseline

Revision ID: 22e8fab4f156
Revises: 89f04c437d38
Create Date: 2025-10-05 16:34:40.037307

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '22e8fab4f156'
down_revision: Union[str, Sequence[str], None] = '89f04c437d38'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
