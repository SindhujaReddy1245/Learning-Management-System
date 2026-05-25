from uuid import uuid4
import json
from app.database import get_database_pool

memory_quizzes: list[dict] = []


def row_to_quiz(row) -> dict:
    row = dict(row)
    questions_val = row["questions"]
    if isinstance(questions_val, str):
        questions_list = json.loads(questions_val)
    else:
        questions_list = questions_val

    return {
        "id": str(row["id"]),
        "courseId": str(row["course_id"]),
        "title": row["title"],
        "questions": questions_list,
    }


async def get_quiz_by_course(course_id: str) -> dict | None:
    pool = get_database_pool()

    if pool is None:
        return next((q for q in memory_quizzes if q["courseId"] == course_id), None)

    with pool.connection() as connection:
        row = connection.execute(
            """
            select id, course_id, title, questions
            from quizzes
            where course_id = %s
            """,
            (course_id,),
        ).fetchone()

    if row is None:
        return None

    return row_to_quiz(row)


async def save_quiz(course_id: str, title: str, questions: list[dict]) -> dict:
    pool = get_database_pool()

    if pool is None:
        existing = next((q for q in memory_quizzes if q["courseId"] == course_id), None)
        if existing:
            existing["title"] = title
            existing["questions"] = questions
            return existing
        else:
            new_quiz = {
                "id": f"q_{uuid4().hex}",
                "courseId": course_id,
                "title": title,
                "questions": questions,
            }
            memory_quizzes.append(new_quiz)
            return new_quiz

    questions_json = json.dumps(questions)

    with pool.connection() as connection:
        row = connection.execute(
            """
            insert into quizzes (course_id, title, questions)
            values (%s, %s, %s::jsonb)
            on conflict (course_id)
            do update set
                title = excluded.title,
                questions = excluded.questions,
                updated_at = now()
            returning id, course_id, title, questions
            """,
            (course_id, title, questions_json),
        ).fetchone()

    return row_to_quiz(row)
