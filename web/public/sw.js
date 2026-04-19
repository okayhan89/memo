// Minimal service worker — offline app shell for Memo.
// Strategy:
//   - Navigation requests (HTML): network-first, fall back to cached shell
//     so offline tabs still render the app skeleton.
//   - Static assets under /_next/static/*: cache-first (immutable).
//   - Everything else (API calls, Supabase, etc): network-only so auth and
//     realtime behave normally.
// Keep this tiny and dependency-free; a richer Workbox setup is Phase 8 work.

const VERSION = 'memo-v1';
const SHELL_URL = '/';
const STATIC_CACHE = `${VERSION}-static`;
const SHELL_CACHE = `${VERSION}-shell`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(SHELL_URL, { cache: 'no-store' });
        if (response && response.ok) await shell.put(SHELL_URL, response);
      } catch {
        /* offline at install time — shell will be cached on first success */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/auth/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const shell = await caches.open(SHELL_CACHE);
          shell.put(SHELL_URL, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const shell = await caches.open(SHELL_CACHE);
          const cached = await shell.match(SHELL_URL);
          if (cached) return cached;
          return new Response('offline', { status: 503, statusText: 'offline' });
        }
      })(),
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/media/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh && fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      })(),
    );
  }
});
