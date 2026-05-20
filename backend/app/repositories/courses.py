from uuid import uuid4

from app.database import get_database_pool
from app.schemas import CourseCreate, CourseOut


memory_courses: list[CourseOut] = []


def row_to_course(row) -> CourseOut:
    row = dict(row)
    return CourseOut(
        id=str(row["id"]),
        title=row["title"],
        description=row["description"],
        category=row["category"],
        level=row["level"],
        duration=row["duration"],
        details=row["details"],
        instructorId=row["instructor_id"],
        instructor=row["instructor"],
        lessonsCount=row["lessons_count"],
        rating=str(row["rating"]),
        learnersCount=row["learners_count"],
    )


async def list_courses(search: str | None = None) -> list[CourseOut]:
    pool = get_database_pool()
    search_text = (search or "").strip()

    if pool is None:
        if not search_text:
            return memory_courses

        term = search_text.lower()
        return [
            course for course in memory_courses
            if term in course.title.lower()
            or term in course.description.lower()
            or term in course.category.lower()
            or term in course.details.lower()
        ]

    with pool.connection() as connection:
        if search_text:
            rows = connection.execute(
                """
                select *
                from courses
                where title ilike %s
                   or description ilike %s
                   or category ilike %s
                   or details ilike %s
                order by created_at desc
                """,
                (
                    f"%{search_text}%",
                    f"%{search_text}%",
                    f"%{search_text}%",
                    f"%{search_text}%",
                ),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                select *
                from courses
                order by created_at desc
                """
            ).fetchall()

    return [row_to_course(row) for row in rows]


async def create_course(course: CourseCreate) -> CourseOut:
    pool = get_database_pool()

    if pool is None:
        saved_course = CourseOut(
            id=f"c_{uuid4().hex}",
            lessonsCount=0,
            rating="5.0",
            learnersCount=0,
            **course.dict(),
        )
        memory_courses.insert(0, saved_course)
        return saved_course

    with pool.connection() as connection:
        row = connection.execute(
            """
            insert into courses (
                title,
                description,
                category,
                level,
                duration,
                details,
                instructor_id,
                instructor
            )
            values (%s, %s, %s, %s, %s, %s, %s, %s)
            returning *
            """,
            (
                course.title,
                course.description,
                course.category,
                course.level,
                course.duration,
                course.details,
                course.instructorId,
                course.instructor,
            ),
        ).fetchone()

    return row_to_course(row)
