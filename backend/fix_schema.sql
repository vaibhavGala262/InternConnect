-- Fix: add missing columns that were dropped by broken migration aadd26fc54d4
-- Run this in Supabase SQL Editor

ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE students ADD COLUMN IF NOT EXISTS roll_no VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE students ADD COLUMN IF NOT EXISTS gpa DOUBLE PRECISION;
ALTER TABLE students ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS department VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add unique constraint on roll_no if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_roll_no_key') THEN
        ALTER TABLE students ADD CONSTRAINT students_roll_no_key UNIQUE (roll_no);
    END IF;
END $$;
