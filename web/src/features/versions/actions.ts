'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { NoteVersionRow } from '@/lib/supabase/types';
import { updateNote } from '@/features/notes/repository';

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

const snapshotSchema = z.object({
  noteId: z.string().uuid(),
  title: z.string().max(200).default(''),
  contentJson: z.unknown(),
  contentText: z.string().max(200_000).default(''),
  reason: z.enum(['autosave', 'manual', 'restore']).default('autosave'),
});

export type SaveVersionResult = { status: 'ok'; id: string } | { status: 'error'; message: string };

export async function saveNoteVersionAction(input: {
  noteId: string;
  title?: string;
  contentJson: unknown;
  contentText?: string;
  reason?: 'autosave' | 'manual' | 'restore';
}): Promise<SaveVersionResult> {
  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) return { status: 'error', message: '요청이 올바르지 않습니다.' };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('note_versions')
    .insert({
      note_id: parsed.data.noteId,
      owner_id: user.id,
      title: parsed.data.title,
      content_json: parsed.data.contentJson,
      content_text: parsed.data.contentText,
      reason: parsed.data.reason,
    })
    .select('id')
    .single();
  if (error) return { status: 'error', message: error.message };
  return { status: 'ok', id: data.id };
}

export type VersionListItem = Pick<
  NoteVersionRow,
  'id' | 'reason' | 'created_at' | 'title' | 'content_text'
>;

export async function listNoteVersionsAction(noteId: string): Promise<VersionListItem[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('note_versions')
    .select('id,reason,created_at,title,content_text')
    .eq('note_id', noteId)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return [];
  return data ?? [];
}

const restoreSchema = z.object({ versionId: z.string().uuid() });

export async function restoreNoteVersionAction(input: { versionId: string }) {
  const parsed = restoreSchema.parse(input);
  const { supabase, user } = await requireUser();

  const { data: version, error: fetchError } = await supabase
    .from('note_versions')
    .select('*')
    .eq('id', parsed.versionId)
    .eq('owner_id', user.id)
    .single();
  if (fetchError || !version) return { status: 'error' as const };

  // Snapshot the current state as a "restore" reason version so the user can
  // walk back after restoring.
  const { data: current } = await supabase
    .from('notes')
    .select('title, content_json, content_text')
    .eq('id', version.note_id)
    .eq('owner_id', user.id)
    .single();

  if (current) {
    await supabase.from('note_versions').insert({
      note_id: version.note_id,
      owner_id: user.id,
      title: current.title,
      content_json: current.content_json,
      content_text: current.content_text,
      reason: 'restore',
    });
  }

  await updateNote(supabase, user.id, {
    id: version.note_id,
    title: version.title,
    contentJson: version.content_json,
    contentText: version.content_text,
  });

  revalidatePath(`/notes/${version.note_id}`);
  return { status: 'ok' as const };
}
