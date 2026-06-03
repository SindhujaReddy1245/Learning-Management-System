from app.database import get_database_pool

async def create_certificate_record(student_id: str, course_id: str, url: str) -> dict:
    """Insert a new certificate row and return its fields.
    Returns a dict with keys matching CertificateOut.
    """
    pool = get_database_pool()
    if pool is None:
        raise RuntimeError('Database pool not configured')
    with pool.connection() as conn:
        result = conn.execute(
            """
            INSERT INTO certificates (student_id, course_id, url, issued_at)
            VALUES (%s, %s, %s, now())
            ON CONFLICT (student_id, course_id)
            DO UPDATE SET url = excluded.url, issued_at = now()
            RETURNING id, student_id, course_id, url, issued_at
            """,
            (student_id, course_id, url),
        ).fetchone()
        return {
            "id": str(result["id"]),
            "student_id": result["student_id"],
            "course_id": str(result["course_id"]),
            "url": result["url"],
            "issued_at": result["issued_at"].isoformat() if hasattr(result["issued_at"], "isoformat") else str(result["issued_at"]),
        }


async def get_certificate_record(student_id: str, course_id: str) -> dict | None:
    pool = get_database_pool()
    if pool is None:
        return None
    with pool.connection() as conn:
        result = conn.execute(
            """
            SELECT id, student_id, course_id, url, issued_at
            FROM certificates
            WHERE student_id = %s AND course_id = %s
            """,
            (student_id, course_id),
        ).fetchone()
    if result is None:
        return None
    return {
        "id": str(result["id"]),
        "student_id": result["student_id"],
        "course_id": str(result["course_id"]),
        "url": result["url"],
        "issued_at": result["issued_at"].isoformat() if hasattr(result["issued_at"], "isoformat") else str(result["issued_at"]),
    }
