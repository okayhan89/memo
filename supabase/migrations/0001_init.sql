-- 0001_init.sql — core schema for profiles, folders, notes, tags
-- Note: Supabase `auth.users` provides the user identity.
-- All tables have RLS enabled. Owner is derived from auth.uid().

set check_function_bodies = off;

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ───────────────────────────── shared helpers ─────────────────────────────

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ───────────────────────────── profiles ─────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'ko',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.tg_set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth.users row appears.
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

-- ───────────────────────────── folders ─────────────────────────────

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

create index folders_owner_idx on public.folders (owner_id);
create index folders_parent_idx on public.folders (parent_id);

create trigger folders_set_updated_at
before update on public.folders
for each row execute function public.tg_set_updated_at();

alter table public.folders enable row level security;

create policy "folders are viewable by owner"
  on public.folders for select using (owner_id = auth.uid());
create policy "folders are insertable by owner"
  on public.folders for insert with check (owner_id = auth.uid());
create policy "folders are updatable by owner"
  on public.folders for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "folders are deletable by owner"
  on public.folders for delete using (owner_id = auth.uid());

-- ───────────────────────────── notes ─────────────────────────────

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

create index notes_owner_idx on public.notes (owner_id);
create index notes_folder_idx on public.notes (folder_id);
create index notes_deleted_at_idx on public.notes (deleted_at);
create index notes_edited_at_idx on public.notes (owner_id, edited_at desc);

create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.tg_set_updated_at();

-- Bump edited_at whenever content actually changes.
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

create trigger notes_touch_edited_at
before update on public.notes
for each row execute function public.tg_touch_edited_at();

alter table public.notes enable row level security;

create policy "notes are viewable by owner"
  on public.notes for select using (owner_id = auth.uid());
create policy "notes are insertable by owner"
  on public.notes for insert with check (owner_id = auth.uid());
create policy "notes are updatable by owner"
  on public.notes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "notes are deletable by owner"
  on public.notes for delete using (owner_id = auth.uid());

-- ───────────────────────────── tags ─────────────────────────────

create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index tags_owner_name_lower_idx on public.tags (owner_id, lower(name));

alter table public.tags enable row level security;

create policy "tags are viewable by owner"
  on public.tags for select using (owner_id = auth.uid());
create policy "tags are insertable by owner"
  on public.tags for insert with check (owner_id = auth.uid());
create policy "tags are updatable by owner"
  on public.tags for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "tags are deletable by owner"
  on public.tags for delete using (owner_id = auth.uid());

-- ───────────────────────────── note_tags ─────────────────────────────

create table if not exists public.note_tags (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (note_id, tag_id)
);

create index note_tags_tag_idx on public.note_tags (tag_id);
create index note_tags_owner_idx on public.note_tags (owner_id);

alter table public.note_tags enable row level security;

create policy "note_tags are viewable by owner"
  on public.note_tags for select using (owner_id = auth.uid());
create policy "note_tags are insertable by owner"
  on public.note_tags for insert with check (owner_id = auth.uid());
create policy "note_tags are deletable by owner"
  on public.note_tags for delete using (owner_id = auth.uid());
