import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TrashList, type TrashEntry } from './TrashList';

export const metadata = {
  title: '휴지통',
};

export default async function TrashPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('notes')
    .select('id,title,content_text,deleted_at,edited_at')
    .eq('owner_id', user.id)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  const entries: TrashEntry[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    preview: row.content_text.slice(0, 140),
    deletedAt: row.deleted_at ?? row.edited_at,
  }));

  return (
    <section className="mx-auto flex min-h-dvh max-w-3xl flex-col px-8 pt-12 pb-24 md:px-12">
      <header className="border-line flex items-baseline justify-between border-b pb-6">
        <div>
          <p className="text-ink-subtle font-mono text-xs tracking-[0.22em] uppercase">Trash</p>
          <h1 className="text-ink mt-2 font-serif text-(length:--text-2xl) leading-tight tracking-tight">
            휴지통
          </h1>
        </div>
        <p className="text-ink-subtle text-xs">30일 후 자동으로 비워집니다</p>
      </header>

      {entries.length === 0 ? (
        <p className="text-ink-muted mt-12 text-sm">비어 있어요. 조용하고 깔끔하네요.</p>
      ) : (
        <TrashList entries={entries} />
      )}
    </section>
  );
}
