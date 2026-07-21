-- Kanban task board schema: tasks, labels, task_labels (join), task_activity.
-- Every row is owned by a Supabase Auth user (anonymous guest sessions included,
-- since anonymous sign-in still creates a real row in auth.users with a stable uuid).
-- RLS is enabled on every table so a user can only read/write their own data.

-- ── tasks ────────────────────────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  due_date date,
  created_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks (user_id);

alter table public.tasks enable row level security;

create policy "select own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "update own tasks" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- ── labels ───────────────────────────────────────────────────────────────
create table public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create index labels_user_id_idx on public.labels (user_id);

alter table public.labels enable row level security;

create policy "select own labels" on public.labels
  for select using (auth.uid() = user_id);

create policy "insert own labels" on public.labels
  for insert with check (auth.uid() = user_id);

create policy "update own labels" on public.labels
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own labels" on public.labels
  for delete using (auth.uid() = user_id);

-- ── task_labels (join table) ────────────────────────────────────────────
-- No user_id column of its own — ownership is checked by joining back to
-- tasks/labels, and both sides must belong to the caller (prevents attaching
-- someone else's label to your task, or vice versa).
create table public.task_labels (
  task_id uuid not null references public.tasks (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  primary key (task_id, label_id)
);

create index task_labels_label_id_idx on public.task_labels (label_id);

alter table public.task_labels enable row level security;

create policy "select own task_labels" on public.task_labels
  for select using (
    exists (select 1 from public.tasks where tasks.id = task_labels.task_id and tasks.user_id = auth.uid())
  );

create policy "insert own task_labels" on public.task_labels
  for insert with check (
    exists (select 1 from public.tasks where tasks.id = task_labels.task_id and tasks.user_id = auth.uid())
    and exists (select 1 from public.labels where labels.id = task_labels.label_id and labels.user_id = auth.uid())
  );

create policy "delete own task_labels" on public.task_labels
  for delete using (
    exists (select 1 from public.tasks where tasks.id = task_labels.task_id and tasks.user_id = auth.uid())
  );

-- ── task_activity (activity log) ────────────────────────────────────────
create table public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create index task_activity_task_id_idx on public.task_activity (task_id);

alter table public.task_activity enable row level security;

create policy "select own task_activity" on public.task_activity
  for select using (auth.uid() = user_id);

create policy "insert own task_activity" on public.task_activity
  for insert with check (auth.uid() = user_id);
