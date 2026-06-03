from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import string
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from app.database import get_database_pool
from app.schemas_students import StudentInviteCreate, StudentInviteOut, StudentLoginOut


memory_students: dict[str, dict] = {}


def generate_student_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return salt, digest.hex()


def verify_password(password: str, salt: str, password_hash: str) -> bool:
    _, candidate_hash = hash_password(password, salt)
    return hmac.compare_digest(candidate_hash, password_hash)


def send_invite_email(student: StudentInviteCreate, password: str) -> bool:
    resend_api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM") or os.getenv("SMTP_FROM") or "onboarding@resend.dev"

    if not resend_api_key:
        print("Resend email not sent: RESEND_API_KEY is missing")
        return False

    if not from_email:
        print("Resend email not sent: RESEND_FROM or SMTP_FROM is missing")
        return False

    frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    login_url = f"{frontend_url}/student-login"

    email_text = "\n".join(
        [
            f"Hi {student.name},",
            "",
            "Your instructor has created your LearnFlow LMS student account.",
            "",
            f"Login URL: {login_url}",
            f"Email: {student.email}",
            f"Password: {password}",
            "",
            "You can use these credentials to open the student dashboard without registering.",
        ]
    )

    payload = {
        "from": from_email,
        "to": [student.email],
        "subject": "Your LearnFlow student dashboard login",
        "text": email_text,
        "reply_to": student.instructorEmail,
    }

    request = Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "LearnFlow-LMS/1.0",
        },
        method="POST",
    )

    # ------------------------------------------------------------
    # Attempt to send the e‑mail via Resend with a simple retry
    # ------------------------------------------------------------
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            with urlopen(request, timeout=6) as response:
                if 200 <= response.status < 300:
                    return True
                else:
                    print(f"Resend email attempt {attempt} failed with status {response.status}")
        except HTTPError as error:
            response_body = error.read().decode("utf-8", errors="replace")
            print(f"Resend email attempt {attempt} HTTP {error.code}: {response_body}")
        except (URLError, TimeoutError) as error:
            print(f"Resend email attempt {attempt} error: {error}")
        # simple back‑off before next try (avoid busy loop)
        if attempt < max_retries:
            import time
            time.sleep(1)
    # All attempts failed
    return False


def row_to_student(row) -> StudentLoginOut:
    row = dict(row)
    return StudentLoginOut(
        uid=str(row["id"]),
        name=row["name"],
        college=row.get("college"),
        email=row["email"],
        role="student",
    )


def row_to_invite(row) -> dict:
    row = dict(row)
    return {
        "id": str(row["id"]),
        "name": row["name"],
        "college": row.get("college"),
        "email": row["email"],
        "courseId": row.get("course_id"),
        "instructorId": row.get("instructor_id"),
        "instructorEmail": row.get("instructor_email"),
    }


def save_memory_student(
    student_id: str,
    student: StudentInviteCreate,
    salt: str,
    password_hash: str,
) -> None:
    memory_students[student.email.lower()] = {
        "id": student_id,
        "name": student.name,
        "college": student.college,
        "email": student.email.lower(),
        "course_id": student.courseId,
        "instructor_id": student.instructorId,
        "instructor_email": student.instructorEmail,
        "password_salt": salt,
        "password_hash": password_hash,
    }


async def create_student_invite(student: StudentInviteCreate) -> StudentInviteOut:
    pool = get_database_pool()
    student_id = f"s_{uuid4().hex}"
    password = generate_student_password()
    salt, password_hash = hash_password(password)
    email_sent = False

    try:
        email_sent = send_invite_email(student, password)
    except Exception as error:
        print(f"Student invite email failed: {error}")
        email_sent = False

    if pool is None:
        save_memory_student(student_id, student, salt, password_hash)
    else:
        try:
            with pool.connection() as connection:
                row = connection.execute(
                    """
                    insert into invited_students (
                        id,
                        name,
                        college,
                        email,
                        course_id,
                        instructor_id,
                        instructor_email,
                        password_salt,
                        password_hash,
                        email_sent
                    )
                    values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    on conflict (email) do update set
                        name = excluded.name,
                        college = excluded.college,
                        course_id = excluded.course_id,
                        instructor_id = excluded.instructor_id,
                        instructor_email = excluded.instructor_email,
                        password_salt = excluded.password_salt,
                        password_hash = excluded.password_hash,
                        email_sent = excluded.email_sent,
                        updated_at = now()
                    returning id
                    """,
                    (
                        student_id,
                        student.name,
                        student.college,
                        student.email.lower(),
                        student.courseId,
                        student.instructorId,
                        student.instructorEmail,
                        salt,
                        password_hash,
                        email_sent,
                    ),
                ).fetchone()
                student_id = str(row["id"])
        except Exception as error:
            print(f"Student invite database save failed; saved in memory instead: {error}")
            save_memory_student(student_id, student, salt, password_hash)

    return StudentInviteOut(
        id=student_id,
        name=student.name,
        college=student.college,
        email=student.email.lower(),
        courseId=student.courseId,
        emailSent=email_sent,
        generatedPassword=password,
    )


