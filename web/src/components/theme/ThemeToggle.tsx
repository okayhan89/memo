'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'memo-theme';

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    /* ignore */
  }
  return 'system';
}

function subscribeStorage(cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeStorage, getStoredTheme, () => 'system');

  const cycle = () => {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
    // Notify same-window listeners; storage event only fires cross-tab.
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  };

  const label = theme === 'light' ? '☀︎ 라이트' : theme === 'dark' ? '☾ 다크' : '◐ 시스템';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`테마 전환 (현재 ${label})`}
      className="text-ink-muted hover:text-ink rounded-full px-2 py-1 text-xs tracking-wider uppercase transition"
    >
      {label}
    </button>
  );
}
