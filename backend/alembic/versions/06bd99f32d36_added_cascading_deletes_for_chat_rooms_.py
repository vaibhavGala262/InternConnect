"""added cascading deletes for chat_rooms and chat_messages"""

# revision identifiers, used by Alembic.
revision = '06bd99f32d36'  # ✅ This must match your filename prefix
down_revision = 'df8b016b8e41'  # 🧠 Replace with actual previous revision
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa

def upgrade():
    # Drop the old constraint (you can confirm exact name from error)
    op.drop_constraint('chat_messages_sender_id_fkey', 'chat_messages', type_='foreignkey')

    # Re-add with ON DELETE CASCADE
    op.create_foreign_key(
        'chat_messages_sender_id_fkey',
        'chat_messages', 'users',
        ['sender_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    # In downgrade, reverse the change if needed
    op.drop_constraint('chat_messages_sender_id_fkey', 'chat_messages', type_='foreignkey')
    op.create_foreign_key(
        'chat_messages_sender_id_fkey',
        'chat_messages', 'users',
        ['sender_id'], ['id']
    )
