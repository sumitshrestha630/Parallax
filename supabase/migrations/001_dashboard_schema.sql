-- ============================================================
-- Rooted – dashboard schema, RLS, and new-user trigger
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. Tables ────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text,
  email       text,
  created_at  timestamptz default now()
);

-- Catalog of available dashboard widgets (shared, not per-user)
create table if not exists public.dashboard_components (
  id            uuid primary key default gen_random_uuid(),
  key           text unique not null,
  name          text not null,
  category      text,
  default_props jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);

-- What widgets a specific user has and their saved configuration
create table if not exists public.user_dashboard_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  component_key text not null references public.dashboard_components(key),
  props         jsonb default '{}'::jsonb,
  layout        jsonb default '{"x":0,"y":0,"w":4,"h":3}'::jsonb,
  visible       boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Per-user skill progression (source of truth for gamification)
create table if not exists public.user_skills (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  skill_key  text not null,
  skill_name text not null,
  level      int default 1,
  xp         int default 0,
  unlocked   boolean default false,
  metadata   jsonb default '{}'::jsonb,   -- stores ex, ey, color, path, dashDuration
  updated_at timestamptz default now(),
  unique(user_id, skill_key)
);

-- Earned badges / achievements
create table if not exists public.user_achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  badge_key   text not null,
  title       text not null,
  description text,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- Global dashboard preferences per user
create table if not exists public.user_dashboard_state (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid unique not null references auth.users(id) on delete cascade,
  theme              text default 'default',
  active_avatar      text,
  selected_path      text default 'software_engineer',
  sidebar_collapsed  boolean default false,
  metadata           jsonb default '{}'::jsonb,
  updated_at         timestamptz default now()
);

-- ── 2. Catalog seed ──────────────────────────────────────────

insert into public.dashboard_components (key, name, category, default_props) values
  ('career_map',        'Career Map',        'visualization', '{}'),
  ('skill_tree',        'Skill Tree',        'progress',      '{"trackId":"software_engineer"}'),
  ('stats_card',        'Stats Card',        'stats',         '{}'),
  ('dashboard_pills',   'Dashboard Pills',   'visualization', '{}'),
  ('achievement_panel', 'Achievement Panel', 'gamification',  '{}'),
  ('mentor_matches',    'Mentor Matches',    'social',        '{}'),
  ('roadmap_progress',  'Roadmap Progress',  'progress',      '{}')
on conflict (key) do nothing;

-- ── 3. Row Level Security ────────────────────────────────────

alter table public.profiles              enable row level security;
alter table public.dashboard_components  enable row level security;
alter table public.user_dashboard_items  enable row level security;
alter table public.user_skills           enable row level security;
alter table public.user_achievements     enable row level security;
alter table public.user_dashboard_state  enable row level security;

-- profiles
create policy "profiles: select own"  on public.profiles for select using (auth.uid() = id);
create policy "profiles: insert own"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: update own"  on public.profiles for update using (auth.uid() = id);

-- dashboard_components is a shared catalog – public read, no writes from client
create policy "components: public read" on public.dashboard_components for select using (true);

-- user_dashboard_items
create policy "items: select own" on public.user_dashboard_items for select using (auth.uid() = user_id);
create policy "items: insert own" on public.user_dashboard_items for insert with check (auth.uid() = user_id);
create policy "items: update own" on public.user_dashboard_items for update using (auth.uid() = user_id);
create policy "items: delete own" on public.user_dashboard_items for delete using (auth.uid() = user_id);

-- user_skills
create policy "skills: select own" on public.user_skills for select using (auth.uid() = user_id);
create policy "skills: insert own" on public.user_skills for insert with check (auth.uid() = user_id);
create policy "skills: update own" on public.user_skills for update using (auth.uid() = user_id);

-- user_achievements
create policy "achievements: select own" on public.user_achievements for select using (auth.uid() = user_id);
create policy "achievements: insert own" on public.user_achievements for insert with check (auth.uid() = user_id);
create policy "achievements: update own" on public.user_achievements for update using (auth.uid() = user_id);

