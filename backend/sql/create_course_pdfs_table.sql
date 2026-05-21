create extension if not exists "pgcrypto";

create table if not exists public.course_pdfs (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  filename text not null,
  content_type text not null default 'application/pdf',
  size_bytes integer not null,
  file_data bytea not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_course_pdfs_course_id
on public.course_pdfs (course_id);

create index if not exists idx_course_pdfs_uploaded_at
on public.course_pdfs (uploaded_at desc);
