from uuid import uuid4
import json
from datetime import datetime, timezone

from app.database import get_database_pool

memory_module_quizzes: list[dict] = []

def row_to_module_quiz(row) -> dict:
    row = dict(row)
    # assume questions stored as JSONB
    questions_val = row["questions"]
    if isinstance(questions_val, str):
        questions = json.loads(questions_val)
    else:
        questions = questions_val
    return {
        "id": str(row["id"]),
        "moduleId": str(row["module_id"]),
        "title": row["title"],
        "questions": questions,
    }

async def get_module_quiz(module_id: str) -> dict | None:
    pool = get_database_pool()
    if pool is None:
        return next((q for q in memory_module_quizzes if q["moduleId"] == module_id), None)
    with pool.connection() as conn:
        row = conn.execute(
            """
            select id, module_id, title, questions
            from module_quizzes
            where module_id = %s
            """,
            (module_id,)
        ).fetchone()
    if row is None:
        return None
    return row_to_module_quiz(row)

async def save_module_quiz(module_id: str, title: str, questions: list[dict]) -> dict:
    pool = get_database_pool()
    if pool is None:
        # upsert in memory
        existing = next((q for q in memory_module_quizzes if q["moduleId"] == module_id), None)
        if existing:
            existing["title"] = title
            existing["questions"] = questions
            return existing
        new = {
            "id": f"mq_{uuid4().hex}",
            "moduleId": module_id,
            "title": title,
            "questions": questions,
        }
        memory_module_quizzes.append(new)
        return new
    # Store as JSONB
    questions_json = json.dumps(questions)
    with pool.connection() as conn:
        existing = conn.execute(
            """
            select id
            from module_quizzes
            where module_id = %s
            """,
            (module_id,),
        ).fetchone()

        if existing:
            row = conn.execute(
                """
                update module_quizzes
                set title = %s, questions = %s::jsonb, updated_at = now()
                where module_id = %s
                returning id, module_id, title, questions
                """,
                (title, questions_json, module_id),
            ).fetchone()
        else:
            row = conn.execute(
                """
                insert into module_quizzes (module_id, title, questions)
                values (%s, %s, %s::jsonb)
                returning id, module_id, title, questions
                """,
                (module_id, title, questions_json),
            ).fetchone()
    return row_to_module_quiz(row)
