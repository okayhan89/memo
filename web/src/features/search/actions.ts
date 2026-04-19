'use server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SearchHit } from '@/lib/supabase/types';

const querySchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SearchActionResult =
  | { status: 'ok'; hits: SearchHit[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export async function searchNotesAction(input: {
  query: string;
  limit?: number;
}): Promise<SearchActionResult> {
  const parsed = querySchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: '검색어를 확인해주세요.' };
  }
  if (parsed.data.query.trim().length === 0) {
    return { status: 'empty' };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: '로그인이 필요합니다.' };

  const { data, error } = await supabase.rpc('search_notes', {
    p_query: parsed.data.query,
    p_limit: parsed.data.limit,
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  const hits = (data ?? []) as SearchHit[];
  if (hits.length === 0) return { status: 'empty' };
  return { status: 'ok', hits };
}
