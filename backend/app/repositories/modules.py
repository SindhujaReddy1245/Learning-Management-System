from uuid import uuid4
from datetime import datetime, timezone

from app.database import get_database_pool
from app.schemas_module import ModuleCreate, ModuleOut, ModulePdfOut, ModuleVideoOut

memory_modules: list[dict] = []
memory_module_pdfs: list[dict] = []
memory_module_videos: list[dict] = []

def row_to_module(row) -> ModuleOut:
    row = dict(row)
    return ModuleOut(
        id=str(row["id"]),
        courseId=str(row["course_id"]),
        title=row["title"],
        description=row.get("description"),
        order=row["module_order"],
        createdAt=row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"]),
    )

def row_to_module_pdf(row) -> ModulePdfOut:
    row = dict(row)
    uploaded_at = row["uploaded_at"]
    if hasattr(uploaded_at, "isoformat"):
        uploaded_at = uploaded_at.isoformat()
    return ModulePdfOut(
        id=str(row["id"]),
        moduleId=str(row["module_id"]),
        filename=row["filename"],
        url=row.get("url"),
        contentType=row.get("content_type") or "application/pdf",
        sizeBytes=row["size_bytes"],
        uploadedAt=uploaded_at,
    )

def row_to_module_video(row) -> ModuleVideoOut:
    row = dict(row)
    uploaded_at = row["uploaded_at"]
    if hasattr(uploaded_at, "isoformat"):
        uploaded_at = uploaded_at.isoformat()
    return ModuleVideoOut(
        id=str(row["id"]),
        moduleId=str(row["module_id"]),
        filename=row["filename"],
        url=row["url"],
        publicId=row.get("public_id"),
        contentType=row.get("content_type") or "video/mp4",
        sizeBytes=row["size_bytes"],
        duration=row.get("duration"),
        uploadedAt=uploaded_at,
    )

async def list_modules(course_id: str) -> list[ModuleOut]:
    pool = get_database_pool()
    if pool is None:
        return [row_to_module(m) for m in memory_modules if m["course_id"] == course_id]
    with pool.connection() as conn:
        rows = conn.execute(
            """
            select id, course_id, title, description, module_order, created_at
            from modules
            where course_id = %s
            order by module_order asc
            """,
            (course_id,)
        ).fetchall()
    return [row_to_module(r) for r in rows]

async def create_module(module: ModuleCreate, course_id: str) -> ModuleOut:
    pool = get_database_pool()
    if pool is None:
        new = {
            "id": f"m_{uuid4().hex}",
            "course_id": course_id,
            "title": module.title,
            "description": module.description,
            "module_order": module.order,
            "created_at": datetime.now(timezone.utc),
        }
        memory_modules.append(new)
        return row_to_module(new)
    with pool.connection() as conn:
        row = conn.execute(
            """
            insert into modules (course_id, title, description, module_order)
            values (%s, %s, %s, %s)
            returning id, course_id, title, description, module_order, created_at
            """,
            (course_id, module.title, module.description, module.order),
        ).fetchone()
    return row_to_module(row)

async def list_module_pdfs(module_id: str) -> list[ModulePdfOut]:
    pool = get_database_pool()
    if pool is None:
        return [row_to_module_pdf(p) for p in memory_module_pdfs if p["module_id"] == module_id]
    with pool.connection() as conn:
        rows = conn.execute(
            """
            select id, module_id, filename, url, content_type, size_bytes, uploaded_at
            from module_pdfs
            where module_id = %s
            order by uploaded_at desc
            """,
            (module_id,)
        ).fetchall()
    return [row_to_module_pdf(r) for r in rows]

