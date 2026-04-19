'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { deleteNoteAction, toggleFavoriteAction, updateNoteAction } from '@/features/notes/actions';
import { saveNoteVersionAction } from '@/features/versions/actions';
import { VersionsPanel } from '@/features/versions/VersionsPanel';
import { enqueueUpdate, readAllPending, removeUpdate } from '@/features/sync/queue';
import { useOnline } from '@/features/sync/useConnection';
import { useNoteRealtime, type RemoteNoteUpdate } from '@/features/sync/useNoteRealtime';
import { TagChips } from '@/features/tags/TagChips';
import type { TagRow } from '@/lib/supabase/types';
import { formatRelative } from '@/lib/format-date';
import { RichEditor, type RichEditorValue } from '@/components/editor/RichEditor';

type Props = {
  id: string;
  initialTitle: string;
  initialContentJson: unknown;
  initialContentText: string;
  isFavorite: boolean;
  editedAt: string;
  initialTags: TagRow[];
  tagSuggestions: string[];
};

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'offline' | 'error';

const SAVE_DEBOUNCE_MS = 600;
const AUTO_VERSION_EVERY_MS = 5 * 60 * 1000;

export function NoteEditor({
  id,
  initialTitle,
  initialContentJson,
  initialContentText,
  isFavorite,
  editedAt,
  initialTags,
  tagSuggestions,
}: Props) {
  const online = useOnline();
  const [title, setTitle] = useState(initialTitle);
  const [favorite, setFavorite] = useState(isFavorite);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string>(editedAt);
  const [showVersions, setShowVersions] = useState(false);
  const [versionsRefresh, setVersionsRefresh] = useState(0);
  // We store the current-content-to-hydrate separately from the live editor
  // state (which lives inside Tiptap) so we can pass a fresh reference when
  // remounting the editor after a remote update.
  const [editorSeed, setEditorSeed] = useState<{ key: number; content: unknown }>({
    key: 0,
    content: initialContentJson,
  });
  const [remoteBanner, setRemoteBanner] = useState<string | null>(null);
  const [, startDelete] = useTransition();

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ title: string; contentJson?: unknown; contentText?: string }>({
    title: initialTitle,
    contentText: initialContentText,
    contentJson: initialContentJson,
  });
  // Seed with 0 so the first successful save always becomes the reference
  // point for "is it time for another auto-snapshot?"; replaced on mount.
  const lastVersionAt = useRef<number>(0);
  useEffect(() => {
    lastVersionAt.current = Date.now();
  }, []);

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
      await removeUpdate(id);
      setSaveState('saved');
      const now = new Date();
      setLastSavedAt(now.toISOString());

      if (now.getTime() - lastVersionAt.current > AUTO_VERSION_EVERY_MS) {
        lastVersionAt.current = now.getTime();
        void saveNoteVersionAction({
          noteId: id,
          title: snapshot.title,
          contentJson: snapshot.contentJson,
          contentText: snapshot.contentText,
          reason: 'autosave',
        });
      }
    } catch {
      await enqueueUpdate({
        noteId: id,
        title: snapshot.title,
        contentJson: snapshot.contentJson,
        contentText: snapshot.contentText,
        updatedAt: new Date().toISOString(),
      });
      setSaveState(online ? 'error' : 'offline');
    }
  }, [id, online]);

  const schedule = useCallback(() => {
    setSaveState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  }, [flush]);

  // Retry queued updates on reconnect.
  useEffect(() => {
    if (!online) return;
    let cancelled = false;
    queueMicrotask(async () => {
      const all = await readAllPending();
      const mine = all.find((p) => p.noteId === id);
      if (!mine || cancelled) return;
      pending.current = {
        title: mine.title ?? pending.current.title,
        contentJson: mine.contentJson ?? pending.current.contentJson,
        contentText: mine.contentText ?? pending.current.contentText,
      };
      void flush();
    });
    return () => {
      cancelled = true;
    };
  }, [online, id, flush]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const onRemote = useCallback(
    (row: RemoteNoteUpdate) => {
      if (row.edited_at && row.edited_at <= lastSavedAt) return;
      if (row.deleted_at) {
        setRemoteBanner('이 노트가 다른 곳에서 삭제되었어요.');
        return;
      }
      pending.current = {
        title: row.title,
        contentJson: row.content_json,
        contentText: row.content_text,
      };
      setTitle(row.title);
      setLastSavedAt(row.edited_at);
      setSaveState('saved');
      setEditorSeed((prev) => ({ key: prev.key + 1, content: row.content_json }));
      setRemoteBanner('다른 기기에서 업데이트되어 최신 버전을 불러왔습니다.');
      window.setTimeout(() => setRemoteBanner(null), 3000);
    },
    [lastSavedAt],
  );
  useNoteRealtime(id, onRemote);

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

  const onSaveVersion = async () => {
    setSaveState('saving');
    try {
      await saveNoteVersionAction({
        noteId: id,
        title: pending.current.title,
        contentJson: pending.current.contentJson,
        contentText: pending.current.contentText,
        reason: 'manual',
      });
      setVersionsRefresh((n) => n + 1);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const statusLabel = (() => {
    if (!online && saveState !== 'saving') return '오프라인 · 이어쓰는 중 (이 기기에 저장됨)';
    switch (saveState) {
      case 'saving':
        return '저장 중…';
      case 'saved':
        return `저장됨 · ${formatRelative(lastSavedAt)}`;
      case 'dirty':
        return '편집 중';
      case 'offline':
        return '오프라인 · 복귀 시 자동 업로드';
      case 'error':
        return '저장 실패 — 재연결 시 자동 재시도';
      default:
        return `마지막 수정 ${formatRelative(lastSavedAt)}`;
    }
  })();

  return (
    <>
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
              onClick={() => setShowVersions((v) => !v)}
              className="text-ink-muted hover:text-ink transition"
            >
              ⟲ 버전
            </button>
            <button
              type="button"
              onClick={onSaveVersion}
              className="text-ink-muted hover:text-ink transition"
            >
              버전 저장
            </button>
            <button
              type="button"
              aria-pressed={favorite}
              onClick={toggleFavorite}
              className="hover:text-accent text-ink-muted transition"
            >
              {favorite ? '★' : '☆'}
            </button>
            <a
              href={`/api/notes/${id}/export`}
              download
              className="text-ink-muted hover:text-ink transition"
            >
              ↓ .md
            </a>
            <button
              type="button"
              onClick={onDelete}
              className="text-ink-muted hover:text-danger transition"
            >
              삭제
            </button>
          </div>
        </header>

        {remoteBanner ? (
          <p
            role="status"
            aria-live="polite"
            className="border-accent bg-accent-soft text-ink mt-4 rounded-md border px-4 py-2 text-xs"
          >
            {remoteBanner}
          </p>
        ) : null}

        <input
          aria-label="제목"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="제목 없음"
          className="text-ink placeholder:text-ink-subtle mt-8 w-full bg-transparent font-serif text-(length:--text-3xl) leading-tight tracking-tight outline-none"
        />

        <div className="mt-4">
          <TagChips noteId={id} initialTags={initialTags} suggestions={tagSuggestions} />
        </div>

        <div className="mt-6">
          <RichEditor
            key={editorSeed.key}
            initialContent={editorSeed.content}
            onChange={onContentChange}
            ariaLabel="노트 본문"
          />
        </div>
      </article>

      <VersionsPanel
        noteId={id}
        open={showVersions}
        onClose={() => setShowVersions(false)}
        refreshKey={versionsRefresh}
      />
    </>
  );
}
