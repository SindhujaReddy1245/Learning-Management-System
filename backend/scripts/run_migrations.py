import os
import asyncio
from pathlib import Path

# Ensure the app can connect to the DB
from app.database import connect_database, get_database_pool, close_database

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"

async def run_sql_file(pool, sql_path: Path):
    """Execute a .sql file using the connection pool."""
    with sql_path.open("r", encoding="utf-8") as f:
        sql = f.read()
    # Simple split on semicolon for multiple statements (ignore empty lines)
    statements = [stmt.strip() for stmt in sql.split(";") if stmt.strip()]
    with pool.connection() as conn:
        for stmt in statements:
            conn.execute(stmt)
    print(f"Applied migration: {sql_path.name}")

async def main():
    await connect_database()
    pool = get_database_pool()
    if pool is None:
        raise RuntimeError("Database pool not configured – check DATABASE_URL in .env")
    # Apply all .sql files in alphabetical order
    for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
        await run_sql_file(pool, sql_file)
    await close_database()

if __name__ == "__main__":
    asyncio.run(main())
