'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearGuestDraft, readGuestDraft } from './storage';

type Status = 'idle' | 'uploading' | 'done' | 'nothing' | 'error';

/**
 * Mount this on any authenticated landing (e.g. /notes) with `?claim=1`.
 * It posts the guest draft to /api/notes/claim, clears the local copy,
 * then routes to the freshly created note.
 */
export function ClaimDraftOnMount({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  // Snapshot draft once, synchronously, during render so effect can stay
  // purely side-effectful (no setState in effect body).
  const draft = useMemo(() => (enabled ? readGuestDraft() : null), [enabled]);
  const hasDraft =
    !!draft && (draft.title.trim().length > 0 || draft.contentText.trim().length > 0);

  const [status, setStatus] = useState<Status>(() => {
    if (!enabled) return 'idle';
    return hasDraft ? 'uploading' : 'nothing';
  });
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || ran.current || !hasDraft || !draft) return;
    ran.current = true;

    fetch('/api/notes/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.title,
        contentJson: draft.contentJson,
        contentText: draft.contentText,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as { id: string };
        clearGuestDraft();
        setStatus('done');
        router.replace(`/notes/${body.id}`);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [enabled, hasDraft, draft, router]);

  if (!enabled || status === 'idle' || status === 'nothing') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-line bg-paper-raised text-ink-muted pointer-events-none fixed inset-x-0 bottom-6 mx-auto w-fit rounded-full border px-4 py-2 text-xs shadow-sm"
    >
      {status === 'uploading' && '로컬 초안을 클라우드로 옮기는 중…'}
      {status === 'done' && '초안을 옮겼어요.'}
      {status === 'error' && '초안 이관에 실패했어요. 수동으로 다시 시도해주세요.'}
    </div>
  );
}
