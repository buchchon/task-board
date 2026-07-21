-- Default user_id to the caller's own auth uid, so the frontend never has to
-- remember to set it manually on insert. RLS's `with check (auth.uid() = user_id)`
-- still applies even when this default fires, and still rejects any insert that
-- explicitly tries to set a different user's id.
alter table public.tasks alter column user_id set default auth.uid();
alter table public.labels alter column user_id set default auth.uid();
alter table public.task_activity alter column user_id set default auth.uid();
