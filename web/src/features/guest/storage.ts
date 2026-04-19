// Local draft storage for guest users (pre-signup).
// All reads and writes guard `window` so this module is safe from RSC.

const STORAGE_KEY = 'memo-guest-draft-v1';

export type GuestDraft = {
  title: string;
  contentJson: unknown;
  contentText: string;
  updatedAt: string;
};

export function readGuestDraft(): GuestDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeGuestDraft(draft: GuestDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota exceeded or disabled storage */
  }
}

export function clearGuestDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasGuestDraft(): boolean {
  const draft = readGuestDraft();
  if (!draft) return false;
  const hasTitle = draft.title.trim().length > 0;
  const hasBody = draft.contentText.trim().length > 0;
  return hasTitle || hasBody;
}
