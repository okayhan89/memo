import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireSupabaseEnv } from '@/lib/env';
import type { Database } from './types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Read-only cookies (RSC). Refresh happens in middleware instead.
        }
      },
    },
  });
}
