import Link from 'next/link';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getCachedNotes, getCachedTagsWithCounts } from '@/lib/server-cache';
import { signOut } from '@/features/auth/actions';
import { NewNoteButton } from './NewNoteButton';
import { NotesSidebar } from './NotesSidebar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ConnectionIndicator } from '@/features/sync/ConnectionIndicator';

// Heavy client components that aren't needed for first paint — load lazily so
// the sidebar/main render isn't blocked waiting for their JS.
const CommandPalette = dynamic(() =>
  import('@/components/command-palette/CommandPalette').then((m) => m.CommandPalette),
);

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  const [notes, tags] = await Promise.all([
    getCachedNotes(user.id),
    getCachedTagsWithCounts(user.id),
  ]);

  return (
    <div className="bg-paper-sunken grid min-h-dvh grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-line bg-paper flex flex-col border-r">
        <header className="border-line flex items-center justify-between border-b px-5 py-4">
          <Link
            href="/"
            className="text-ink-subtle font-mono text-[11px] tracking-[0.22em] uppercase"
            prefetch
          >
            Memo
          </Link>
          <NewNoteButton />
        </header>
        <NotesSidebar notes={notes} tags={tags} />
        <footer className="border-line flex items-center justify-between gap-3 border-t px-4 py-3 text-xs">
          <span className="text-ink-subtle min-w-0 truncate" title={user.email ?? ''}>
            {user.email}
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <button
                type="submit"
                className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
              >
                로그아웃
              </button>
            </form>
          </div>
        </footer>
      </aside>

      <main className="bg-paper-raised min-w-0">{children}</main>
      <CommandPalette />
      <ConnectionIndicator />
    </div>
  );
}
