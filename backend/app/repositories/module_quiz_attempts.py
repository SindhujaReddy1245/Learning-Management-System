from uuid import uuid4
import json
from datetime import datetime, timezone

from app.database import get_database_pool

memory_quiz_attempts: list[dict] = []

def row_to_attempt(row) -> dict:
    row = dict(row)
    answers = row.get('answers')
    if isinstance(answers, str):
        answers = json.loads(answers)
    module_id = row.get('module_id', row.get('moduleId'))
    student_id = row.get('student_id', row.get('studentId'))
    submitted_at = row.get('submitted_at', row.get('submittedAt'))
    return {
        'id': str(row['id']),
        'moduleId': str(module_id),
        'studentId': str(student_id),
        'answers': answers,
        'score': row.get('score'),
        'submittedAt': submitted_at.isoformat() if hasattr(submitted_at, 'isoformat') else str(submitted_at),
    }

async def save_quiz_attempt(module_id: str, student_id: str, answers: list[dict], score: float) -> dict:
    pool = get_database_pool()
    if pool is None:
        new = {
            'id': f'at_{uuid4().hex}',
            'moduleId': module_id,
            'studentId': student_id,
            'answers': answers,
            'score': score,
            'submitted_at': datetime.now(timezone.utc),
        }
        memory_quiz_attempts.append(new)
        return row_to_attempt(new)
    answers_json = json.dumps(answers)
    with pool.connection() as conn:
        row = conn.execute(
            """
            insert into module_quiz_attempts (module_id, student_id, answers, score)
            values (%s, %s, %s::jsonb, %s)
            returning id, module_id, student_id, answers, score, submitted_at
            """,
            (module_id, student_id, answers_json, score),
        ).fetchone()
    return row_to_attempt(row)

async def get_attempts_for_student(module_id: str, student_id: str) -> list[dict]:
    pool = get_database_pool()
    if pool is None:
        return [row_to_attempt(a) for a in memory_quiz_attempts if a['moduleId'] == module_id and a['studentId'] == student_id]
    with pool.connection() as conn:
        rows = conn.execute(
            """
            select id, module_id, student_id, answers, score, submitted_at
            from module_quiz_attempts
            where module_id = %s and student_id = %s
            order by submitted_at desc
            """,
            (module_id, student_id),
        ).fetchall()
    return [row_to_attempt(r) for r in rows]
