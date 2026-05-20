create extension if not exists "pgcrypto";

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  level text not null default 'Beginner',
  duration text not null,
  details text not null,
  instructor_id text not null,
  instructor text not null,
  lessons_count integer not null default 0,
  rating numeric(2, 1) not null default 5.0,
  learners_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_courses_search
on public.courses
using gin (
  to_tsvector(
    'english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(details, '')
  )
);

create index if not exists idx_courses_created_at
on public.courses (created_at desc);
