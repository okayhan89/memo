import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center px-6 py-16 md:px-10">
      <p className="text-accent font-mono text-xs tracking-[0.22em] uppercase">404</p>
      <h1 className="text-ink mt-4 font-serif text-(length:--text-2xl) leading-tight tracking-tight">
        길을 잃은 것 같아요.
      </h1>
      <p className="text-ink-muted mt-4 text-base leading-relaxed">
        이 페이지는 존재하지 않거나, 삭제되었거나, 아직 쓰이지 않은 메모입니다.
      </p>
      <Link href="/" className="text-ink mt-8 underline-offset-4 hover:underline">
        처음으로 돌아가기 →
      </Link>
    </main>
  );
}
