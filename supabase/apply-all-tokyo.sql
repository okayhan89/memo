-- Combined migrations for the Memo project. Paste this into the Supabase
-- dashboard → SQL Editor → New query → Run. Safe to run once on a fresh
-- project. Idempotent-ish: re-running triggers some "already exists" errors
-- on objects we create unconditionally — see `supabase db push` for the
-- supported idempotent path.

-- =====================================================================
-- 0001_init.sql
-- =====================================================================

set check_function_bodies = off;

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'ko',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.tg_set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by owner" on public.profiles;
create policy "profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles are updatable by owner" on public.profiles;
create policy "profiles are updatable by owner"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles are insertable by owner" on public.profiles;
create policy "profiles are insertable by owner"
  on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.folders (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  color text,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists folders_owner_idx on public.folders (owner_id);
create index if not exists folders_parent_idx on public.folders (parent_id);

drop trigger if exists folders_set_updated_at on public.folders;
create trigger folders_set_updated_at
before update on public.folders
for each row execute function public.tg_set_updated_at();

alter table public.folders enable row level security;
drop policy if exists "folders are viewable by owner" on public.folders;
create policy "folders are viewable by owner" on public.folders for select using (owner_id = auth.uid());
drop policy if exists "folders are insertable by owner" on public.folders;
create policy "folders are insertable by owner" on public.folders for insert with check (owner_id = auth.uid());
drop policy if exists "folders are updatable by owner" on public.folders;
create policy "folders are updatable by owner" on public.folders for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "folders are deletable by owner" on public.folders;
create policy "folders are deletable by owner" on public.folders for delete using (owner_id = auth.uid());

create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  title text not null default '',
  content_json jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  content_text text not null default '',
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  deleted_at timestamptz,
  edited_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists notes_owner_idx on public.notes (owner_id);
create index if not exists notes_folder_idx on public.notes (folder_id);
create index if not exists notes_deleted_at_idx on public.notes (deleted_at);
create index if not exists notes_edited_at_idx on public.notes (owner_id, edited_at desc);

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.tg_set_updated_at();

create or replace function public.tg_touch_edited_at()
returns trigger
language plpgsql
as $$
begin
  if new.title is distinct from old.title
     or new.content_json is distinct from old.content_json
     or new.content_text is distinct from old.content_text then
    new.edited_at := timezone('utc', now());
  end if;
  return new;
end;
$$;

drop trigger if exists notes_touch_edited_at on public.notes;
create trigger notes_touch_edited_at
before update on public.notes
for each row execute function public.tg_touch_edited_at();

alter table public.notes enable row level security;
drop policy if exists "notes are viewable by owner" on public.notes;
create policy "notes are viewable by owner" on public.notes for select using (owner_id = auth.uid());
drop policy if exists "notes are insertable by owner" on public.notes;
create policy "notes are insertable by owner" on public.notes for insert with check (owner_id = auth.uid());
drop policy if exists "notes are updatable by owner" on public.notes;
create policy "notes are updatable by owner" on public.notes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "notes are deletable by owner" on public.notes;
create policy "notes are deletable by owner" on public.notes for delete using (owner_id = auth.uid());

create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text,
  created_at timestamptz not null default timezone('utc', now())
);
create unique index if not exists tags_owner_name_lower_idx on public.tags (owner_id, lower(name));

alter table public.tags enable row level security;
drop policy if exists "tags are viewable by owner" on public.tags;
create policy "tags are viewable by owner" on public.tags for select using (owner_id = auth.uid());
drop policy if exists "tags are insertable by owner" on public.tags;
create policy "tags are insertable by owner" on public.tags for insert with check (owner_id = auth.uid());
drop policy if exists "tags are updatable by owner" on public.tags;
create policy "tags are updatable by owner" on public.tags for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "tags are deletable by owner" on public.tags;
create policy "tags are deletable by owner" on public.tags for delete using (owner_id = auth.uid());

create table if not exists public.note_tags (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (note_id, tag_id)
);
create index if not exists note_tags_tag_idx on public.note_tags (tag_id);
create index if not exists note_tags_owner_idx on public.note_tags (owner_id);

alter table public.note_tags enable row level security;
drop policy if exists "note_tags are viewable by owner" on public.note_tags;
create policy "note_tags are viewable by owner" on public.note_tags for select using (owner_id = auth.uid());
drop policy if exists "note_tags are insertable by owner" on public.note_tags;
create policy "note_tags are insertable by owner" on public.note_tags for insert with check (owner_id = auth.uid());
drop policy if exists "note_tags are deletable by owner" on public.note_tags;
create policy "note_tags are deletable by owner" on public.note_tags for delete using (owner_id = auth.uid());

-- =====================================================================
-- 0002_search.sql
-- =====================================================================

alter table public.notes
  add column if not exists search_tsv tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(content_text, '')), 'B')
  ) stored;

