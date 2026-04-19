'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Props = {
  claim?: boolean;
  next?: string;
  appUrl: string;
  supabaseConfigured: boolean;
};

export function GoogleSignInButton({ claim, next, appUrl, supabaseConfigured }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabaseConfigured) {
    return (
      <p className="border-line bg-paper-sunken text-ink-muted rounded-md border px-4 py-3 text-xs leading-relaxed">
        Google 로그인은 Supabase가 연결되면 바로 사용할 수 있어요. 지금은 홈의 빠른 메모를 계속
        써보세요.
      </p>
    );
  }

  const onClick = async () => {
    setError(null);
    setPending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const callback = new URL('/auth/callback', appUrl);
      if (next) callback.searchParams.set('next', next);
      if (claim) callback.searchParams.set('claim', '1');

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callback.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (signInError) {
        setError(signInError.message);
        setPending(false);
      }
      // On success the browser navigates away, no further state to set.
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="border-line hover:border-ink bg-paper-raised text-ink inline-flex h-12 items-center justify-center gap-3 rounded-md border font-medium transition disabled:opacity-60"
      >
        <GoogleGlyph />
        <span>{pending ? '구글로 이동 중…' : 'Google로 계속하기'}</span>
      </button>
      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
