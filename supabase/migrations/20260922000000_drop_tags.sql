-- ============================================================
-- FolyNote — remove the Tags feature (superseded by per-item
-- tag fields on thoughts/documents/ideas)
-- ============================================================

-- Realtime: stop broadcasting the table first so no change lands
-- after the drop.
do $$ begin
  alter publication supabase_realtime drop table public.tags;
exception when undefined_object then null; when others then
  raise warning 'realtime tags drop: %', sqlerrm;
end $$;

drop table if exists public.tags cascade;
