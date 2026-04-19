-- ============================================================
-- Backfill starter user_tasks for accounts created before
-- `handle_new_user` assigned tasks (migration 004).
-- Idempotent: ON CONFLICT DO NOTHING per (user_id, task_key).
-- ============================================================

insert into public.user_tasks (user_id, task_key, skill_key, status)
select
  u.id,
  t.task_key,
  t.skill_key,
  'available'
from auth.users u
cross join public.tasks t
where coalesce(t.difficulty, 'beginner') = 'beginner'
  and t.skill_key in ('frontend', 'backend', 'databases')
on conflict (user_id, task_key) do nothing;
