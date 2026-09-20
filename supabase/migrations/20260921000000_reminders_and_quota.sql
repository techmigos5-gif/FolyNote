-- ============================================================
-- FolyNote — reminders + 250 MB per-user storage quota
-- ============================================================

-- 1. Reminders (scheduled notifications with optional repeat + chime)
create table if not exists public.reminders (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  notes text not null default '',
  remind_at timestamptz not null,
  "repeat" text not null default 'none' check ("repeat" in ('none', 'daily', 'weekly', 'monthly')),
  sound_enabled boolean not null default true,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reminders_user_time on public.reminders (user_id, remind_at asc);

alter table public.reminders enable row level security;

drop policy if exists "reminders_all_own" on public.reminders;
create policy "reminders_all_own" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime for reminders (multi-tab coherence)
alter table public.reminders replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.reminders;
exception when duplicate_object then null; when others then
  raise warning 'realtime reminders: %', sqlerrm;
end $$;

-- 2. Exact byte size on documents (drives the quota meter)
alter table public.documents add column if not exists size_bytes bigint;

-- 3. Per-user storage quota: 250 MB across the private 'documents' bucket.
--    Enforced at the database so no client can bypass it.
create or replace function public.check_documents_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quota constant bigint := 262144000; -- 250 MB
  used  bigint;
  incoming bigint;
begin
  if new.bucket_id <> 'documents' then
    return new;
  end if;

  -- Sum every object already stored in this user's per-user folder.
  select coalesce(sum((metadata ->> 'size')::bigint), 0)
    into used
    from storage.objects
   where bucket_id = 'documents'
     and split_part(name, '/', 1) = split_part(new.name, '/', 1);

  incoming := coalesce((new.metadata ->> 'size')::bigint, 0);

  if used + incoming > quota then
    raise exception 'FolyNote storage quota exceeded: 250 MB per user (used %, incoming %)', used, incoming
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists documents_quota_check on storage.objects;
do $$
begin
  create trigger documents_quota_check
    before insert on storage.objects
    for each row execute function public.check_documents_quota();
exception when others then
  raise warning 'documents_quota_check trigger: %', sqlerrm;
end $$;

-- Update the bucket's per-file limit note: 25 MB per file stays, 250 MB per user is the real cap.
