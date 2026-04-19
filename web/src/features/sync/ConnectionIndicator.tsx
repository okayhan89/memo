'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { countPending } from './queue';
import { useOnline } from './useConnection';

export function ConnectionIndicator() {
  const online = useOnline();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const n = await countPending();
      if (!cancelled) setPending(n);
    };
    const interval = window.setInterval(tick, 3000);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'border-line bg-paper-raised text-ink pointer-events-none fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-sm',
      )}
    >
      <span
        aria-hidden
        className={cn('h-1.5 w-1.5 rounded-full', online ? 'bg-success' : 'bg-danger')}
      />
      <span className="font-mono tracking-[0.18em] uppercase">
        {!online ? '오프라인' : `동기화 대기 ${pending}건`}
      </span>
    </div>
  );
}
