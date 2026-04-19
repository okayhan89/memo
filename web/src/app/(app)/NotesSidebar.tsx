'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, useSelectedLayoutSegments } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatRelative } from '@/lib/format-date';
import { cn } from '@/lib/cn';
import type { NoteSummary } from '@/features/notes/repository';
import type { TagWithCount } from '@/features/tags/repository';
import { tagKey } from '@/features/tags/schemas';

type Filter = 'all' | 'favorites';

type Props = {
  notes: NoteSummary[];
  tags: TagWithCount[];
};

export function NotesSidebar({ notes, tags }: Props) {
  const router = useRouter();
  const segments = useSelectedLayoutSegments();
  const searchParams = useSearchParams();
  const activeId = segments[0] === 'notes' ? segments[1] : undefined;
  const activeTagSlugs = searchParams.getAll('tag').map(tagKey);
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    let list = notes;
    if (filter === 'favorites') list = list.filter((n) => n.is_favorite);
    // Tag filtering is done server-side via ?tag params; the sidebar just
    // reflects the current URL so users can toggle tags off with one click.
    return list;
  }, [notes, filter]);

  const toggleTag = (name: string) => {
    const next = new URLSearchParams(searchParams.toString());
    const key = tagKey(name);
    const already = next.getAll('tag').some((t) => tagKey(t) === key);
    next.delete('tag');
    const keep = searchParams.getAll('tag').filter((t) => tagKey(t) !== key);
    keep.forEach((t) => next.append('tag', t));
    if (!already) next.append('tag', name);
    router.replace(`/notes${next.toString() ? `?${next.toString()}` : ''}`);
  };

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

      {tags.length > 0 ? (
        <div className="border-line border-b px-3 py-3">
          <p className="text-ink-subtle mb-2 font-mono text-[10px] tracking-[0.22em] uppercase">
            태그
          </p>
          <ul className="flex flex-wrap gap-1">
            {tags.map((tag) => {
              const active = activeTagSlugs.includes(tagKey(tag.name));
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition',
                      active
                        ? 'bg-ink text-paper'
                        : 'border-line text-ink-muted hover:text-ink border',
                    )}
                  >
                    <span aria-hidden>#</span>
                    <span>{tag.name}</span>
                    {tag.count > 0 ? (
                      <span className={active ? 'opacity-80' : 'text-ink-subtle'}>{tag.count}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {activeTagSlugs.length > 0 ? (
            <Link
              href="/notes"
              className="text-ink-subtle hover:text-ink mt-2 inline-block text-[11px] underline-offset-4 hover:underline"
            >
              필터 해제
            </Link>
          ) : null}
        </div>
      ) : null}

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
