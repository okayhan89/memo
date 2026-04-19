'use client';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatRelative } from '@/lib/format-date';
import { cn } from '@/lib/cn';
import type { NoteSummary } from '@/features/notes/repository';

type Filter = 'all' | 'favorites';

export function NotesSidebar({ notes }: { notes: NoteSummary[] }) {
  const segments = useSelectedLayoutSegments();
  const activeId = segments[0] === 'notes' ? segments[1] : undefined;
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () => (filter === 'favorites' ? notes.filter((n) => n.is_favorite) : notes),
    [notes, filter],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-line flex items-center gap-1 border-b px-3 py-2 text-[11px]">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          전체 {notes.length > 0 ? `(${notes.length})` : ''}
        </FilterChip>
        <FilterChip active={filter === 'favorites'} onClick={() => setFilter('favorites')}>
          ★ 즐겨찾기
        </FilterChip>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-start gap-2 px-5 py-6">
          <p className="text-ink-muted text-sm">
            {filter === 'favorites' ? '즐겨찾기한 노트가 없어요.' : '아직 노트가 없어요.'}
          </p>
          <p className="text-ink-subtle text-xs leading-relaxed">
            위의 <span className="text-ink">+ 새 노트</span> 버튼을 눌러 첫 메모를 남겨보세요.
          </p>
        </div>
      ) : (
        <nav aria-label="노트 목록" className="flex-1 overflow-y-auto py-2">
          <ul className="flex flex-col gap-0.5">
            {visible.map((note) => {
              const isActive = note.id === activeId;
              const title = note.title.trim().length > 0 ? note.title : '제목 없음';
              return (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.id}`}
                    className={cn(
                      'mx-2 flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-paper-sunken text-ink'
                        : 'hover:bg-paper-sunken text-ink-muted',
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
      )}

      <div className="border-line border-t px-5 py-3">
        <Link
          href="/trash"
          className="text-ink-muted hover:text-ink text-xs underline-offset-4 hover:underline"
        >
          휴지통 →
        </Link>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-2.5 py-1 font-mono tracking-wider uppercase transition',
        active ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-paper-sunken',
      )}
    >
      {children}
    </button>
  );
}
