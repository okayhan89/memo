'use client';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { formatRelative } from '@/lib/format-date';
import { cn } from '@/lib/cn';
import type { NoteSummary } from '@/features/notes/repository';

export function NotesSidebar({ notes }: { notes: NoteSummary[] }) {
  const segments = useSelectedLayoutSegments();
  const activeId = segments[0] === 'notes' ? segments[1] : undefined;

  if (notes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-start gap-2 px-5 py-6">
        <p className="text-ink-muted text-sm">아직 노트가 없어요.</p>
        <p className="text-ink-subtle text-xs leading-relaxed">
          위의 <span className="text-ink">+ 새 노트</span> 버튼을 눌러 첫 메모를 남겨보세요.
        </p>
      </div>
    );
  }

  return (
    <nav aria-label="노트 목록" className="flex-1 overflow-y-auto py-2">
      <ul className="flex flex-col gap-0.5">
        {notes.map((note) => {
          const isActive = note.id === activeId;
          const title = note.title.trim().length > 0 ? note.title : '제목 없음';
          return (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className={cn(
                  'mx-2 flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition',
                  isActive ? 'bg-paper-sunken text-ink' : 'hover:bg-paper-sunken text-ink-muted',
                )}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {note.is_pinned ? <span aria-hidden>📌</span> : null}
                  {note.is_favorite ? (
                    <span aria-hidden className="text-accent">
                      ★
                    </span>
                  ) : null}
                  <span className="truncate">{title}</span>
                </span>
                <span className="text-ink-subtle text-[11px]">
                  {formatRelative(note.edited_at)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
