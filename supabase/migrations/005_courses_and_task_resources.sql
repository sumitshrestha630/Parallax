-- ============================================================
-- Rooted – courses + task_resources (external enrichment cache)
-- ============================================================

create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  course_key  text unique not null,
  title       text not null,
  provider    text,
  url         text,
  skill_key   text not null references public.skills(skill_key) on delete cascade,
  difficulty  text,
  duration    text,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

create index if not exists idx_courses_skill_key on public.courses (skill_key);

create table if not exists public.task_resources (
  id            uuid primary key default gen_random_uuid(),
  task_key      text not null references public.tasks(task_key) on delete cascade,
  resource_type text not null, -- youtube | github | course | article | ...
  title         text not null,
  url           text not null,
  provider      text not null,
  skill_key     text not null,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz default now(),
  unique(task_key, url)
);

create index if not exists idx_task_resources_task_key on public.task_resources (task_key);
create index if not exists idx_task_resources_skill_key on public.task_resources (skill_key);

alter table public.courses        enable row level security;
alter table public.task_resources enable row level security;

-- Global read-only for authenticated users
create policy "courses: read" on public.courses for select using (auth.role() = 'authenticated');
create policy "task_resources: read" on public.task_resources for select using (auth.role() = 'authenticated');

