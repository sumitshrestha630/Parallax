-- ============================================================
-- Rooted – skills + tasks + user_tasks (Task tab integration)
-- ============================================================

-- 1) Global catalog: skills
create table if not exists public.skills (
  id               uuid primary key default gen_random_uuid(),
  skill_key        text unique not null,
  skill_name       text not null,
  category         text,
  description      text,
  parent_skill_key text,
  metadata         jsonb default '{}'::jsonb,
  created_at       timestamptz default now()
);

-- 2) Global catalog: tasks
create table if not exists public.tasks (
  id                uuid primary key default gen_random_uuid(),
  task_key          text unique not null,
  title             text not null,
  description       text,
  skill_key         text not null references public.skills(skill_key) on delete cascade,
  difficulty        text,
  xp_reward         int default 0,
  estimated_minutes int,
  task_type         text,
  order_index       int default 0,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz default now()
);

create index if not exists idx_tasks_skill_key on public.tasks (skill_key);

-- 3) Per-user tasks
create table if not exists public.user_tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  task_key      text not null references public.tasks(task_key) on delete cascade,
  skill_key     text not null,
  status        text default 'locked' check (status in ('locked', 'available', 'in_progress', 'completed')),
  progress      int default 0,
  completed     boolean default false,
  assigned_at   timestamptz default now(),
  completed_at  timestamptz,
  xp_earned     int default 0,
  metadata      jsonb default '{}'::jsonb,
  unique(user_id, task_key)
);

create index if not exists idx_user_tasks_user_id on public.user_tasks (user_id);
create index if not exists idx_user_tasks_user_skill on public.user_tasks (user_id, skill_key);
create index if not exists idx_user_tasks_user_status on public.user_tasks (user_id, status);

-- 4) RLS
alter table public.skills     enable row level security;
alter table public.tasks      enable row level security;
alter table public.user_tasks enable row level security;

-- global read-only catalogs (authenticated users can read)
create policy "skills: read" on public.skills for select using (auth.role() = 'authenticated');
create policy "tasks: read"  on public.tasks  for select using (auth.role() = 'authenticated');

-- user-owned tasks
create policy "user_tasks: select own" on public.user_tasks for select using (auth.uid() = user_id);
create policy "user_tasks: insert own" on public.user_tasks for insert with check (auth.uid() = user_id);
create policy "user_tasks: update own" on public.user_tasks for update using (auth.uid() = user_id);
create policy "user_tasks: delete own" on public.user_tasks for delete using (auth.uid() = user_id);

-- 5) Seed missing dashboard widgets (keys only; components live in code)
insert into public.dashboard_components (key, name, category, default_props) values
  ('task_overview', 'Task Overview', 'tasks', '{}'),
  ('daily_tasks',   'Daily Tasks',   'tasks', '{}')
on conflict (key) do nothing;

-- 6) Minimal starter catalog seed (safe no-ops if already seeded)
insert into public.skills (skill_key, skill_name, category, description, metadata) values
  ('frontend', 'Frontend', 'software_engineer', 'Build user interfaces for the web.', '{}'::jsonb),
  ('backend',  'Backend',  'software_engineer', 'Build APIs and server-side systems.', '{}'::jsonb),
  ('databases','Databases','software_engineer', 'Persist and query data safely.', '{}'::jsonb)
on conflict (skill_key) do nothing;

insert into public.tasks (task_key, title, description, skill_key, difficulty, xp_reward, estimated_minutes, task_type, order_index) values
  ('fe_html_basics', 'HTML basics', 'Create a simple page with semantic tags.', 'frontend', 'beginner', 10, 15, 'exercise', 0),
  ('fe_css_grid',    'CSS Grid layout', 'Recreate a dashboard card layout using CSS Grid.', 'frontend', 'beginner', 20, 20, 'exercise', 1),
  ('be_rest_intro',  'Build a REST endpoint', 'Create a simple GET endpoint that returns JSON.', 'backend',  'beginner', 20, 25, 'exercise', 0),
  ('db_selects',     'SQL SELECT practice', 'Write 5 SELECT queries with WHERE + ORDER BY.', 'databases','beginner', 20, 20, 'practice', 0)
on conflict (task_key) do nothing;

