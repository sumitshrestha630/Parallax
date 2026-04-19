-- Resume analyses: stores AI-generated resume analysis results per user
create table if not exists resume_analyses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  target_role text not null,
  score       integer not null check (score >= 0 and score <= 100),
  result      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Users can only read/write their own analyses
alter table resume_analyses enable row level security;

create policy "Users manage own resume analyses"
  on resume_analyses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fetching a user's latest analyses
create index if not exists resume_analyses_user_created
  on resume_analyses (user_id, created_at desc);
