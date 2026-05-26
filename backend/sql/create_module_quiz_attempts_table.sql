create extension if not exists "pgcrypto";

create table if not exists public.module_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  student_id text not null,
  answers jsonb not null,
  score numeric(5, 2) not null,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_module_quiz_attempts_module_student
  on public.module_quiz_attempts (module_id, student_id, submitted_at desc);
