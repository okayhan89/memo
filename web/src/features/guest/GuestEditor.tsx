'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RichEditor, type RichEditorValue } from '@/components/editor/RichEditor';
import { clearGuestDraft, readGuestDraft, writeGuestDraft } from './storage';

const AUTOSAVE_MS = 400;

export function GuestEditor() {
  // Read localStorage exactly once, synchronously at mount, via a lazy initializer
  // so we avoid the "setState inside useEffect" anti-pattern and the extra render.
  const initial = useMemo(() => readGuestDraft(), []);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [wordCount, setWordCount] = useState(countWords(initial?.contentText ?? ''));
  const [charCount, setCharCount] = useState(initial?.contentText.length ?? 0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const latest = useRef<RichEditorValue>({
    json: initial?.contentJson ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    text: initial?.contentText ?? '',
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      writeGuestDraft({
        title,
        contentJson: latest.current.json,
        contentText: latest.current.text,
        updatedAt: new Date().toISOString(),
      });
      setLastSavedAt(new Date());
    }, AUTOSAVE_MS);
  };

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const onTitleChange = (value: string) => {
    setTitle(value);
    schedule();
  };

  const onContentChange = (value: RichEditorValue) => {
    latest.current = value;
    setCharCount(value.text.length);
    setWordCount(countWords(value.text));
    schedule();
  };

  const discard = () => {
    if (!window.confirm('작성한 내용을 모두 지울까요? 이 기기에서 지워집니다.')) return;
    clearGuestDraft();
    window.location.reload();
  };

  const hasAnyContent = title.trim().length > 0 || charCount > 0;

  return (
    <article
      aria-label="빠른 메모"
      className="bg-paper-raised border-line relative rounded-xl border shadow-sm"
    >
      <header className="border-line flex items-center justify-between gap-4 border-b px-5 py-3 text-xs">
        <span className="text-accent font-mono tracking-[0.22em] uppercase">● 로컬 초안</span>
        <span
          role="status"
          aria-live="polite"
          className="text-ink-subtle font-mono tracking-[0.18em] uppercase"
        >
          {lastSavedAt
            ? `이 기기에 저장됨 · ${formatClock(lastSavedAt)}`
            : '타이핑하면 이 기기에 자동 저장됩니다'}
        </span>
      </header>

      <div className="px-6 pt-5 pb-6 md:px-10 md:pt-8 md:pb-10">
        <input
          aria-label="제목"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="제목을 적어볼까요"
          className="text-ink placeholder:text-ink-subtle w-full bg-transparent font-serif text-(length:--text-2xl) leading-tight tracking-tight outline-none"
        />
        <div className="mt-4 min-h-[22rem]">
          <RichEditor
            initialContent={initial?.contentJson}
            onChange={onContentChange}
            placeholder="여기에 바로 써 보세요. 엔터로 줄바꿈, ⌘B 굵게, ⌘I 기울임, `#`으로 제목."
            ariaLabel="빠른 메모 본문"
          />
        </div>
      </div>

      <footer className="border-line flex flex-col gap-3 border-t px-5 py-4 text-xs md:flex-row md:items-center md:justify-between">
        <div className="text-ink-subtle flex items-center gap-4 font-mono tracking-[0.18em] uppercase">
          <span>{charCount.toLocaleString('ko-KR')}자</span>
          <span>{wordCount.toLocaleString('ko-KR')}단어</span>
          <span className="hidden md:inline">오프라인 · 개인 브라우저에만 저장</span>
        </div>
        <div className="flex items-center gap-3">
          {hasAnyContent ? (
            <button
              type="button"
              onClick={discard}
              className="text-ink-muted hover:text-danger text-xs transition"
            >
              초안 버리기
            </button>
          ) : null}
          <Link
            href="/login?claim=1"
            className="bg-ink text-paper rounded-full px-4 py-2 text-xs font-medium transition hover:opacity-90"
          >
            모든 기기에서 이어쓰기 →
          </Link>
        </div>
      </footer>
    </article>
  );
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
