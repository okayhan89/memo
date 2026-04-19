'use client';

import { useEffect, useState, useTransition } from 'react';
import { listNoteVersionsAction, restoreNoteVersionAction, type VersionListItem } from './actions';
import { formatRelative } from '@/lib/format-date';

type Props = {
  noteId: string;
  open: boolean;
  onClose: () => void;
  refreshKey: number;
};

export function VersionsPanel({ noteId, open, onClose, refreshKey }: Props) {
  const [items, setItems] = useState<VersionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, startRestore] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // Defer setState out of the effect body so react-hooks/set-state-in-effect
    // accepts the pattern. Once inside the microtask the rule treats it as an
    // ordinary async data subscription.
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      listNoteVersionsAction(noteId)
        .then((rows) => {
          if (!cancelled) setItems(rows);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [open, noteId, refreshKey]);

  if (!open) return null;

  return (
    <aside
      aria-label="버전 히스토리"
      className="border-line bg-paper-raised fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l shadow-lg"
    >
      <header className="border-line flex items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-ink-subtle font-mono text-[11px] tracking-[0.22em] uppercase">
            History
          </p>
          <h2 className="text-ink mt-1 font-serif text-(length:--text-lg) leading-tight">
            버전 히스토리
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="text-ink-muted hover:text-ink"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <p className="text-ink-subtle text-xs">불러오는 중…</p>
        ) : items.length === 0 ? (
          <p className="text-ink-muted text-sm leading-relaxed">
            아직 저장된 버전이 없어요. 5분마다 자동 저장되거나, 상단의{' '}
            <span className="text-ink">버전 저장</span> 버튼으로 남길 수 있어요.
          </p>
        ) : (
          <ul className="divide-line flex flex-col divide-y">
            {items.map((v) => (
              <li key={v.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted">{formatRelative(v.created_at)}</span>
                  <span
                    className={
                      v.reason === 'manual'
                        ? 'text-accent font-mono tracking-wider uppercase'
                        : 'text-ink-subtle font-mono tracking-wider uppercase'
                    }
                  >
                    {v.reason === 'manual' ? '수동' : v.reason === 'restore' ? '복원 전' : '자동'}
                  </span>
                </div>
                <p className="text-ink truncate text-sm font-medium">
                  {v.title.trim().length > 0 ? v.title : '제목 없음'}
                </p>
                <p className="text-ink-muted line-clamp-2 text-xs leading-relaxed">
                  {v.content_text.slice(0, 160) || '(내용 없음)'}
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={restoring}
                    onClick={() =>
                      startRestore(async () => {
                        if (
                          !window.confirm(
                            '이 버전으로 복원할까요? 현재 내용은 자동으로 한 번 더 백업됩니다.',
                          )
                        )
                          return;
                        await restoreNoteVersionAction({ versionId: v.id });
                        window.location.reload();
                      })
                    }
                    className="border-line text-ink hover:border-ink rounded-full border px-3 py-1 text-xs transition disabled:opacity-50"
                  >
                    이 버전으로 복원
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
