-- Task comments: same ownership model as task_activity (owned by the
-- commenting user, no update/delete — the spec only calls for writing and
-- reading a chronological thread, not editing history).
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_task_id_idx on public.comments (task_id);

alter table public.comments enable row level security;

create policy "select own comments" on public.comments
  for select using (auth.uid() = user_id);

create policy "insert own comments" on public.comments
  for insert with check (auth.uid() = user_id);

alter table public.comments alter column user_id set default auth.uid();
