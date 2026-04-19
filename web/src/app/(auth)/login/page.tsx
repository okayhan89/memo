import Link from 'next/link';
import { clientEnv, isSupabaseConfigured } from '@/lib/env';
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';
import { MagicLinkForm } from './LoginForm';

type SearchParams = {
  next?: string;
  reason?: string;
  claim?: string;
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const claim = params.claim === '1';

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="text-ink-subtle mb-10 font-mono text-xs tracking-[0.22em] uppercase"
      >
        ← Memo
      </Link>

      <h1 className="text-ink font-serif text-(length:--text-2xl) leading-tight tracking-tight">
        {claim ? '이 초안을 모든 기기로.' : '한 번만 로그인하면 어디서든.'}
      </h1>
      <p className="text-ink-muted mt-3 text-sm leading-relaxed">
        {claim
          ? '로그인만 하면 이 기기에 저장해둔 초안이 클라우드로 옮겨져요. 다음 기기에서 바로 이어씁니다.'
          : 'Google 계정으로 1초 안에 시작하세요. 비밀번호도, 별도 가입도 없어요.'}
      </p>

      {params.reason === 'supabase_not_configured' ? (
        <p className="border-line bg-paper-sunken text-ink-muted mt-6 rounded-md border px-4 py-3 text-xs">
          아직 Supabase가 연결되지 않아 클라우드 동기화가 꺼져 있어요. 그래도 홈의 빠른 메모는 이
          기기에서는 그대로 동작합니다.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4">
        <GoogleSignInButton
          claim={claim}
          next={params.next}
          appUrl={clientEnv.NEXT_PUBLIC_APP_URL}
          supabaseConfigured={isSupabaseConfigured}
        />

        <div className="flex items-center gap-3 text-xs">
          <span className="bg-line h-px flex-1" aria-hidden />
          <span className="text-ink-subtle font-mono tracking-[0.22em] uppercase">또는</span>
          <span className="bg-line h-px flex-1" aria-hidden />
        </div>

        <MagicLinkForm next={params.next} claim={claim} />
      </div>

      <p className="text-ink-subtle mt-10 text-xs">
        가입·로그인을 진행하면 Memo의{' '}
        <Link href="/about" className="underline-offset-4 hover:underline">
          사용 방침
        </Link>
        에 동의하게 됩니다.
      </p>
    </main>
  );
}
