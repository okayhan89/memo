'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { deleteNoteAction, toggleFavoriteAction, updateNoteAction } from '@/features/notes/actions';
import { formatRelative } from '@/lib/format-date';

type Props = {
  id: string;
  initialTitle: string;
  initialContent: string;
  isFavorite: boolean;
  editedAt: string;
};

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const SAVE_DEBOUNCE_MS = 600;

export function NoteEditor({ id, initialTitle, initialContent, isFavorite, editedAt }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [favorite, setFavorite] = useState(isFavorite);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string>(editedAt);
  const [, startDelete] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseline = useRef({ title: initialTitle, content: initialContent });

  const scheduleSave = useCallback(
    (nextTitle: string, nextContent: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaveState('saving');
        try {
          await updateNoteAction({ id, title: nextTitle, contentText: nextContent });
          baseline.current = { title: nextTitle, content: nextContent };
          setSaveState('saved');
          setLastSavedAt(new Date().toISOString());
        } catch {
          setSaveState('error');
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [id],
  );

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (value !== baseline.current.title) {
      setSaveState('dirty');
      scheduleSave(value, content);
    }
  };

  const onContentChange = (value: string) => {
    setContent(value);
    if (value !== baseline.current.content) {
      setSaveState('dirty');
      scheduleSave(title, value);
    }
  };

  const toggleFavorite = async () => {
    const next = !favorite;
    setFavorite(next);
    try {
      await toggleFavoriteAction({ id, value: next });
    } catch {
      setFavorite(!next);
    }
  };

  const onDelete = () => {
    if (typeof window !== 'undefined' && !window.confirm('이 노트를 휴지통으로 옮길까요?')) return;
    startDelete(() => deleteNoteAction({ id }));
  };

  const statusLabel = (() => {
    switch (saveState) {
      case 'saving':
        return '저장 중…';
      case 'saved':
        return `저장됨 · ${formatRelative(lastSavedAt)}`;
      case 'dirty':
        return '편집 중';
      case 'error':
        return '저장 실패 — 다시 시도합니다';
      default:
        return `마지막 수정 ${formatRelative(lastSavedAt)}`;
    }
  })();

  return (
    <article className="mx-auto flex min-h-dvh max-w-3xl flex-col px-8 pt-10 pb-24 md:px-12 md:pt-16">
      <header className="flex items-center justify-between text-xs">
        <span
          role="status"
          aria-live="polite"
          className="text-ink-subtle font-mono tracking-[0.18em] uppercase"
        >
          {statusLabel}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-pressed={favorite}
            onClick={toggleFavorite}
            className="hover:text-accent text-ink-muted transition"
          >
            {favorite ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-ink-muted hover:text-danger transition"
          >
            삭제
          </button>
        </div>
      </header>

      <input
        aria-label="제목"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="제목 없음"
        className="text-ink placeholder:text-ink-subtle mt-8 w-full bg-transparent font-serif text-(length:--text-3xl) leading-tight tracking-tight outline-none"
      />

      <textarea
        aria-label="본문"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="쓰기 시작하세요…"
        rows={20}
        className="text-ink placeholder:text-ink-subtle mt-8 min-h-[60vh] w-full resize-none bg-transparent text-base leading-[1.8] outline-none"
      />

      <p className="text-ink-subtle mt-10 text-[11px]">
        Phase 1 · 단순 텍스트 에디터. Phase 2에서 Tiptap 기반 리치 에디터로 교체됩니다.
      </p>
    </article>
  );
}
