from io import BytesIO
from datetime import datetime

def generate_certificate_pdf(
    student_name: str,
    course_title: str,
    student_email: str | None = None,
    completion_date: datetime | None = None,
) -> bytes:
    """Generate a simple PDF certificate.
    Returns the PDF content as bytes.
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "The reportlab package is required to generate certificates. "
            "Run `pip install -r requirements.txt` inside the backend folder."
        ) from exc

    if completion_date is None:
        completion_date = datetime.utcnow()
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    # Decorative border
    c.setLineWidth(4)
    c.rect(30, 30, width - 60, height - 60)
    center_x = width / 2
    center_y = height / 2

    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(center_x, center_y + 105, "Certificate of Completion")
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(center_x, center_y + 70, "Learning management system")
    # Student name
    c.setFont("Helvetica", 18)
    c.drawCentredString(center_x, center_y + 20, f"Presented to: {student_name}")
    if student_email:
        c.setFont("Helvetica", 12)
        c.drawCentredString(center_x, center_y - 5, f"Student Email: {student_email}")
    # Course title
    c.setFont("Helvetica-Oblique", 16)
    c.drawCentredString(center_x, center_y - 45, f"For successfully completing the course: {course_title}")
    # Date
    c.setFont("Helvetica", 14)
    c.drawCentredString(center_x, center_y - 85, f"Date: {completion_date.strftime('%B %d, %Y')}")
    # Signature placeholder
    c.setFont("Helvetica-Oblique", 12)
    c.drawString(50, 80, "Instructor Signature: ____________________")
    c.showPage()
    c.save()
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
