'use client';

import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import type { NoteRow } from '@/lib/supabase/types';

export type RemoteNoteUpdate = Pick<
  NoteRow,
  'id' | 'title' | 'content_json' | 'content_text' | 'edited_at' | 'updated_at' | 'deleted_at'
>;

/**
 * Subscribe to cross-device UPDATEs for a given note. The callback fires once
 * per server-pushed change, never for our own save round-trip (the server
 * payload still arrives but callers compare `edited_at` or `updated_at` to
 * the snapshot they just wrote and no-op when equal).
 */
export function useNoteRealtime(
  noteId: string | null | undefined,
  onUpdate: (row: RemoteNoteUpdate) => void,
): void {
  useEffect(() => {
    if (!isSupabaseConfigured || !noteId) return undefined;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`note:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`,
        },
        (payload) => {
          const row = payload.new as RemoteNoteUpdate | null;
          if (!row) return;
          onUpdate(row);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [noteId, onUpdate]);
}
