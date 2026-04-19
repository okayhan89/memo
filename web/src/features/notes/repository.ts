import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, NoteRow } from '@/lib/supabase/types';
import { defaultNoteContent } from './schemas';

type Client = SupabaseClient<Database>;

export type NoteSummary = Pick<
  NoteRow,
  'id' | 'title' | 'is_favorite' | 'is_pinned' | 'edited_at' | 'folder_id'
>;

export async function listNotes(
  supabase: Client,
  ownerId: string,
  options: { includeDeleted?: boolean } = {},
): Promise<NoteSummary[]> {
  let query = supabase
    .from('notes')
    .select('id,title,is_favorite,is_pinned,edited_at,folder_id,deleted_at')
    .eq('owner_id', ownerId)
    .order('is_pinned', { ascending: false })
    .order('edited_at', { ascending: false })
    .limit(500);

  if (!options.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    is_favorite: row.is_favorite,
    is_pinned: row.is_pinned,
    edited_at: row.edited_at,
    folder_id: row.folder_id,
  }));
}

export async function getNote(
  supabase: Client,
  ownerId: string,
  noteId: string,
): Promise<NoteRow | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('owner_id', ownerId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createNote(
  supabase: Client,
  ownerId: string,
  input: { title?: string; folderId?: string | null },
): Promise<NoteRow> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      owner_id: ownerId,
      folder_id: input.folderId ?? null,
      title: input.title ?? '',
      content_json: defaultNoteContent(),
      content_text: '',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(
  supabase: Client,
  ownerId: string,
  input: {
    id: string;
    title?: string;
    contentJson?: unknown;
    contentText?: string;
  },
): Promise<NoteRow> {
  const patch: Database['public']['Tables']['notes']['Update'] = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.contentJson !== undefined) patch.content_json = input.contentJson;
  if (input.contentText !== undefined) patch.content_text = input.contentText;

  const { data, error } = await supabase
    .from('notes')
    .update(patch)
    .eq('id', input.id)
    .eq('owner_id', ownerId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function setFavorite(
  supabase: Client,
  ownerId: string,
  id: string,
  value: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ is_favorite: value })
    .eq('id', id)
    .eq('owner_id', ownerId);
  if (error) throw error;
}

export async function softDeleteNote(supabase: Client, ownerId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', ownerId);
  if (error) throw error;
}
