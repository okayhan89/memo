import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { listNotes } from '@/features/notes/repository';
import { ClaimDraftOnMount } from '@/features/guest/ClaimDraftOnMount';
import { CreateFirstNote } from './CreateFirstNote';

export default async function NotesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { claim } = await searchParams;
  const notes = await listNotes(supabase, user.id);

  if (notes[0] && claim !== '1') {
    redirect(`/notes/${notes[0].id}`);
  }

  return (
    <>
      <ClaimDraftOnMount enabled={claim === '1'} />
      <section className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-8 py-24">
        <p className="text-accent mb-4 font-mono text-xs tracking-[0.22em] uppercase">
          Empty canvas
        </p>
        <h1 className="text-ink font-serif text-(length:--text-3xl) leading-tight tracking-tight">
          첫 메모를 남겨볼까요.
        </h1>
        <p className="text-ink-muted mt-4 max-w-lg text-base leading-relaxed">
          떠오르는 한 줄부터, 긴 회의록까지. 아무것도 쓸 준비가 안 됐어도 괜찮아요. Memo는 당신이
          다시 돌아올 때까지 기다립니다.
        </p>
        <div className="mt-10">
          <CreateFirstNote />
        </div>
      </section>
    </>
  );
}
