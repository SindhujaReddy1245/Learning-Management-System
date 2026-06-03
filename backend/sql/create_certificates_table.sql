create extension if not exists "pgcrypto";

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  url text not null,
  issued_at timestamptz not null default now(),
  unique (student_id, course_id)
);

alter table if exists public.certificates
  drop constraint if exists certificates_student_id_fkey;

create index if not exists idx_certificates_student_course
  on public.certificates (student_id, course_id);
