import { createStore, del, entries, set, update } from 'idb-keyval';

// Persists pending note-save payloads so that edits made while the network
// is down (or the save RPC transiently fails) survive a reload and retry
// later. The queue is keyed by note id so a single note only ever has one
// outstanding patch — later writes overwrite earlier ones, matching the
// "last write wins" semantics of our server action.

export type PendingUpdate = {
  noteId: string;
  title?: string;
  contentJson?: unknown;
  contentText?: string;
  updatedAt: string;
};

const store = createStore('memo-sync', 'pending');

export async function enqueueUpdate(patch: PendingUpdate): Promise<void> {
  if (typeof window === 'undefined') return;
  await update<PendingUpdate>(
    patch.noteId,
    (existing) => {
      if (!existing) return patch;
      return {
        ...existing,
        ...patch,
        // Merge fields so we never downgrade newer data with undefined.
        title: patch.title ?? existing.title,
        contentJson: patch.contentJson ?? existing.contentJson,
        contentText: patch.contentText ?? existing.contentText,
        updatedAt: patch.updatedAt,
      };
    },
    store,
  );
}

export async function removeUpdate(noteId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await del(noteId, store);
}

export async function readAllPending(): Promise<PendingUpdate[]> {
  if (typeof window === 'undefined') return [];
  const rows = await entries<string, PendingUpdate>(store);
  return rows.map(([, value]) => value);
}

export async function countPending(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  const rows = await entries(store);
  return rows.length;
}

export async function clear(): Promise<void> {
  if (typeof window === 'undefined') return;
  const rows = await entries<string, PendingUpdate>(store);
  await Promise.all(rows.map(([key]) => set(key, undefined, store).then(() => del(key, store))));
}
