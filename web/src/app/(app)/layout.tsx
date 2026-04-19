import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { listNotes } from '@/features/notes/repository';
import { signOut } from '@/features/auth/actions';
import { NewNoteButton } from './NewNoteButton';
import { NotesSidebar } from './NotesSidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const notes = await listNotes(supabase, user.id);

  return (
    <div className="bg-paper-sunken grid min-h-dvh grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-line bg-paper flex flex-col border-r">
        <header className="border-line flex items-center justify-between border-b px-5 py-4">
          <Link
            href="/"
            className="text-ink-subtle font-mono text-[11px] tracking-[0.22em] uppercase"
          >
            Memo
          </Link>
          <NewNoteButton />
        </header>
        <NotesSidebar notes={notes} />
        <footer className="border-line flex items-center justify-between border-t px-5 py-3 text-xs">
          <span className="text-ink-subtle truncate" title={user.email ?? ''}>
            {user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
            >
              로그아웃
            </button>
          </form>
        </footer>
      </aside>

      <main className="bg-paper-raised min-w-0">{children}</main>
    </div>
  );
}
