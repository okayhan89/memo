'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { searchNotesAction } from '@/features/search/actions';
import { renderSnippet } from '@/features/search/snippet';
import { formatRelative } from '@/lib/format-date';
import type { SearchHit } from '@/lib/supabase/types';

type Status = 'idle' | 'searching' | 'ok' | 'empty' | 'error';

const DEBOUNCE_MS = 180;

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<Status>(initialQuery.trim() ? 'searching' : 'idle');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [error, setError] = useState<string | undefined>();
  const requestId = useRef(0);

  // Debounced remote search + URL sync. Effect is an external-system subscription.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    const thisRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      const result = await searchNotesAction({ query: trimmed });
      if (thisRequest !== requestId.current) return;
      if (result.status === 'ok') {
        setHits(result.hits);
        setStatus('ok');
      } else if (result.status === 'empty') {
        setHits([]);
        setStatus('empty');
      } else {
        setError(result.message);
        setStatus('error');
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim().length === 0) url.searchParams.delete('q');
    else url.searchParams.set('q', query);
    router.replace(`${url.pathname}${url.search ? `?${url.searchParams.toString()}` : ''}`, {
      scroll: false,
    });
  }, [query, router]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setStatus('idle');
      setHits([]);
    } else {
      setStatus('searching');
    }
  };

  return (
    <section className="mx-auto flex min-h-dvh max-w-3xl flex-col px-8 pt-12 pb-24 md:px-12">
      <header>
        <p className="text-ink-subtle font-mono text-xs tracking-[0.22em] uppercase">Search</p>
        <h1 className="text-ink mt-2 font-serif text-(length:--text-2xl) leading-tight tracking-tight">
          쓴 것을 찾아봅시다.
        </h1>
        <input
          autoFocus
          aria-label="검색어"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="한국어·영문 모두 · 부분 일치도 됩니다"
          className="border-line focus:border-ink bg-paper-raised text-ink placeholder:text-ink-subtle mt-8 h-14 w-full rounded-md border px-5 text-base transition outline-none"
        />
        <p
          role="status"
          aria-live="polite"
          className="text-ink-subtle mt-3 font-mono text-xs tracking-[0.18em] uppercase"
        >
          {status === 'searching' && '검색 중…'}
          {status === 'empty' && '일치하는 노트가 없어요.'}
          {status === 'ok' && `${hits.length}건`}
          {status === 'error' && (error ?? '검색에 실패했습니다.')}
          {status === 'idle' && '무엇을 찾고 계신가요?'}
        </p>
      </header>

      {status === 'ok' && hits.length > 0 ? (
        <ul className="divide-line mt-10 flex flex-col divide-y">
          {hits.map((hit) => (
            <li key={hit.id}>
              <Link
                href={`/notes/${hit.id}`}
                className="hover:bg-paper-sunken -mx-4 flex flex-col gap-2 rounded-md px-4 py-5 transition"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-ink truncate font-medium">
                    {hit.title.trim().length > 0 ? hit.title : '제목 없음'}
                  </h2>
                  <span className="text-ink-subtle shrink-0 text-xs">
                    {formatRelative(hit.edited_at)}
                  </span>
                </div>
                <p
                  className="text-ink-muted [&>mark]:text-accent [&>mark]:bg-accent-soft line-clamp-3 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderSnippet(hit.snippet) }}
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
