import 'server-only';
import { cache } from 'react';
import { createSupabaseServerClient } from './supabase/server';
import { getNote, listNotes, type NoteSummary } from '@/features/notes/repository';
import { listTagsForNote, listTagsWithCounts, type TagWithCount } from '@/features/tags/repository';
import type { NoteRow, TagRow } from './supabase/types';

/**
 * Per-request memoized server queries (React.cache). Same args → one DB
 * round-trip even when layout + page + any deep RSC all ask for the same
 * data during a single navigation. Without this, the layout and the note
 * page each fetched listTagsWithCounts, doubling the number of queries.
 */

export const getCachedNotes = cache(async (ownerId: string): Promise<NoteSummary[]> => {
  const supabase = await createSupabaseServerClient();
  return listNotes(supabase, ownerId);
});

export const getCachedTagsWithCounts = cache(async (ownerId: string): Promise<TagWithCount[]> => {
  const supabase = await createSupabaseServerClient();
  return listTagsWithCounts(supabase, ownerId);
});

export const getCachedNote = cache(
  async (ownerId: string, noteId: string): Promise<NoteRow | null> => {
    const supabase = await createSupabaseServerClient();
    return getNote(supabase, ownerId, noteId);
  },
);

export const getCachedTagsForNote = cache(
  async (ownerId: string, noteId: string): Promise<TagRow[]> => {
    const supabase = await createSupabaseServerClient();
    return listTagsForNote(supabase, ownerId, noteId);
  },
);
