-- ============================================================
-- FolyNote — Tasks board + storage upload fix
-- ============================================================

-- 1. Tasks (creative kanban-style board: backlog -> active -> done)
create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text not null default '',
  status text not null default 'backlog' check (status in ('backlog', 'active', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tasks_user on public.tasks (user_id, created_at desc);

alter table public.tasks enable row level security;

drop policy if exists "tasks_all_own" on public.tasks;
create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.tasks replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null; when others then
  raise warning 'realtime tasks: %', sqlerrm;
end $$;

-- 2. Storage upload fix: the bucket's allowed_mime_types whitelist was
--    silently rejecting every file type outside four entries (docx, images,
--    zip, ...) so uploads never stored a storage_path. Allow any MIME type;
--    the 25 MB per-file + 250 MB per-user caps still apply.
update storage.buckets
   set allowed_mime_types = null,
       file_size_limit = 26214400
 where id = 'documents';