create index if not exists notes_search_tsv_idx on public.notes using gin (search_tsv);
create index if not exists notes_title_trgm_idx on public.notes using gin (title gin_trgm_ops);
create index if not exists notes_content_trgm_idx on public.notes using gin (content_text gin_trgm_ops);

-- =====================================================================
-- 0003_search_escape.sql
-- =====================================================================

create or replace function public.search_notes(
  p_query text,
  p_limit integer default 20
)
returns table (
  id uuid,
  title text,
  snippet text,
  rank real,
  edited_at timestamptz,
  is_favorite boolean,
  is_pinned boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_owner uuid := auth.uid();
  v_query text := coalesce(trim(p_query), '');
  v_ts tsquery;
begin
  if v_owner is null then
    return;
  end if;
  if v_query = '' then
    return;
  end if;

  v_ts := plainto_tsquery('simple', v_query);

  return query
    with fts as (
      select
        n.id, n.title, n.content_text, n.edited_at, n.is_favorite, n.is_pinned,
        ts_rank(n.search_tsv, v_ts) as fts_rank,
        greatest(
          similarity(coalesce(n.title, ''), v_query),
          similarity(coalesce(n.content_text, ''), v_query)
        ) as trgm_rank
      from public.notes n
      where n.owner_id = v_owner and n.deleted_at is null
        and (
          (v_ts <> '' and n.search_tsv @@ v_ts)
          or coalesce(n.title, '') ilike '%' || v_query || '%'
          or coalesce(n.content_text, '') ilike '%' || v_query || '%'
          or similarity(coalesce(n.title, ''), v_query) > 0.15
          or similarity(coalesce(n.content_text, ''), v_query) > 0.1
        )
    )
    select
      fts.id, fts.title,
      case
        when fts.content_text ilike '%' || v_query || '%'
          then ts_headline('simple', fts.content_text, plainto_tsquery('simple', v_query),
            'StartSel=«mark»,StopSel=«/mark»,MaxFragments=2,MaxWords=25,MinWords=8,ShortWord=2,FragmentDelimiter=" · "')
        else left(fts.content_text, 140)
      end as snippet,
      (fts.fts_rank * 2.0 + fts.trgm_rank)::real as rank,
      fts.edited_at, fts.is_favorite, fts.is_pinned
    from fts
    order by rank desc, fts.edited_at desc
    limit least(greatest(p_limit, 1), 100);
end;
$$;

grant execute on function public.search_notes(text, integer) to anon, authenticated;

-- =====================================================================
-- 0004_versions.sql
-- =====================================================================

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
create index if not exists note_versions_note_idx on public.note_versions (note_id, created_at desc);
create index if not exists note_versions_owner_idx on public.note_versions (owner_id);

alter table public.note_versions enable row level security;
drop policy if exists "versions are viewable by owner" on public.note_versions;
create policy "versions are viewable by owner" on public.note_versions for select using (owner_id = auth.uid());
drop policy if exists "versions are insertable by owner" on public.note_versions;
create policy "versions are insertable by owner" on public.note_versions for insert with check (owner_id = auth.uid());
drop policy if exists "versions are deletable by owner" on public.note_versions;
create policy "versions are deletable by owner" on public.note_versions for delete using (owner_id = auth.uid());

create or replace function public.tg_prune_note_versions()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.note_versions v
  where v.note_id = new.note_id
    and v.id in (
      select id from public.note_versions where note_id = new.note_id order by created_at desc offset 50
    );
  return new;
end;
$$;

drop trigger if exists note_versions_prune on public.note_versions;
create trigger note_versions_prune
after insert on public.note_versions
for each row execute function public.tg_prune_note_versions();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    execute 'alter publication supabase_realtime add table public.notes';
  end if;
exception when undefined_object then
  null;
end $$;

-- =====================================================================
-- Done! Tables: profiles, folders, notes, tags, note_tags, note_versions
-- Function: search_notes(text, integer)
-- =====================================================================
-- 0005_storage.sql — public storage bucket for note images
-- Layout: {owner_id}/{yyyy}/{mm}/{uuid}.{ext}
-- Read: public (so <img src> works without signed URLs in shares)
-- Write: authenticated owners only (enforced by folder prefix = auth.uid())

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-images',
  'note-images',
  true,
  10 * 1024 * 1024,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Policies
drop policy if exists "public read note images" on storage.objects;
create policy "public read note images"
  on storage.objects for select
  using (bucket_id = 'note-images');

drop policy if exists "owners can upload note images" on storage.objects;
create policy "owners can upload note images"
  on storage.objects for insert
  with check (
    bucket_id = 'note-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "owners can update their note images" on storage.objects;
create policy "owners can update their note images"
  on storage.objects for update
  using (
    bucket_id = 'note-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "owners can delete their note images" on storage.objects;
create policy "owners can delete their note images"
  on storage.objects for delete
  using (
    bucket_id = 'note-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
