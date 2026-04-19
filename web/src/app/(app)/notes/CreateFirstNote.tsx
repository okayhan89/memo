'use client';

import { useTransition } from 'react';
import { createNoteAction } from '@/features/notes/actions';

export function CreateFirstNote() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => createNoteAction({}))}
      disabled={pending}
      className="bg-ink text-paper rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? '만드는 중…' : '첫 메모 시작하기'}
    </button>
  );
}
