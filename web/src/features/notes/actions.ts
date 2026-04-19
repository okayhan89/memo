'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createNoteSchema, idSchema, toggleFavoriteSchema, updateNoteSchema } from './schemas';
import { createNote, setFavorite, softDeleteNote, updateNote } from './repository';

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

export async function createNoteAction(input?: { title?: string; folderId?: string | null }) {
  const parsed = createNoteSchema.parse(input ?? {});
  const { supabase, user } = await requireUser();
  const note = await createNote(supabase, user.id, parsed);
  revalidatePath('/notes');
  redirect(`/notes/${note.id}`);
}

export async function updateNoteAction(input: {
  id: string;
  title?: string;
  contentJson?: unknown;
  contentText?: string;
}) {
  const parsed = updateNoteSchema.parse(input);
  const { supabase, user } = await requireUser();
  await updateNote(supabase, user.id, parsed);
  revalidatePath('/notes', 'layout');
}

export async function toggleFavoriteAction(input: { id: string; value: boolean }) {
  const parsed = toggleFavoriteSchema.parse(input);
  const { supabase, user } = await requireUser();
  await setFavorite(supabase, user.id, parsed.id, parsed.value);
  revalidatePath('/notes', 'layout');
}

export async function deleteNoteAction(input: { id: string }) {
  const parsed = idSchema.parse(input);
  const { supabase, user } = await requireUser();
  await softDeleteNote(supabase, user.id, parsed.id);
  revalidatePath('/notes', 'layout');
  redirect('/notes');
}
