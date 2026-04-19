import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { clientEnv, serverEnv } from '@/lib/env';
import type { Database } from './types';

export function createSupabaseAdminClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin client requires URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
