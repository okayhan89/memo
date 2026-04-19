import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    supabase: isSupabaseConfigured ? 'configured' : 'missing_env',
    timestamp: new Date().toISOString(),
  });
}
