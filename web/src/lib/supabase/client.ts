'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabaseEnv } from '@/lib/env';
import type { Database } from './types';

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;
  const { url, anonKey } = requireSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