async def save_module_pdf(module_id: str, filename: str, content_type: str, file_bytes: bytes) -> ModulePdfOut:
    pool = get_database_pool()
    normalized_content_type = content_type or "application/pdf"
    if pool is None:
        new = {
            "id": f"mp_{uuid4().hex}",
            "module_id": module_id,
            "filename": filename,
            "url": None,
            "content_type": normalized_content_type,
            "size_bytes": len(file_bytes),
            "file_data": file_bytes,
            "uploaded_at": datetime.now(timezone.utc),
        }
        memory_module_pdfs.append(new)
        return row_to_module_pdf(new)
    with pool.connection() as conn:
        row = conn.execute(
            """
            insert into module_pdfs (module_id, filename, content_type, size_bytes, file_data)
            values (%s, %s, %s, %s, %s)
            returning id, module_id, filename, url, content_type, size_bytes, uploaded_at
            """,
            (module_id, filename, normalized_content_type, len(file_bytes), file_bytes),
        ).fetchone()
    return row_to_module_pdf(row)

async def get_module_pdf_file(module_id: str, pdf_id: str) -> dict | None:
    pool = get_database_pool()

    if pool is None:
        pdf = next(
            (
                item
                for item in memory_module_pdfs
                if item["module_id"] == module_id and item["id"] == pdf_id
            ),
            None,
        )
        if pdf is None:
            return None
        return {
            "id": pdf["id"],
            "module_id": pdf["module_id"],
            "filename": pdf["filename"],
            "content_type": pdf.get("content_type") or "application/pdf",
            "file_data": pdf["file_data"],
            "url": pdf.get("url"),
        }

    with pool.connection() as conn:
        row = conn.execute(
            """
            select id, module_id, filename, url, content_type, file_data
            from module_pdfs
            where module_id = %s and id::text = %s
            """,
            (module_id, pdf_id),
        ).fetchone()

    if row is None:
        return None

    row = dict(row)
    return {
        "id": str(row["id"]),
        "module_id": str(row["module_id"]),
        "filename": row["filename"],
        "content_type": row.get("content_type") or "application/pdf",
        "file_data": bytes(row["file_data"]) if row.get("file_data") is not None else None,
        "url": row.get("url"),
    }

async def get_module_video(module_id: str) -> ModuleVideoOut | None:
    pool = get_database_pool()
    if pool is None:
        matches = [v for v in memory_module_videos if v["module_id"] == module_id]
        if not matches:
            return None
        latest = sorted(matches, key=lambda item: item["uploaded_at"], reverse=True)[0]
        return row_to_module_video(latest)

    with pool.connection() as conn:
        row = conn.execute(
            """
            select id, module_id, filename, url, public_id, content_type, size_bytes, duration, uploaded_at
            from module_videos
            where module_id = %s
            order by uploaded_at desc
            limit 1
            """,
            (module_id,),
        ).fetchone()

    return row_to_module_video(row) if row else None

async def save_module_video(
    module_id: str,
    filename: str,
    url: str,
    public_id: str | None,
    content_type: str,
    size_bytes: int,
    duration: float | None,
) -> ModuleVideoOut:
    pool = get_database_pool()
    normalized_content_type = content_type or "video/mp4"

    if pool is None:
        new = {
            "id": f"mv_{uuid4().hex}",
            "module_id": module_id,
            "filename": filename,
            "url": url,
            "public_id": public_id,
            "content_type": normalized_content_type,
            "size_bytes": size_bytes,
            "duration": duration,
            "uploaded_at": datetime.now(timezone.utc),
        }
        memory_module_videos[:] = [v for v in memory_module_videos if v["module_id"] != module_id]
        memory_module_videos.append(new)
        return row_to_module_video(new)

    with pool.connection() as conn:
        row = conn.execute(
            """
            insert into module_videos (module_id, filename, url, public_id, content_type, size_bytes, duration)
            values (%s, %s, %s, %s, %s, %s, %s)
            on conflict (module_id) do update set
                filename = excluded.filename,
                url = excluded.url,
                public_id = excluded.public_id,
                content_type = excluded.content_type,
                size_bytes = excluded.size_bytes,
                duration = excluded.duration,
                uploaded_at = now()
            returning id, module_id, filename, url, public_id, content_type, size_bytes, duration, uploaded_at
            """,
            (module_id, filename, url, public_id, normalized_content_type, size_bytes, duration),
        ).fetchone()

    return row_to_module_video(row)
