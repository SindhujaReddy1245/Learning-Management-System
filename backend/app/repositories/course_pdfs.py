from datetime import datetime, timezone
from uuid import uuid4

from app.database import get_database_pool
from app.schemas import CoursePdfOut


memory_course_pdfs: list[dict] = []


def row_to_pdf(row) -> CoursePdfOut:
    row = dict(row)
    uploaded_at = row["uploaded_at"]
    if hasattr(uploaded_at, "isoformat"):
        uploaded_at = uploaded_at.isoformat()

    return CoursePdfOut(
        id=str(row["id"]),
        courseId=str(row["course_id"]),
        filename=row["filename"],
        contentType=row["content_type"],
        sizeBytes=row["size_bytes"],
        uploadedAt=uploaded_at,
    )


async def list_course_pdfs(course_id: str) -> list[CoursePdfOut]:
    pool = get_database_pool()

    if pool is None:
        return [
            CoursePdfOut(
                id=pdf["id"],
                courseId=pdf["course_id"],
                filename=pdf["filename"],
                contentType=pdf["content_type"],
                sizeBytes=pdf["size_bytes"],
                uploadedAt=pdf["uploaded_at"],
            )
            for pdf in memory_course_pdfs
            if pdf["course_id"] == course_id
        ]

    with pool.connection() as connection:
        rows = connection.execute(
            """
            select id, course_id, filename, content_type, size_bytes, uploaded_at
            from course_pdfs
            where course_id = %s
            order by uploaded_at desc
            """,
            (course_id,),
        ).fetchall()

    return [row_to_pdf(row) for row in rows]


async def save_course_pdf(
    course_id: str,
    filename: str,
    content_type: str,
    file_bytes: bytes,
) -> CoursePdfOut:
    pool = get_database_pool()
    normalized_content_type = content_type or "application/pdf"

    if pool is None:
        saved_pdf = {
            "id": f"pdf_{uuid4().hex}",
            "course_id": course_id,
            "filename": filename,
            "content_type": normalized_content_type,
            "size_bytes": len(file_bytes),
            "file_data": file_bytes,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
        memory_course_pdfs.insert(0, saved_pdf)
        return CoursePdfOut(
            id=saved_pdf["id"],
            courseId=saved_pdf["course_id"],
            filename=saved_pdf["filename"],
            contentType=saved_pdf["content_type"],
            sizeBytes=saved_pdf["size_bytes"],
            uploadedAt=saved_pdf["uploaded_at"],
        )

    with pool.connection() as connection:
        row = connection.execute(
            """
            insert into course_pdfs (
                course_id,
                filename,
                content_type,
                size_bytes,
                file_data
            )
            values (%s, %s, %s, %s, %s)
            returning id, course_id, filename, content_type, size_bytes, uploaded_at
            """,
            (
                course_id,
                filename,
                normalized_content_type,
                len(file_bytes),
                file_bytes,
            ),
        ).fetchone()

    return row_to_pdf(row)


async def get_course_pdf_file(course_id: str, pdf_id: str) -> dict | None:
    pool = get_database_pool()

    if pool is None:
        return next(
            (
                pdf
                for pdf in memory_course_pdfs
                if pdf["course_id"] == course_id and pdf["id"] == pdf_id
            ),
            None,
        )

    with pool.connection() as connection:
        row = connection.execute(
            """
            select id, course_id, filename, content_type, file_data
            from course_pdfs
            where course_id = %s and id::text = %s
            """,
            (course_id, pdf_id),
        ).fetchone()

    if row is None:
        return None

    row = dict(row)
    return {
        "id": str(row["id"]),
        "course_id": str(row["course_id"]),
        "filename": row["filename"],
        "content_type": row["content_type"],
        "file_data": bytes(row["file_data"]),
    }
