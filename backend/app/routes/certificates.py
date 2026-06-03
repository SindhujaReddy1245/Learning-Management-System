from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas_certificate import CertificateCreate, CertificateOut
from app.certificate_util import generate_certificate_pdf
from app.repositories.certificates import create_certificate_record, get_certificate_record
from app.repositories.courses import get_course_by_id
from app.repositories.students import get_student_by_id_or_email

router = APIRouter(tags=["certificates"])


async def resolve_certificate_student(
    student_ref: str,
    student_name: str | None = None,
    student_email: str | None = None,
) -> dict:
    student = await get_student_by_id_or_email(student_ref)
    if student is not None:
        return student

    email = (student_email or student_ref).strip()
    fallback_name = (student_name or "").strip()
    if not fallback_name:
        fallback_name = email.split("@", 1)[0].replace(".", " ").replace("_", " ").title() or "Student"

    return {
        "id": email.lower(),
        "name": fallback_name,
        "email": email.lower(),
    }


@router.post("/certificates", response_model=CertificateOut, status_code=201)
async def generate_certificate(cert: CertificateCreate) -> CertificateOut:
    student = await resolve_certificate_student(
        cert.student_id,
        student_name=cert.student_name,
        student_email=cert.student_email,
    )

    course = await get_course_by_id(cert.course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = await get_certificate_record(student["id"], cert.course_id)
    if existing is not None:
        return CertificateOut(**existing)

    url = (
        f"/api/certificates/file?student_id={quote(student['id'])}"
        f"&course_id={quote(cert.course_id)}"
        f"&student_name={quote(student['name'])}"
        f"&student_email={quote(student['email'])}"
    )
    record = await create_certificate_record(student["id"], cert.course_id, url)
    return CertificateOut(**record)


@router.get("/certificates/file")
async def get_certificate_file(
    student_id: str,
    course_id: str,
    student_name: str | None = None,
    student_email: str | None = None,
    download: bool = False,
) -> StreamingResponse:
    student = await resolve_certificate_student(
        student_id,
        student_name=student_name,
        student_email=student_email,
    )

    course = await get_course_by_id(course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    certificate = await get_certificate_record(student["id"], course_id)
    if certificate is None:
        raise HTTPException(status_code=404, detail="Certificate not found")

    try:
        pdf_bytes = generate_certificate_pdf(
            student_name=student["name"],
            student_email=student["email"],
            course_title=course.title,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Certificate PDF generation failed: {exc}") from exc

    safe_filename = quote(f"{course.title}-certificate.pdf")
    disposition = "attachment" if download else "inline"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"{disposition}; filename*=UTF-8''{safe_filename}"},
    )
