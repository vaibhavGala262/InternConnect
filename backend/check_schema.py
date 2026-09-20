import os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv('.env')
url = os.getenv('DATABASE_URL')
if not url:
    with open('.env') as f:
        for line in f:
            if 'DATABASE_URL' in line:
                url = line.split('=', 1)[1].strip().strip('"')
                break
print('DB URL set:', bool(url))
if url:
    from sqlalchemy import create_engine, text
    engine = create_engine(url, connect_args={'connect_timeout': 10}, pool_pre_ping=True)
    with engine.connect() as conn:
        for tbl in ['students', 'teachers']:
            result = conn.execute(text(
                "SELECT column_name, data_type, is_nullable "
                "FROM information_schema.columns "
                f"WHERE table_name = '{tbl}' ORDER BY ordinal_position"
            ))
            print(f'\n=== {tbl} columns ===')
            rows = list(result)
            if not rows:
                print('  TABLE NOT FOUND')
            for row in rows:
                print(f'  {row[0]:25} {row[1]:30} nullable={row[2]}')
