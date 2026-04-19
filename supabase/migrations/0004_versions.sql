-- 0004_versions.sql — version snapshots for notes + enable realtime
-- A separate table so history lookups never scan the main notes table.

create table if not exists public.note_versions (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references public.notes(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content_json jsonb not null,
  content_text text not null default '',
  reason text not null default 'autosave'
    check (reason in ('autosave', 'manual', 'restore')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists note_versions_note_idx
  on public.note_versions (note_id, created_at desc);
create index if not exists note_versions_owner_idx
  on public.note_versions (owner_id);

alter table public.note_versions enable row level security;

create policy "versions are viewable by owner"
  on public.note_versions for select using (owner_id = auth.uid());
create policy "versions are insertable by owner"
  on public.note_versions for insert with check (owner_id = auth.uid());
create policy "versions are deletable by owner"
  on public.note_versions for delete using (owner_id = auth.uid());

-- Prune policy: keep at most 50 newest versions per note. Runs inside the
-- insert trigger so the table never unbounded-grows.
create or replace function public.tg_prune_note_versions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.note_versions v
  where v.note_id = new.note_id
    and v.id in (
      select id from public.note_versions
      where note_id = new.note_id
      order by created_at desc
      offset 50
    );
  return new;
end;
$$;

drop trigger if exists note_versions_prune on public.note_versions;
create trigger note_versions_prune
after insert on public.note_versions
for each row execute function public.tg_prune_note_versions();

-- Enable realtime for notes so clients can subscribe to postgres_changes.
-- Safe to run repeatedly: table is only added to the publication once.
do $$
begin
  perform 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and schemaname = 'public'
    and tablename = 'notes';
  if not found then
    execute 'alter publication supabase_realtime add table public.notes';
  end if;
exception
  when undefined_object then
    -- publication not present yet (self-hosted without Realtime); skip.
    null;
end $$;
