import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createNote, updateNote } from '@/features/notes/repository';

const payloadSchema = z.object({
  title: z.string().max(200).default(''),
  contentJson: z.unknown().optional(),
  contentText: z.string().max(200_000).default(''),
});

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const title = parsed.data.title.trim();
  const text = parsed.data.contentText.trim();
  if (!title && !text) {
    return NextResponse.json({ error: 'empty_draft' }, { status: 422 });
  }

  const note = await createNote(supabase, user.id, { title });
  await updateNote(supabase, user.id, {
    id: note.id,
    title,
    contentJson: parsed.data.contentJson,
    contentText: parsed.data.contentText,
  });
  return NextResponse.json({ id: note.id }, { status: 201 });
}
