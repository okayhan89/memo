'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { createNoteAction } from '@/features/notes/actions';
import { searchNotesAction } from '@/features/search/actions';
import { renderSnippet } from '@/features/search/snippet';
import type { SearchHit } from '@/lib/supabase/types';

const DEBOUNCE_MS = 180;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [, startNote] = useTransition();
  const requestId = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Debounced search side-effect. The rule for synchronous setState in effects is
  // waived here: this is an external-system subscription (remote RPC) that
  // cancels on cleanup, which is exactly the pattern effects are designed for.
  useEffect(() => {
    if (!open) return undefined;
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    const thisRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      const result = await searchNotesAction({ query: trimmed });
      if (thisRequest !== requestId.current) return;
      setSearching(false);
      setHits(result.status === 'ok' ? result.hits : []);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, open]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery('');
      setHits([]);
      setSearching(false);
    }
  }, []);

  const run = useCallback(
    (action: () => void) => {
      action();
      handleOpenChange(false);
    },
    [handleOpenChange],
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={handleOpenChange}
      label="명령 팔레트"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-sm data-[state=closed]:hidden"
    >
      <div className="border-line bg-paper-raised w-full max-w-lg overflow-hidden rounded-lg border shadow-lg">
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="검색하거나, 명령을 입력하세요…"
          className="border-line text-ink placeholder:text-ink-subtle w-full border-b bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-[50vh] overflow-y-auto px-2 py-2">
          <Command.Empty className="text-ink-subtle px-3 py-6 text-sm">
            {searching ? '검색 중…' : '해당하는 항목이 없어요.'}
          </Command.Empty>

          {hits.length > 0 ? (
            <Command.Group heading="검색 결과" className="mb-1">
              {hits.map((hit) => (
                <Command.Item
                  key={hit.id}
                  value={`hit-${hit.id}-${hit.title}`}
                  onSelect={() => run(() => router.push(`/notes/${hit.id}`))}
                  className="text-ink data-[selected=true]:bg-paper-sunken flex cursor-pointer flex-col gap-0.5 rounded-md px-3 py-2 text-sm"
                >
                  <span className="truncate font-medium">
                    {hit.title.trim().length > 0 ? hit.title : '제목 없음'}
                  </span>
                  <span
                    className="text-ink-subtle [&>mark]:text-accent [&>mark]:bg-accent-soft line-clamp-2 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderSnippet(hit.snippet) }}
                  />
                </Command.Item>
              ))}
            </Command.Group>
          ) : null}

          <Command.Group heading="노트" className="mb-1">
            <Command.Item
              onSelect={() => run(() => startNote(() => createNoteAction({})))}
              className="text-ink data-[selected=true]:bg-paper-sunken flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm"
            >
              <span>새 노트 만들기</span>
              <span className="text-ink-subtle font-mono text-xs">⌘N</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="이동" className="mb-1">
            <Command.Item
              onSelect={() => run(() => router.push('/notes'))}
              className="text-ink data-[selected=true]:bg-paper-sunken flex cursor-pointer rounded-md px-3 py-2 text-sm"
            >
              모든 노트
            </Command.Item>
            <Command.Item
              onSelect={() => run(() => router.push('/search'))}
              className="text-ink data-[selected=true]:bg-paper-sunken flex cursor-pointer rounded-md px-3 py-2 text-sm"
            >
              검색 페이지 열기
            </Command.Item>
            <Command.Item
              onSelect={() => run(() => router.push('/trash'))}
              className="text-ink data-[selected=true]:bg-paper-sunken flex cursor-pointer rounded-md px-3 py-2 text-sm"
            >
              휴지통
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
