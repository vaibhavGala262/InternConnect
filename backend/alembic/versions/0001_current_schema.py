"""Create the current InternConnect schema.

This is the canonical baseline for new databases. Existing databases that
already contain this schema should be stamped to this revision rather than
running the migration against populated tables.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0001_current_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.Column("password", sa.String(length=256), nullable=False),
        sa.Column("first_name", sa.String(length=50), nullable=False),
        sa.Column("last_name", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=True),
        sa.UniqueConstraint("email", name="users_email_key"),
    )

    op.create_table(
        "students",
        sa.Column("sap_id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("department", sa.String(length=50), nullable=False),
        sa.Column("roll_no", sa.String(length=50), nullable=False),
        sa.Column("graduation_year", sa.Integer(), nullable=True),
        sa.Column("gpa", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="students_user_id_fkey", ondelete="CASCADE"),
        sa.UniqueConstraint("roll_no", name="students_roll_no_key"),
    )

    op.create_table(
        "teachers",
        sa.Column("teacher_id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("department", sa.String(length=50), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="teachers_user_id_fkey", ondelete="CASCADE"),
    )

    op.create_table(
        "internships",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("application_link", sa.String(length=512), nullable=False),
        sa.Column("company_name", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=100), nullable=True),
        sa.Column("is_remote", sa.Boolean(), nullable=True),
        sa.Column("skills_required", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("duration_weeks", sa.Integer(), nullable=True),
        sa.Column("deadline", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("teacher_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["teacher_id"], ["teachers.teacher_id"], name="internships_teacher_id_fkey"),
        sa.UniqueConstraint("title", "company_name", name="uq_title_company"),
    )

    op.create_table(
        "enrolled",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("internship_id", sa.Integer(), nullable=False),
        sa.Column("enrolled_at", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["student_id"], ["students.sap_id"], name="enrolled_student_id_fkey"),
        sa.ForeignKeyConstraint(["internship_id"], ["internships.id"], name="enrolled_internship_id_fkey"),
        sa.UniqueConstraint("student_id", "internship_id", name="uq_student_internship"),
    )

    op.create_table(
        "chat_rooms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "chat_room_participants",
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["room_id"], ["chat_rooms.id"], name="chat_room_participants_room_id_fkey", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="chat_room_participants_user_id_fkey", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("room_id", "user_id", name="chat_room_participants_pkey"),
    )

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chat_room_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("sent_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["chat_room_id"], ["chat_rooms.id"], name="chat_messages_chat_room_id_fkey", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], name="chat_messages_sender_id_fkey"),
    )

    op.create_table(
        "contact_us",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("subject", sa.String(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
    )

    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_students_sap_id", "students", ["sap_id"], unique=False)
    op.create_index("ix_teachers_teacher_id", "teachers", ["teacher_id"], unique=False)
    op.create_index("ix_internships_id", "internships", ["id"], unique=False)
    op.create_index("ix_chat_rooms_id", "chat_rooms", ["id"], unique=False)
    op.create_index("ix_chat_messages_id", "chat_messages", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_chat_messages_id", table_name="chat_messages")
    op.drop_index("ix_chat_rooms_id", table_name="chat_rooms")
    op.drop_index("ix_internships_id", table_name="internships")
    op.drop_index("ix_teachers_teacher_id", table_name="teachers")
    op.drop_index("ix_students_sap_id", table_name="students")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("contact_us")
    op.drop_table("chat_messages")
    op.drop_table("chat_room_participants")
    op.drop_table("chat_rooms")
    op.drop_table("enrolled")
    op.drop_table("internships")
    op.drop_table("teachers")
    op.drop_table("students")
    op.drop_table("users")
