'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Never register in local dev — HMR + service workers create stale caches
    // and mask real errors. Set NEXT_PUBLIC_PWA=1 locally if you want to
    // exercise the worker path.
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_PWA !== '1') return;

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* silent */
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
