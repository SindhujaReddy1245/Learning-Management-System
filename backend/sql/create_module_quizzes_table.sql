create extension if not exists "pgcrypto";

create table if not exists public.module_quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  questions jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id)
);

create index if not exists idx_module_quizzes_module_id on public.module_quizzes (module_id);
