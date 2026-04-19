import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const claim = url.searchParams.get('claim');
  const next = url.searchParams.get('next') ?? '/notes';

  if (!code) {
    return NextResponse.redirect(new URL('/login?reason=missing_code', request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const failUrl = new URL('/login', request.url);
    failUrl.searchParams.set('reason', 'exchange_failed');
    return NextResponse.redirect(failUrl);
  }

  const destination = new URL(next, request.url);
  if (claim === '1') destination.searchParams.set('claim', '1');
  return NextResponse.redirect(destination);
}
