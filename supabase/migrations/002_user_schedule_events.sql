-- ============================================================
-- Balance: weekly schedule events
-- ============================================================

create table if not exists public.user_schedule_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  type        text not null check (type in ('class', 'work', 'custom')),
  day         text not null check (day in ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')),
  start_time  text not null,
  end_time    text not null,
  intensity   text not null check (intensity in ('busy', 'medium')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_user_schedule_events_user_id
  on public.user_schedule_events (user_id);

create index if not exists idx_user_schedule_events_user_day
  on public.user_schedule_events (user_id, day);

alter table public.user_schedule_events enable row level security;

create policy "schedule: select own"
  on public.user_schedule_events for select
  using (auth.uid() = user_id);

create policy "schedule: insert own"
  on public.user_schedule_events for insert
  with check (auth.uid() = user_id);

create policy "schedule: update own"
  on public.user_schedule_events for update
  using (auth.uid() = user_id);

create policy "schedule: delete own"
  on public.user_schedule_events for delete
  using (auth.uid() = user_id);

create trigger touch_user_schedule_events_updated_at
  before update on public.user_schedule_events
  for each row execute function public.touch_updated_at();
