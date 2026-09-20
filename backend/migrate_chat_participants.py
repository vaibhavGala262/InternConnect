"""Migrate legacy student-teacher chat rooms to generic user participants."""

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import os


load_dotenv(".env")
engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)


with engine.begin() as connection:
    connection.execute(text("""
        CREATE TABLE IF NOT EXISTS chat_room_participants (
            room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (room_id, user_id)
        )
    """))

    columns = {
        row[0]
        for row in connection.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'chat_rooms'
        """))
    }

    if {"student_id", "teacher_id"}.issubset(columns):
        connection.execute(text("""
            INSERT INTO chat_room_participants (room_id, user_id)
            SELECT rooms.id, students.user_id
            FROM chat_rooms rooms
            JOIN students ON students.sap_id = rooms.student_id
            ON CONFLICT DO NOTHING
        """))
        connection.execute(text("""
            INSERT INTO chat_room_participants (room_id, user_id)
            SELECT rooms.id, teachers.user_id
            FROM chat_rooms rooms
            JOIN teachers ON teachers.teacher_id = rooms.teacher_id
            ON CONFLICT DO NOTHING
        """))
        connection.execute(text("ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS uq_student_teacher_chat"))
        connection.execute(text("ALTER TABLE chat_rooms DROP COLUMN IF EXISTS student_id CASCADE"))
        connection.execute(text("ALTER TABLE chat_rooms DROP COLUMN IF EXISTS teacher_id CASCADE"))

print("Chat participant migration completed.")
