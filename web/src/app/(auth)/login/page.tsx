import Link from 'next/link';
import { LoginForm } from './LoginForm';

type SearchParams = {
  next?: string;
  reason?: string;
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="text-ink-subtle mb-10 font-mono text-xs tracking-[0.22em] uppercase"
      >
        ← Memo
      </Link>

      <h1 className="text-ink font-serif text-(length:--text-2xl) leading-tight tracking-tight">
        다시 쓰기로.
      </h1>
      <p className="text-ink-muted mt-3 text-sm leading-relaxed">
        이메일 주소를 알려주시면, 비밀번호 없이 바로 들어갈 수 있는 링크를 보내드려요.
      </p>

      {params.reason === 'supabase_not_configured' ? (
        <p className="border-line bg-paper-sunken text-ink-muted mt-6 rounded-md border px-4 py-3 text-xs">
          로컬에 Supabase 환경 변수가 아직 연결되지 않았습니다. 프로젝트를 연결하면 로그인 가능해요.
        </p>
      ) : null}

      <LoginForm next={params.next} />

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
