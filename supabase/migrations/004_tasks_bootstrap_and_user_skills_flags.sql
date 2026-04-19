-- ============================================================
-- Rooted – user_skills flags + starter user_tasks assignment
-- ============================================================

-- 1) Add per-skill state flags (safe for existing rows)
alter table public.user_skills
  add column if not exists in_progress boolean default false,
  add column if not exists completed   boolean default false;

-- 2) Ensure starter task widgets are included for new users
-- We recreate `public.handle_new_user()` to also:
-- - create task widgets
-- - assign starter user_tasks from beginner/global tasks for unlocked skills

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  goal_path text;
begin
  goal_path := coalesce(new.raw_user_meta_data->>'goal', 'software_engineer');

  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

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
    (new.id, 'achievement_panel', 4, '{"x":8,"y":7,"w":4,"h":4}'),
    (new.id, 'task_overview',     5, '{"x":0,"y":11,"w":12,"h":3}')
  on conflict do nothing;

  -- Starter skills
  insert into public.user_skills (user_id, skill_key, skill_name, xp, level, unlocked, in_progress, completed, metadata)
  values
    (new.id, 'frontend',   'Frontend',   0, 1, true,  true,  false, '{"ex":45,"ey":40,"color":"#60A5FA","dashDuration":"2.0s","path":"M 120 65 L 70 65 L 70 40 L 45 40"}'),
    (new.id, 'aiml',       'AI / ML',    0, 1, true,  false, false, '{"ex":45,"ey":110,"color":"#A78BFA","dashDuration":"2.4s","path":"M 120 85 L 65 85 L 65 110 L 45 110"}'),
    (new.id, 'backend',    'Backend',    0, 1, true,  false, false, '{"ex":255,"ey":40,"color":"#6ED640","dashDuration":"1.8s","path":"M 180 65 L 230 65 L 230 40 L 255 40"}'),
    (new.id, 'devops',     'DevOps',     0, 1, false, false, false, '{"ex":255,"ey":110,"color":"#FBBF24","dashDuration":"2.6s","path":"M 180 85 L 235 85 L 235 110 L 255 110"}'),
    (new.id, 'cloud',      'Cloud',      0, 1, false, false, false, '{"ex":88,"ey":20,"color":"#22D3EE","dashDuration":"2.2s","path":"M 140 57 L 140 35 L 88 35 L 88 20"}'),
    (new.id, 'networking', 'Networking', 0, 1, false, false, false, '{"ex":212,"ey":20,"color":"#34D399","dashDuration":"1.6s","path":"M 160 57 L 160 25 L 212 25 L 212 20"}'),
    (new.id, 'databases',  'Databases',  0, 1, true,  false, false, '{"ex":88,"ey":130,"color":"#F472B6","dashDuration":"2.8s","path":"M 140 93 L 140 115 L 88 115 L 88 130"}'),
    (new.id, 'projects',   'Projects',   0, 1, true,  false, false, '{"ex":212,"ey":130,"color":"#FB923C","dashDuration":"2.0s","path":"M 160 93 L 160 125 L 212 125 L 212 130"}')
  on conflict (user_id, skill_key) do nothing;

  -- Starter user_tasks: beginner tasks for skills that start unlocked.
  insert into public.user_tasks (user_id, task_key, skill_key, status)
  select
    new.id,
    t.task_key,
    t.skill_key,
    'available'
  from public.tasks t
  where coalesce(t.difficulty, 'beginner') = 'beginner'
    and t.skill_key in ('frontend','backend','databases')
  on conflict (user_id, task_key) do nothing;

  return new;
end;
$$;

