create extension if not exists "pgcrypto";

create table if not exists public.module_pdfs (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  filename text not null,
  url text,
  content_type text not null default 'application/pdf',
  size_bytes integer not null,
  file_data bytea,
  uploaded_at timestamptz not null default now()
);

alter table public.module_pdfs
  alter column url drop not null;

alter table public.module_pdfs
  add column if not exists content_type text not null default 'application/pdf';

alter table public.module_pdfs
  add column if not exists file_data bytea;

create index if not exists idx_module_pdfs_module_id on public.module_pdfs (module_id);
create index if not exists idx_module_pdfs_uploaded_at on public.module_pdfs (uploaded_at desc);
