'use client';

import { useTransition } from 'react';
import { createNoteAction } from '@/features/notes/actions';

export function NewNoteButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => createNoteAction({}))}
      disabled={pending}
      className="bg-ink text-paper rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-90 disabled:opacity-50"
      aria-label="새 노트"
    >
      {pending ? '…' : '+ 새 노트'}
    </button>
  );
}
