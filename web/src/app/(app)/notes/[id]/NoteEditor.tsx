'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { deleteNoteAction, toggleFavoriteAction, updateNoteAction } from '@/features/notes/actions';
import { formatRelative } from '@/lib/format-date';
import { RichEditor, type RichEditorValue } from '@/components/editor/RichEditor';

type Props = {
  id: string;
  initialTitle: string;
  initialContentJson: unknown;
  initialContentText: string;
  isFavorite: boolean;
  editedAt: string;
};

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const SAVE_DEBOUNCE_MS = 600;

export function NoteEditor({
  id,
  initialTitle,
  initialContentJson,
  initialContentText,
  isFavorite,
  editedAt,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [favorite, setFavorite] = useState(isFavorite);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string>(editedAt);
  const [, startDelete] = useTransition();

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{
    title: string;
    contentJson?: unknown;
    contentText?: string;
  }>({ title: initialTitle, contentText: initialContentText });

  const flush = useCallback(async () => {
    const snapshot = { ...pending.current };
    setSaveState('saving');
    try {
      await updateNoteAction({
        id,
        title: snapshot.title,
        contentJson: snapshot.contentJson,
        contentText: snapshot.contentText,
      });
      setSaveState('saved');
      setLastSavedAt(new Date().toISOString());
    } catch {
      setSaveState('error');
    }
  }, [id]);

  const schedule = useCallback(() => {
    setSaveState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  }, [flush]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const onTitleChange = (value: string) => {
    setTitle(value);
    pending.current = { ...pending.current, title: value };
    schedule();
  };

  const onContentChange = (value: RichEditorValue) => {
    pending.current = {
      ...pending.current,
      contentJson: value.json,
      contentText: value.text,
    };
    schedule();
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

      <div className="mt-6">
        <RichEditor
          initialContent={initialContentJson}
          onChange={onContentChange}
          ariaLabel="노트 본문"
        />
      </div>
    </article>
  );
}