-- user_dashboard_state
create policy "state: select own" on public.user_dashboard_state for select using (auth.uid() = user_id);
create policy "state: insert own" on public.user_dashboard_state for insert with check (auth.uid() = user_id);
create policy "state: update own" on public.user_dashboard_state for update using (auth.uid() = user_id);

-- ── 4. updated_at auto-touch helper ─────────────────────────

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_user_dashboard_items_updated_at
  before update on public.user_dashboard_items
  for each row execute function public.touch_updated_at();

create trigger touch_user_skills_updated_at
  before update on public.user_skills
  for each row execute function public.touch_updated_at();

create trigger touch_user_dashboard_state_updated_at
  before update on public.user_dashboard_state
  for each row execute function public.touch_updated_at();

-- ── 5. New-user bootstrap trigger ───────────────────────────
-- Fires after a row is inserted into auth.users (OAuth or email signup).
-- Creates: profile, dashboard state, starter dashboard items, starter skills.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  goal_path text;
begin
  goal_path := coalesce(new.raw_user_meta_data->>'goal', 'software_engineer');

  -- Profile row
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  -- Dashboard state
  insert into public.user_dashboard_state (user_id, active_avatar, selected_path)
  values (
    new.id,
    new.raw_user_meta_data->>'avatar_type',
    goal_path
  )
  on conflict (user_id) do nothing;

  -- Starter dashboard items
  insert into public.user_dashboard_items (user_id, component_key, sort_order, layout)
  values
    (new.id, 'career_map',        0, '{"x":0,"y":0,"w":8,"h":5}'),
    (new.id, 'skill_tree',        1, '{"x":0,"y":5,"w":8,"h":6}'),
    (new.id, 'stats_card',        2, '{"x":8,"y":0,"w":4,"h":4}'),
    (new.id, 'dashboard_pills',   3, '{"x":8,"y":4,"w":4,"h":3}'),
    (new.id, 'achievement_panel', 4, '{"x":8,"y":7,"w":4,"h":4}')
  on conflict do nothing;

  -- Starter skills (metadata holds SVG layout for CpuArchitecture)
  insert into public.user_skills (user_id, skill_key, skill_name, xp, level, unlocked, metadata)
  values
    (new.id, 'frontend',   'Frontend',   0, 1, true,  '{"ex":45,"ey":40,"color":"#60A5FA","dashDuration":"2.0s","path":"M 120 65 L 70 65 L 70 40 L 45 40"}'),
    (new.id, 'aiml',       'AI / ML',    0, 1, true,  '{"ex":45,"ey":110,"color":"#A78BFA","dashDuration":"2.4s","path":"M 120 85 L 65 85 L 65 110 L 45 110"}'),
    (new.id, 'backend',    'Backend',    0, 1, true,  '{"ex":255,"ey":40,"color":"#6ED640","dashDuration":"1.8s","path":"M 180 65 L 230 65 L 230 40 L 255 40"}'),
    (new.id, 'devops',     'DevOps',     0, 1, false, '{"ex":255,"ey":110,"color":"#FBBF24","dashDuration":"2.6s","path":"M 180 85 L 235 85 L 235 110 L 255 110"}'),
    (new.id, 'cloud',      'Cloud',      0, 1, false, '{"ex":88,"ey":20,"color":"#22D3EE","dashDuration":"2.2s","path":"M 140 57 L 140 35 L 88 35 L 88 20"}'),
    (new.id, 'networking', 'Networking', 0, 1, false, '{"ex":212,"ey":20,"color":"#34D399","dashDuration":"1.6s","path":"M 160 57 L 160 25 L 212 25 L 212 20"}'),
    (new.id, 'databases',  'Databases',  0, 1, true,  '{"ex":88,"ey":130,"color":"#F472B6","dashDuration":"2.8s","path":"M 140 93 L 140 115 L 88 115 L 88 130"}'),
    (new.id, 'projects',   'Projects',   0, 1, true,  '{"ex":212,"ey":130,"color":"#FB923C","dashDuration":"2.0s","path":"M 160 93 L 160 125 L 212 125 L 212 130"}')
  on conflict (user_id, skill_key) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
