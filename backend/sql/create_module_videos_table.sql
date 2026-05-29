create extension if not exists "pgcrypto";

create table if not exists public.module_videos (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  filename text not null,
  url text not null,
  public_id text,
  content_type text not null default 'video/mp4',
  size_bytes integer not null,
  duration numeric,
  uploaded_at timestamptz not null default now(),
  constraint module_videos_module_id_unique unique (module_id)
);

create index if not exists idx_module_videos_module_id on public.module_videos (module_id);
create index if not exists idx_module_videos_uploaded_at on public.module_videos (uploaded_at desc);
