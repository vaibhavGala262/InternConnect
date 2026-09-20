import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
url = os.getenv('DATABASE_URL')
print('DB URL set:', bool(url))

engine = create_engine(url, pool_pre_ping=True)

fix_sql = """
ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE students ADD COLUMN IF NOT EXISTS roll_no VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE students ADD COLUMN IF NOT EXISTS gpa DOUBLE PRECISION;
ALTER TABLE students ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS department VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL DEFAULT CURRENT_DATE;
"""

with engine.connect() as conn:
    for line in fix_sql.strip().split('\n'):
        line = line.strip()
        if not line or line.startswith('--'):
            continue
        print(f'Running: {line[:80]}...')
        conn.execute(text(line))
    conn.commit()
    print('\nAll ALTERs committed successfully.')

    for tbl in ['students', 'teachers']:
        result = conn.execute(text(
            f"SELECT column_name, data_type, is_nullable "
            f"FROM information_schema.columns "
            f"WHERE table_name = '{tbl}' ORDER BY ordinal_position"
        ))
        print(f'\n=== {tbl} columns ===')
        for row in result:
            print(f'  {row[0]:25} {row[1]:30} nullable={row[2]}')
