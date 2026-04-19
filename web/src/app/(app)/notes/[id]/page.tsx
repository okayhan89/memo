import { notFound, redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getCachedNote, getCachedTagsForNote, getCachedTagsWithCounts } from '@/lib/server-cache';
import { NoteEditor } from './NoteEditor';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  // Fire all three in parallel. getCachedTagsWithCounts is also called from
  // the layout, so the second call here is a no-op deduped by React.cache.
  const [note, tagsForNote, allTags] = await Promise.all([
    getCachedNote(user.id, id),
    getCachedTagsForNote(user.id, id),
    getCachedTagsWithCounts(user.id),
  ]);
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
      initialTags={tagsForNote}
      tagSuggestions={allTags.map((t) => t.name)}
    />
  );
}