async def login_invited_student(email: str, password: str) -> StudentLoginOut | None:
    pool = get_database_pool()
    normalized_email = email.lower()

    def login_from_memory() -> StudentLoginOut | None:
        student = memory_students.get(normalized_email)
        if not student:
            return None
        if not verify_password(password, student["password_salt"], student["password_hash"]):
            return None
        return StudentLoginOut(
            uid=student["id"],
            name=student["name"],
            college=student["college"],
            email=student["email"],
        )

    if pool is None:
        return login_from_memory()

    try:
        with pool.connection() as connection:
            row = connection.execute(
                """
                select id, name, college, email, password_salt, password_hash
                from invited_students
                where email = %s
                """,
                (normalized_email,),
            ).fetchone()
    except Exception as error:
        print(f"Invited student database login failed; checking memory instead: {error}")
        return login_from_memory()

    if row is None:
        return login_from_memory()

    if not verify_password(password, row["password_salt"], row["password_hash"]):
        return None

    return row_to_student(row)


async def get_student_by_id_or_email(student_ref: str) -> dict | None:
    pool = get_database_pool()
    normalized = student_ref.lower()

    if pool is None:
        student = memory_students.get(normalized)
        if student is None:
            student = next((s for s in memory_students.values() if s["id"] == student_ref), None)
        if student is None:
            return None
        return {
            "id": student["id"],
            "name": student["name"],
            "college": student["college"],
            "email": student["email"],
            "courseId": student["course_id"],
            "instructorId": student["instructor_id"],
            "instructorEmail": student["instructor_email"],
        }

    with pool.connection() as connection:
        row = connection.execute(
            """
            select id, name, college, email, course_id, instructor_id, instructor_email
            from invited_students
            where id = %s or lower(email) = %s
            """,
            (student_ref, normalized),
        ).fetchone()

    return row_to_invite(row) if row else None


async def delete_student_by_id_or_email(student_ref: str) -> bool:
    pool = get_database_pool()
    normalized = student_ref.lower()

    if pool is None:
        removed = memory_students.pop(normalized, None)
        if removed is None:
            for email, student in list(memory_students.items()):
                if student["id"] == student_ref:
                    removed = memory_students.pop(email)
                    break
        return removed is not None

    with pool.connection() as conn:
        student = conn.execute(
            """
            select id, email
            from invited_students
            where id = %s or lower(email) = %s
            """,
            (student_ref, normalized),
        ).fetchone()

        if student is None:
            return False

        student_id = student["id"]
        student_email = student["email"]
        conn.execute(
            "delete from student_module_progress where student_id in (%s, %s)",
            (student_id, student_email),
        )
        conn.execute(
            "delete from module_quiz_attempts where student_id in (%s, %s)",
            (student_id, student_email),
        )
        conn.execute(
            "delete from certificates where student_id in (%s, %s)",
            (student_id, student_email),
        )
        conn.execute("delete from invited_students where id = %s", (student_id,))
        return True

# Delete a student and cascade related data
async def delete_student(student_id: str) -> None:
    """Delete a student and cascade related progress, attempts, certificates."""
    pool = get_database_pool()
    if pool is None:
        # In‑memory fallback – remove from dicts
        memory_students.pop(student_id.lower(), None)
        return
    with pool.connection() as conn:
        # Delete related progress
        conn.execute("""
            DELETE FROM student_module_progress WHERE student_id = %s
        """, (student_id,))
        # Delete quiz attempts
        conn.execute("""
            DELETE FROM module_quiz_attempts WHERE student_id = %s
        """, (student_id,))
        # Delete certificates
        conn.execute("""
            DELETE FROM certificates WHERE student_id = %s
        """, (student_id,))
        # Delete student record
        conn.execute("""
            DELETE FROM invited_students WHERE id = %s
        """, (student_id,))
