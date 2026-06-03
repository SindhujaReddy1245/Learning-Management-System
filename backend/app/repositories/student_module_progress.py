from __future__ import annotations

from datetime import datetime

from app.database import get_database_pool


async def mark_module_viewed(student_id: str, module_id: str) -> None:
    """Record that a student has viewed a module (PDF/video).
    If a row already exists, its timestamp is refreshed.
    """
    pool = get_database_pool()
    if pool is None:
        # In‑memory fallback – simple dict stored in module globals
        global _memory_progress
        try:
            _memory_progress
        except NameError:
            _memory_progress = {}
        _memory_progress[(student_id, module_id)] = datetime.utcnow()
        return

    with pool.connection() as conn:
        conn.execute(
            """
            INSERT INTO student_module_progress (student_id, module_id, viewed_at)
            VALUES (%s, %s, now())
            ON CONFLICT (student_id, module_id) DO UPDATE SET viewed_at = now()
            """,
            (student_id, module_id),
        )


async def is_module_completed(student_id: str, module_id: str) -> bool:
    """Return True if the student has a progress row for the module."""
    pool = get_database_pool()
    if pool is None:
        try:
            _memory_progress
        except NameError:
            return False
        return (student_id, module_id) in _memory_progress

    with pool.connection() as conn:
        row = conn.execute(
            """
            SELECT 1 FROM student_module_progress
            WHERE student_id = %s AND module_id = %s
            """,
            (student_id, module_id),
        ).fetchone()
        return row is not None


async def has_completed_all_modules(student_id: str, course_id: str) -> bool:
    """Check that the student has viewed *every* module belonging to the given course.
    Returns False if any module is missing.
    """
    pool = get_database_pool()
    if pool is None:
        # In‑memory fallback – iterate stored keys
        try:
            _memory_progress
        except NameError:
            return False
        # Gather all module IDs for the course from the modules table (fallback not supported)
        return False

    # Count total modules for the course
    with pool.connection() as conn:
        total = conn.execute(
            """
            SELECT COUNT(*) FROM modules WHERE course_id = %s
            """,
            (course_id,),
        ).fetchone()["count"]
        completed = conn.execute(
            """
            SELECT COUNT(*) FROM student_module_progress
            WHERE student_id = %s AND module_id IN (
                SELECT id FROM modules WHERE course_id = %s
            )
            """,
            (student_id, course_id),
        ).fetchone()["count"]
        return completed == total


async def get_module_progress_for_student(student_id: str, course_id: str) -> list[dict]:
    """Return list of progress rows for a student in a given course."""
    pool = get_database_pool()
    if pool is None:
        # In‑memory fallback – construct list from stored dict
        try:
            _memory_progress
        except NameError:
            return []
        rows = []
        for (s_id, m_id), viewed_at in _memory_progress.items():
            if s_id == student_id:
                # Need to verify module belongs to course – skip in-memory case
                rows.append({"student_id": s_id, "module_id": m_id, "viewed_at": viewed_at.isoformat()})
        return rows
    with pool.connection() as conn:
        rows = conn.execute(
            """
            SELECT student_id, module_id, viewed_at
            FROM student_module_progress
            WHERE student_id = %s AND module_id IN (
                SELECT id FROM modules WHERE course_id = %s
            )
            ORDER BY viewed_at DESC
            """,
            (student_id, course_id),
        ).fetchall()
        # Convert to simple dicts
        return [{"student_id": r["student_id"], "module_id": r["module_id"], "viewed_at": r["viewed_at"].isoformat() if hasattr(r["viewed_at"], "isoformat") else str(r["viewed_at"])} for r in rows]

