'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { TagRow } from '@/lib/supabase/types';
import { attachTagSchema, deleteTagSchema, detachTagSchema } from './schemas';
import {
  attachTag,
  deleteTag,
  detachTag,
  listTagsForNote,
  listTagsWithCounts,
  upsertTag,
  type TagWithCount,
} from './repository';

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

export type AttachTagResult =
  | { status: 'ok'; tags: TagRow[] }
  | { status: 'error'; message: string };

export async function attachTagAction(input: {
  noteId: string;
  name: string;
}): Promise<AttachTagResult> {
  const parsed = attachTagSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? '태그 이름이 올바르지 않습니다.';
    return { status: 'error', message: first };
  }

  const { supabase, user } = await requireUser();
  try {
    const tag = await upsertTag(supabase, user.id, parsed.data.name);
    await attachTag(supabase, user.id, parsed.data.noteId, tag.id);
    const tags = await listTagsForNote(supabase, user.id, parsed.data.noteId);
    revalidatePath('/notes', 'layout');
    return { status: 'ok', tags };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

export async function detachTagAction(input: { noteId: string; tagId: string }) {
  const parsed = detachTagSchema.parse(input);
  const { supabase, user } = await requireUser();
  await detachTag(supabase, user.id, parsed.noteId, parsed.tagId);
  revalidatePath('/notes', 'layout');
  const tags = await listTagsForNote(supabase, user.id, parsed.noteId);
  return { tags };
}

export async function deleteTagAction(input: { tagId: string }) {
  const parsed = deleteTagSchema.parse(input);
  const { supabase, user } = await requireUser();
  await deleteTag(supabase, user.id, parsed.tagId);
  revalidatePath('/notes', 'layout');
}

export async function listAllTagsAction(): Promise<TagWithCount[]> {
  const { supabase, user } = await requireUser();
  return listTagsWithCounts(supabase, user.id);
}
