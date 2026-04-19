'use client';

import { useTransition } from 'react';
import { hardDeleteNoteAction, restoreNoteAction } from '@/features/notes/actions';
import { formatRelative } from '@/lib/format-date';

export type TrashEntry = {
  id: string;
  title: string;
  preview: string;
  deletedAt: string;
};

export function TrashList({ entries }: { entries: TrashEntry[] }) {
  const [pending, start] = useTransition();

  return (
    <ul className="divide-line mt-6 flex flex-col divide-y">
      {entries.map((entry) => (
        <li key={entry.id} className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-start">
          <div className="min-w-0">
            <h2 className="text-ink truncate font-medium">
              {entry.title.trim().length > 0 ? entry.title : '제목 없음'}
            </h2>
            <p className="text-ink-muted mt-1 line-clamp-2 text-sm leading-relaxed">
              {entry.preview || '내용이 비어 있었어요.'}
            </p>
            <p className="text-ink-subtle mt-2 text-xs">
              삭제됨 · {formatRelative(entry.deletedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={() => start(() => restoreNoteAction({ id: entry.id }))}
              className="border-line text-ink hover:border-ink rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
            >
              복원
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm('영구 삭제하면 되돌릴 수 없어요. 계속할까요?')) return;
                start(() => hardDeleteNoteAction({ id: entry.id }));
              }}
              className="text-danger hover:bg-paper-sunken rounded-full px-3 py-1.5 text-xs transition disabled:opacity-50"
            >
              영구 삭제
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
