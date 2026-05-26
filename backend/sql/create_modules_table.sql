-- create_modules_table.sql
create extension if not exists "pgcrypto";

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  module_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_modules_course_id on public.modules (course_id);
create index if not exists idx_modules_order on public.modules (module_order);
