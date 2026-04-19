# Memo

A fast, offline-first memo web app — rich editor, full-text search (Korean-aware), CRDT sync, and shareable public links.

## Stack

- **Web**: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind v4 + shadcn/ui
- **Editor**: Tiptap (ProseMirror) + Yjs (CRDT, planned Phase 5)
- **Backend**: Supabase (Postgres + Auth + Realtime + Storage), Tokyo region
- **Search**: Postgres `tsvector` + `pg_trgm` (Phase 4)
- **Deploy**: Vercel (web) + Supabase Cloud (backend)
- **Observability**: Sentry, PostHog, Vercel Analytics, Better Stack

## Layout

```
.
├── web/                  Next.js app (all frontend + server actions)
├── supabase/             (added in Phase 1) SQL migrations + Edge Functions
├── docs/                 Design direction, runbook
└── .github/workflows/    CI
```

## Develop

```bash
cd web
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright E2E
pnpm build
```

## Phases

- [x] Phase 0 — Repo, toolchain, CI
- [ ] Phase 1 — Auth + note CRUD + RLS
- [ ] Phase 2 — Tiptap editor + markdown + slash commands
- [ ] Phase 3 — Folders, tags, favorites, trash
- [ ] Phase 4 — Korean full-text search (MVP target)
- [ ] Phase 5 — Offline + sync (Yjs) + version history
- [ ] Phase 6 — Public share links + MD/PDF export
- [ ] Phase 7 — Performance, accessibility, themes
- [ ] Phase 8 — Observability
- [ ] Phase 9 — Production deploy + security headers

## License

MIT
