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
  '/sw.js',
  '/icon.svg',
];

const PUBLIC_EXACT = new Set(['/manifest.webmanifest', '/robots.txt', '/sitemap.xml']);

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
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

  // For middleware we only need to know "is there a session at all?" so we
  // can redirect unauthenticated traffic. getSession() just reads the cookie
  // (no network) which shaves ~150ms off every navigation vs getUser(),
  // which hits Supabase auth to verify. The authoritative check happens in
  // the RSC layout via getAuthenticatedUser() (getUser → verifies), so
  // security isn't weakened — a forged cookie would fail there and the
  // attacker gets no data.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
