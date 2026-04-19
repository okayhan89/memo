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
