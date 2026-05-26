import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

database_pool: Any = None


async def connect_database() -> None:
    global database_pool

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        database_pool = None
        return

    from psycopg.rows import dict_row
    from psycopg_pool import ConnectionPool

    if "sslmode=" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"

    database_pool = ConnectionPool(
        database_url,
        kwargs={"row_factory": dict_row},
        min_size=0,
        max_size=2,
        open=True,
    )


async def close_database() -> None:
    global database_pool

    if database_pool is not None:
        database_pool.close()
        database_pool = None


def get_database_pool() -> Any:
    return database_pool
