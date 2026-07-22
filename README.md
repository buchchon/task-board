# Kanban Task Board

A full-stack Kanban board — Vue 3 + Supabase, built as a solo internship take-home assessment.

**Live demo:** https://task-board-olive-six.vercel.app
**Repo:** https://github.com/buchchon/task-board

## Features

- Four-column board (To Do / In Progress / In Review / Done) with drag-and-drop between columns; the new status persists on drop.
- Task CRUD: create/edit/delete, with title (required), description, priority, and due date.
- Task detail panel (slide-over) with an activity log — one line per meaningful change ("Moved To Do → In Progress", "Changed priority to High", "Added label \"Bug\"", ...), newest first, relative timestamps.
- Labels/tags: create labels from a fixed 8-color swatch palette, attach/detach from the detail panel, filter the board by one or more labels (matches if a task has *any* selected label).
- Due-date urgency badges (overdue / due soon / normal).
- Loading skeletons, empty states, and a dismissable error banner.
- Responsive (mobile → desktop) and dark mode (auto-detects OS preference, persists an explicit toggle).
- Anonymous auth + Row Level Security — each guest session only ever sees its own data.

## Stack

Vue 3 (Composition API, `<script setup>`) + TypeScript + Vite · Tailwind CSS + shadcn-vue (Reka UI) · vuedraggable (SortableJS) · Supabase (Postgres + anonymous auth + RLS) · Vercel

## Data model

Four tables, all with Row Level Security enabled and `user_id` defaulting to `auth.uid()` server-side (see **Security** below).

```sql
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

-- ── defaults ─────────────────────────────────────────────────────────────
-- user_id defaults to the caller's own auth uid, so the frontend never sets
-- it manually on insert. RLS's `with check` still applies even when this
-- default fires, and still rejects any insert that explicitly tries to set
-- a different user's id.
alter table public.tasks alter column user_id set default auth.uid();
alter table public.labels alter column user_id set default auth.uid();
alter table public.task_activity alter column user_id set default auth.uid();
```

## Security

- Every row is owned by a Supabase Auth user — including guests. Anonymous sign-in still creates a real row in `auth.users` with a stable UUID, so a returning guest (session persisted via `supabase-js`'s default localStorage handling) keeps seeing their own data across reloads.
- **Row Level Security is enabled on every table.** Each policy checks `auth.uid() = user_id` (or, for the `task_labels` join table which has no `user_id` of its own, that both the task and the label it references belong to the caller). A guest can never read or write another guest's rows, even if they knew the row's `id`.
- The frontend only ever uses the **public anon key** (`VITE_SUPABASE_ANON_KEY`) — never the `service_role` key, which would bypass RLS entirely. The anon key is safe to expose in the browser bundle; RLS is what actually protects the data, not secrecy of the key.
- `user_id` defaults to `auth.uid()` at the database level, so the frontend never sets it manually — and RLS's `with check` still rejects any insert that tries to spoof a different user's id even if a default were bypassed.

## Local setup

1. **Create a Supabase project** (free tier) at [supabase.com](https://supabase.com).
2. **Enable anonymous sign-ins**: Supabase dashboard → Authentication → Sign In / Providers → toggle on "Allow anonymous sign-ins". (This is a project setting, not something a migration can turn on.)
3. **Apply the schema**: either paste the SQL above into the Supabase SQL Editor, or, if you have the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) installed:
   ```sh
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
4. **Env vars**: copy `.env.example` to `.env` and fill in your project's URL and anon key (Supabase dashboard → Project Settings → API):
   ```sh
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
5. **Install and run**:
   ```sh
   npm install
   npm run dev
   ```

## Commands

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run type-check` — type-check only
- `npm run lint` — lint and auto-fix
- Deploy: automatic on push to `main` via Vercel
