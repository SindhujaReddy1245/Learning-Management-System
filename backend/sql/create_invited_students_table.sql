create table if not exists public.invited_students (
  id text primary key,
  name text not null,
  college text not null,
  email text not null unique,
  course_id text,
  instructor_id text not null,
  instructor_email text not null,
  password_salt text not null,
  password_hash text not null,
  email_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invited_students_instructor
  on public.invited_students (instructor_id, created_at desc);

create index if not exists idx_invited_students_course
  on public.invited_students (course_id);
