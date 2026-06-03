from app.database import get_database_pool

# ---------------------------------------------------------------------------
# PDF handling for modules
# ---------------------------------------------------------------------------

async def save_module_pdf(module_id: str, filename: str, content_type: str, file_bytes: bytes) -> dict:
    """Insert a PDF record for a module and return the inserted row.
    The returned dict matches the fields of `ModulePdfOut` (except for raw file data).
    """
    pool = get_database_pool()
    if pool is None:
        raise RuntimeError('Database pool not configured')
    with pool.connection() as conn:
        result = conn.execute(
            """
            INSERT INTO module_pdfs (module_id, filename, content_type, file_data, uploaded_at)
            VALUES (%s, %s, %s, %s, now())
            RETURNING id, module_id, filename, content_type, uploaded_at
            """,
            (module_id, filename, content_type, file_bytes),
        ).fetchone()
        return {
            "id": str(result["id"]),
            "module_id": result["module_id"],
            "filename": result["filename"],
            "content_type": result["content_type"],
            "uploaded_at": result["uploaded_at"].isoformat()
            if hasattr(result["uploaded_at"], "isoformat")
            else str(result["uploaded_at"]),
        }

async def get_module_pdf_file(module_id: str, pdf_id: str) -> dict | None:
    """Retrieve a single PDF record for a module.
    Returns ``None`` if the record does not exist.
    """
    pool = get_database_pool()
    if pool is None:
        raise RuntimeError('Database pool not configured')
    with pool.connection() as conn:
        row = conn.execute(
            """
            SELECT id, module_id, filename, content_type, file_data, url, uploaded_at
            FROM module_pdfs
            WHERE module_id = %s AND id = %s
            """,
            (module_id, pdf_id),
        ).fetchone()
        if row is None:
            return None
        return {
            "id": str(row["id"]),
            "module_id": row["module_id"],
            "filename": row["filename"],
            "content_type": row["content_type"],
            "file_data": row["file_data"],
            "url": row["url"],
            "uploaded_at": row["uploaded_at"].isoformat()
            if hasattr(row["uploaded_at"], "isoformat")
            else str(row["uploaded_at"]),
        }

async def list_module_pdfs(module_id: str) -> list[dict]:
    """Return basic info for all PDFs belonging to a module.
    Used by the *list PDFs* endpoint.
    """
    pool = get_database_pool()
    if pool is None:
        raise RuntimeError('Database pool not configured')
    with pool.connection() as conn:
        rows = conn.execute(
            """
            SELECT id, filename, content_type, url, uploaded_at
            FROM module_pdfs
            WHERE module_id = %s
            ORDER BY uploaded_at DESC
            """,
            (module_id,),
        ).fetchall()
        return [
            {
                "id": str(r["id"]),
                "filename": r["filename"],
                "content_type": r["content_type"],
                "url": r["url"],
                "uploaded_at": r["uploaded_at"].isoformat()
                if hasattr(r["uploaded_at"], "isoformat")
                else str(r["uploaded_at"]),
            }
            for r in rows
        ]
