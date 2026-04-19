import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TagRow } from '@/lib/supabase/types';
import { normalizeTagName, tagKey } from './schemas';

type Client = SupabaseClient<Database>;

export type TagWithCount = TagRow & { count: number };

/**
 * Supabase embedded selects need declared FK relationships in the hand-rolled
 * Database type, so we fan out to two queries and join in JS. Cheap compared
 * to the round-trip saving, and it keeps this module independent of any
 * Supabase-generated relationship metadata.
 */
export async function listTagsWithCounts(
  supabase: Client,
  ownerId: string,
): Promise<TagWithCount[]> {
  const { data: tags, error: tagsErr } = await supabase
    .from('tags')
    .select('*')
    .eq('owner_id', ownerId)
    .order('name');
  if (tagsErr) throw tagsErr;
  if (!tags || tags.length === 0) return [];

  const { data: rels, error: relsErr } = await supabase
    .from('note_tags')
    .select('tag_id,note_id')
    .eq('owner_id', ownerId)
    .in(
      'tag_id',
      tags.map((t) => t.id),
    );
  if (relsErr) throw relsErr;

  // Only count tags attached to non-deleted notes.
  const noteIds = Array.from(new Set((rels ?? []).map((r) => r.note_id)));
  const liveNoteIds = new Set<string>();
  if (noteIds.length > 0) {
    const { data: liveNotes } = await supabase
      .from('notes')
      .select('id')
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .in('id', noteIds);
    for (const n of liveNotes ?? []) liveNoteIds.add(n.id);
  }

  const counts = new Map<string, number>();
  for (const r of rels ?? []) {
    if (!liveNoteIds.has(r.note_id)) continue;
    counts.set(r.tag_id, (counts.get(r.tag_id) ?? 0) + 1);
  }

  return tags.map((t) => ({ ...t, count: counts.get(t.id) ?? 0 }));
}

/** Find-or-create a tag by normalized name and return its row. */
export async function upsertTag(
  supabase: Client,
  ownerId: string,
  rawName: string,
): Promise<TagRow> {
  const name = normalizeTagName(rawName);
  const key = tagKey(rawName);

  const { data: existing, error: findErr } = await supabase
    .from('tags')
    .select('*')
    .eq('owner_id', ownerId)
    .ilike('name', name)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing && tagKey(existing.name) === key) return existing;

  const { data, error } = await supabase
    .from('tags')
    .insert({ owner_id: ownerId, name })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listTagsForNote(
  supabase: Client,
  ownerId: string,
  noteId: string,
): Promise<TagRow[]> {
  const { data: rels, error: relsErr } = await supabase
    .from('note_tags')
    .select('tag_id')
    .eq('owner_id', ownerId)
    .eq('note_id', noteId);
  if (relsErr) throw relsErr;
  const ids = (rels ?? []).map((r) => r.tag_id);
  if (ids.length === 0) return [];

  const { data: tags, error: tagsErr } = await supabase
    .from('tags')
    .select('*')
    .eq('owner_id', ownerId)
    .in('id', ids);
  if (tagsErr) throw tagsErr;
  return (tags ?? []).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export async function attachTag(
  supabase: Client,
  ownerId: string,
  noteId: string,
  tagId: string,
): Promise<void> {
  const { error } = await supabase
    .from('note_tags')
    .insert({ note_id: noteId, tag_id: tagId, owner_id: ownerId });
  // Ignore duplicate-key — tag is already attached.
  if (error && error.code !== '23505') throw error;
}

export async function detachTag(
  supabase: Client,
  ownerId: string,
  noteId: string,
  tagId: string,
): Promise<void> {
  const { error } = await supabase
    .from('note_tags')
    .delete()
    .eq('note_id', noteId)
    .eq('tag_id', tagId)
    .eq('owner_id', ownerId);
  if (error) throw error;
}

export async function deleteTag(supabase: Client, ownerId: string, tagId: string): Promise<void> {
  const { error } = await supabase.from('tags').delete().eq('id', tagId).eq('owner_id', ownerId);
  if (error) throw error;
}

/**
 * Return note ids owned by this user that carry ALL the given tag ids.
 * Used to realize the "AND" tag filter in the sidebar.
 */
export async function listNoteIdsByTags(
  supabase: Client,
  ownerId: string,
  tagIds: string[],
): Promise<Set<string>> {
  if (tagIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('note_tags')
    .select('note_id,tag_id')
    .eq('owner_id', ownerId)
    .in('tag_id', tagIds);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) counts.set(row.note_id, (counts.get(row.note_id) ?? 0) + 1);

  const matches = new Set<string>();
  for (const [noteId, count] of counts) {
    if (count === tagIds.length) matches.add(noteId);
  }
  return matches;
}
