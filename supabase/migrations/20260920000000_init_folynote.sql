-- ============================================================
-- FolyNote — initial schema
-- Your files. Your thoughts. Your space.
-- ============================================================

-- 1. User profile (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'FolyNote User',
  mobile text not null default '',
  avatar_letter text not null default 'U',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Daily thoughts (journal entries)
create table if not exists public.thoughts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  entry_time text not null default '',
  title text not null default '',
  content text not null default '',
  tags jsonb not null default '[]'::jsonb,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_thoughts_user_date on public.thoughts (user_id, entry_date desc);

-- 3. Pinned items (cross-entity pinboard)
create table if not exists public.pinned_items (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('note', 'idea', 'pdf', 'doc')),
  title text not null default '',
  content text not null default '',
  pin_date text not null default '',
  tag_label text not null default '',
  color text not null default 'blue',
  target_view text not null default 'daily-thoughts',
  target_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_pins_user on public.pinned_items (user_id, created_at desc);

-- 4. Documents (metadata; binary content lives in Storage)
create table if not exists public.documents (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  doc_type text not null default 'txt',
  size_label text not null default '',
  page_count int not null default 1,
  last_modified text not null default '',
  tags jsonb not null default '[]'::jsonb,
  is_pinned boolean not null default false,
  content text not null default '',
  storage_path text,
  mime_type text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_documents_user on public.documents (user_id, created_at desc);

-- 5. Ideas
create table if not exists public.ideas (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  tag text not null default '',
  idea_date text not null default '',
  is_starred boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ideas_user on public.ideas (user_id, created_at desc);

-- 6. Tags
create table if not exists public.tags (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default 'purple',
  count int not null default 0,
  unique (user_id, name)
);

-- ============================================================
-- RLS: every table is strictly owner-scoped
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.thoughts      enable row level security;
alter table public.pinned_items  enable row level security;
alter table public.documents     enable row level security;
alter table public.ideas         enable row level security;
alter table public.tags          enable row level security;

-- Profiles: users can read/update only their own row (no insert needed; trigger creates it)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Per-entity policies (full CRUD on own rows only)
drop policy if exists "thoughts_all_own" on public.thoughts;
create policy "thoughts_all_own" on public.thoughts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pinned_items_all_own" on public.pinned_items;
create policy "pinned_items_all_own" on public.pinned_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "documents_all_own" on public.documents;
create policy "documents_all_own" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ideas_all_own" on public.ideas;
create policy "ideas_all_own" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tags_all_own" on public.tags;
create policy "tags_all_own" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Auto-provision a profile row for every new auth user
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, mobile, avatar_letter)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'FolyNote User'),
    coalesce(new.raw_user_meta_data ->> 'mobile', ''),
    upper(left(coalesce(new.raw_user_meta_data ->> 'display_name', 'U'), 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
-- Wrapped so a permission quirk on hosted stacks can never roll back the
-- whole migration; a warning is emitted instead.
do $$
begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception when others then
  raise warning 'on_auth_user_created trigger: %', sqlerrm;
end $$;

-- ============================================================
-- Storage: private per-user document bucket
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 26214400,
  array['application/pdf', 'text/plain', 'text/markdown', 'application/json']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 26214400,
      allowed_mime_types = array['application/pdf', 'text/plain', 'text/markdown', 'application/json'];

-- Storage policies: {userId}/* paths only, authenticated users only
drop policy if exists "documents_insert_own" on storage.objects;
create policy "documents_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_select_own" on storage.objects;
create policy "documents_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_update_own" on storage.objects;
create policy "documents_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_delete_own" on storage.objects;
create policy "documents_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- Realtime: broadcast row changes to the owner's open tabs
-- ============================================================
alter table public.thoughts replica identity full;
alter table public.pinned_items replica identity full;
alter table public.documents replica identity full;
alter table public.ideas replica identity full;
alter table public.tags replica identity full;

-- The supabase_realtime publication is platform-managed on hosted projects
-- and must never be dropped/recreated here. Tables are added idempotently;
-- on a bare local stack the publication is created first if missing.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
exception when others then
  raise warning 'supabase_realtime publication: %', sqlerrm;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.thoughts;
exception when duplicate_object then null; when others then
  raise warning 'realtime thoughts: %', sqlerrm;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.pinned_items;
exception when duplicate_object then null; when others then
  raise warning 'realtime pinned_items: %', sqlerrm;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.documents;
exception when duplicate_object then null; when others then
  raise warning 'realtime documents: %', sqlerrm;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.ideas;
exception when duplicate_object then null; when others then
  raise warning 'realtime ideas: %', sqlerrm;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.tags;
exception when duplicate_object then null; when others then
  raise warning 'realtime tags: %', sqlerrm;
end $$;
