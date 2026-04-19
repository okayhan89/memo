import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-4xl flex-col justify-between px-6 py-10 md:px-10 md:py-16">
      <header className="flex items-center justify-between">
        <span className="text-ink-subtle font-mono text-xs tracking-[0.22em] uppercase">
          Memo · v0.0
        </span>
        <nav aria-label="주요 탐색" className="text-ink-muted flex items-center gap-6 text-sm">
          <Link href="/notes" className="hover:text-ink">
            앱 열기
          </Link>
          <Link href="/about" className="hover:text-ink">
            소개
          </Link>
        </nav>
      </header>

      <section
        aria-labelledby="hero"
        className="flex flex-1 flex-col justify-center py-24 md:py-32"
      >
        <p className="text-accent mb-6 font-mono text-xs tracking-[0.22em] uppercase">
          Editorial · Offline-first · Open
        </p>
        <h1
          id="hero"
          className="text-ink font-serif text-(length:--text-display) leading-[0.95] tracking-tight"
        >
          생각을 붙잡는
          <br />
          <span className="text-accent italic">가장 빠른</span> 방법.
        </h1>
        <p className="text-ink-muted mt-8 max-w-xl text-(length:--text-lg) leading-relaxed">
          흐르는 문장을 놓치지 않는 에디터, 한국어를 이해하는 검색, 오프라인에서도 멈추지 않는
          동기화. Memo는 매일 쓰는 사람을 위해 설계된 메모장입니다.
        </p>
        <div className="mt-12 flex items-center gap-4 text-sm">
          <Link
            href="/notes"
            className="bg-ink text-paper rounded-full px-5 py-3 font-medium transition hover:opacity-90"
          >
            지금 시작하기
          </Link>
          <Link
            href="/about"
            className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
          >
            왜 또 하나의 메모 앱인가요 →
          </Link>
        </div>
      </section>

      <footer className="border-line text-ink-subtle flex items-center justify-between border-t pt-6 text-xs">
        <span>© {new Date().getFullYear()} Memo</span>
        <span className="font-mono tracking-[0.18em] uppercase">Phase 0 · baseline</span>
      </footer>
    </main>
  );
}
