import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNote } from '@/features/notes/repository';
import { NoteEditor } from './NoteEditor';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const note = await getNote(supabase, user.id, id);
  if (!note) notFound();

  return (
    <NoteEditor
      key={note.id}
      id={note.id}
      initialTitle={note.title}
      initialContentJson={note.content_json}
      initialContentText={note.content_text}
      isFavorite={note.is_favorite}
      editedAt={note.edited_at}
    />
  );
}
