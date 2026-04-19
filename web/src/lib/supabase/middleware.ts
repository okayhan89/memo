import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured, requireSupabaseEnv } from '@/lib/env';
import type { Database } from './types';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/auth',
  '/share',
  '/about',
  '/_next',
  '/favicon',
  '/api/health',
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    // Supabase not wired yet: let public routes through, block app routes with a banner.
    if (!isPublicPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('reason', 'supabase_not_configured');
      return NextResponse.redirect(url);
    }
    return response;
  }

  const { url, anonKey } = requireSupabaseEnv();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
