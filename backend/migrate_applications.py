"""Add status tracking to the existing enrollment/application records."""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


load_dotenv(".env")
engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)

with engine.begin() as connection:
    connection.execute(text("""
        ALTER TABLE enrolled
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'
    """))
    connection.execute(text("""
        ALTER TABLE enrolled
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    """))

print("Application status migration completed.")
