-- PostgreSQL / Supabase table creation script for dynamic quizzes
create extension if not exists "pgcrypto";

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id text not null unique,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quizzes_course_id
on public.quizzes (course_id);
