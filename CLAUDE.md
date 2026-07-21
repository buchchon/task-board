# CLAUDE.md — Kanban Task Board

Persistent context for this project. Read at the start of every session.

## Project
A polished, full-stack Kanban task board, built solo as an internship assessment. Free tiers only ($0). **Design quality is the top graded criterion** — it must look intentional and polished (Linear / Notion / Asana), not a generic todo list.

## How to work with me
- **Vue is the only frontend framework I know.** Build in **Vue 3 (Composition API, `<script setup>`)**, kept idiomatic and readable. I'm new to shadcn-vue, Supabase, and vuedraggable — flag framework-specific things I should learn.
- I need to **understand and defend every part in an interview.** Explain any non-obvious decision as you make it — especially the **auth/RLS** and the **drag-and-drop data flow.** No black boxes.
- Work incrementally and **check in with me before moving to the next roadmap step.**
- Never commit secrets; use env vars.

## Stack (do not substitute)
- Vue 3 + TypeScript + Vite
- Tailwind CSS + shadcn-vue (Reka UI) — components & polish
- vuedraggable@next (SortableJS for Vue 3) — drag-and-drop
- Supabase (free tier) — Postgres + anonymous auth + Row Level Security
- Vercel — hosting / live demo; GitHub — public repo

## Data model (Supabase)
`tasks`: `id` uuid pk default `gen_random_uuid()` · `title` text required · `status` text (`todo`|`in_progress`|`in_review`|`done`) · `description` text null · `priority` text (`low`|`normal`|`high`) default `normal` · `due_date` date null · `user_id` uuid · `created_at` timestamptz default `now()`

Advanced features: `labels` (id, user_id, name, color) + `task_labels` join (task_id, label_id); `task_activity` (id, task_id, user_id, type, detail, created_at).

## Security (explicitly graded)
- Supabase anonymous sign-in; create a guest session on first load and persist it.
- Every row carries `user_id` = guest id. **RLS enabled** so each guest only reads/writes their own rows. Verify User A never sees User B's data.
- Frontend uses only the public anon key. Never expose or commit the `service_role` key.

## Features
**Required:** 4 columns (To Do / In Progress / In Review / Done); drag between columns updates status and persists on drop; create task (title required; optional description / priority / due date); clear loading + error states.

**Advanced (build two, well):** (1) labels/tags with board filtering; (2) task detail panel with an activity log ("Moved To Do → In Progress · 2h ago"). Optional third if quick: due-date badges (soon/overdue). Skip team members / assignees.

## Design principles (the priority)
Restrained palette: neutral base + one accent. One typeface (Inter). Consistent spacing, subtle borders + soft shadows. Clear column/card hierarchy. Drag: card lifts with a shadow, target column highlights. Real empty states, loading skeletons, error handling. Responsive. Dark mode (shadcn-vue CSS variables) is a nice-to-have. It should look like a tool a team would actually use daily.

## Roadmap (build in order; check in at each step)
1. Scaffold Vue + TS + Vite + Tailwind + shadcn-vue; push to GitHub; deploy an empty shell to Vercel first.
2. Supabase: schema + anon auth + RLS; test A/B isolation before building UI.
3. Board UI static with fake data — nail the design here.
4. Wire vuedraggable + persist on drop.
5. Task CRUD + detail panel.
6. Two advanced features.
7. Polish pass: states + responsive.
8. Writeup: design decisions, tradeoffs, what I'd improve.

## Deliverables
Public GitHub repo · live Vercel URL · full SQL schema in README · local setup steps · short writeup.

## Commands
(fill in once scaffolded)
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: auto on push to `main` via Vercel
