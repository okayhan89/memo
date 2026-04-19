'use client';

import { useRef, useState, useTransition } from 'react';
import { attachTagAction, detachTagAction } from './actions';
import type { TagRow } from '@/lib/supabase/types';
import { tagKey } from './schemas';
import { cn } from '@/lib/cn';

type Props = {
  noteId: string;
  initialTags: TagRow[];
  suggestions: string[]; // existing tag names to autocomplete from
};

export function TagChips({ noteId, initialTags, suggestions }: Props) {
  const [tags, setTags] = useState<TagRow[]>(initialTags);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const matches =
    draft.trim().length === 0
      ? []
      : suggestions
          .filter((name) => {
            const k = tagKey(name);
            if (k.includes(tagKey(draft)) === false) return false;
            return !tags.some((t) => tagKey(t.name) === k);
          })
          .slice(0, 5);

  const submit = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    if (tags.some((t) => tagKey(t.name) === tagKey(name))) {
      setDraft('');
      return;
    }
    setError(null);
    start(async () => {
      const result = await attachTagAction({ noteId, name });
      if (result.status === 'ok') {
        setTags(result.tags);
        setDraft('');
      } else {
        setError(result.message);
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      submit(draft);
    } else if (e.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
      const last = tags[tags.length - 1];
      if (last) {
        detach(last.id);
      }
    } else if (e.key === 'Escape') {
      setDraft('');
    }
  };

  const detach = (tagId: string) => {
    const previous = tags;
    setTags(tags.filter((t) => t.id !== tagId));
    start(async () => {
      try {
        const result = await detachTagAction({ noteId, tagId });
        setTags(result.tags);
      } catch {
        setTags(previous);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-wrap items-center gap-1.5" role="list" aria-label="노트 태그">
        {tags.map((tag) => (
          <li key={tag.id}>
            <span className="border-line bg-paper-sunken text-ink inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs">
              <span aria-hidden className="text-ink-subtle">
                #
              </span>
              {tag.name}
              <button
                type="button"
                aria-label={`${tag.name} 태그 제거`}
                onClick={() => detach(tag.id)}
                className="text-ink-subtle hover:text-danger ml-0.5"
              >
                ×
              </button>
            </span>
          </li>
        ))}
        <li className="relative">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => submit(draft)}
            placeholder={tags.length === 0 ? '# 태그 추가' : '#'}
            aria-label="새 태그"
            disabled={pending}
            className="text-ink placeholder:text-ink-subtle w-24 bg-transparent px-1 py-0.5 text-xs outline-none disabled:opacity-60"
          />
          {matches.length > 0 ? (
            <ul
              role="listbox"
              className={cn(
                'border-line bg-paper-raised absolute top-full left-0 z-20 mt-1 w-40 overflow-hidden rounded-md border shadow-md',
              )}
            >
              {matches.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // keep input focused
                      submit(name);
                    }}
                    className="hover:bg-paper-sunken text-ink block w-full px-3 py-1.5 text-left text-xs"
                  >
                    #{name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      </ul>
      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
