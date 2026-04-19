import Link from 'next/link';

const PILLARS = [
  {
    kaptien: '01',
    title: '종이 같은 에디터',
    body: 'Tiptap 기반의 리치 에디터 위에서 마크다운 단축키, 슬래시 커맨드, 코드 하이라이트가 모두 지원됩니다. 서체와 간격은 잡지의 리듬을 따릅니다.',
  },
  {
    kaptien: '02',
    title: '한국어가 일등 시민',
    body: 'IME 끊김 없는 입력, 한국어 형태소·부분 일치 검색, 한글 기본 폴백 폰트. "외국 앱을 번역해서 쓰는 느낌" 없이 바로 편합니다.',
  },
  {
    kaptien: '03',
    title: '끊기지 않는 연결',
    body: '오프라인에서 작성한 문장이 재접속 순간 조용히 동기화됩니다. 충돌 없음을 보장하는 CRDT 기반 설계.',
  },
  {
    kaptien: '04',
    title: '돌아갈 수 있는 기록',
    body: '모든 수정은 자동으로 버전에 기록되어 30일 동안 복원할 수 있습니다. 삭제도 30일의 유예를 가집니다.',
  },
];

const STEPS = [
  ['쓴다', '단축키 하나로 빈 화면, 커서만.'],
  ['찾는다', '⌘K 명령 팔레트, 한국어 전체 검색.'],
  ['잇는다', '다른 기기에서, 오프라인에서, 바로 이어서.'],
  ['연다', '공개 링크로 팀과 공유. 원하면 PDF/MD 내보내기.'],
];

export default function HomePage() {
  return (
    <div className="bg-paper min-h-dvh">
      <main className="relative mx-auto flex max-w-5xl flex-col px-6 md:px-10">
        <header className="flex items-center justify-between pt-10">
          <span className="text-ink-subtle font-mono text-xs tracking-[0.22em] uppercase">
            Memo · v0.0
          </span>
          <nav aria-label="주요 탐색" className="text-ink-muted flex items-center gap-6 text-sm">
            <Link href="/about" className="hover:text-ink">
              소개
            </Link>
            <Link href="/notes" className="hover:text-ink">
              앱 열기
            </Link>
            <Link
              href="/login"
              className="bg-ink text-paper rounded-full px-3.5 py-1.5 text-xs font-medium transition hover:opacity-90"
            >
              시작하기
            </Link>
          </nav>
        </header>

        <section
          aria-labelledby="hero"
          className="flex flex-col justify-center py-24 md:min-h-[70dvh] md:py-32"
        >
          <p className="text-accent mb-6 font-mono text-xs tracking-[0.22em] uppercase">
            Editorial · Offline-first · Open
          </p>
          <h1
            id="hero"
            className="text-ink max-w-4xl font-serif text-(length:--text-display) leading-[0.95] tracking-tight"
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
              href="/login"
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

        <section
          aria-labelledby="pillars"
          className="border-line grid gap-10 border-t py-20 md:grid-cols-2"
        >
          <div>
            <p className="text-accent font-mono text-xs tracking-[0.22em] uppercase">Pillars</p>
            <h2
              id="pillars"
              className="text-ink mt-4 font-serif text-(length:--text-2xl) leading-tight tracking-tight"
            >
              네 가지를 제대로 합니다.
            </h2>
            <p className="text-ink-muted mt-4 max-w-md text-sm leading-relaxed">
              유행을 따라가지 않고, 매일 쓰는 사람에게 필요한 네 가지 가치에만 집중합니다.
            </p>
          </div>
          <ul className="divide-line flex flex-col divide-y">
            {PILLARS.map((p) => (
              <li key={p.kaptien} className="grid grid-cols-[auto_1fr] gap-6 py-6 first:pt-0">
                <span className="text-ink-subtle font-mono text-xs tracking-[0.22em]">
                  {p.kaptien}
                </span>
                <div>
                  <h3 className="text-ink font-serif text-(length:--text-lg) leading-tight tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-ink-muted mt-2 text-sm leading-relaxed">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how" className="border-line border-t py-20">
          <p className="text-accent font-mono text-xs tracking-[0.22em] uppercase">How it works</p>
          <h2
            id="how"
            className="text-ink mt-4 font-serif text-(length:--text-2xl) leading-tight tracking-tight"
          >
            네 동작이면 충분합니다.
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {STEPS.map(([word, desc], i) => (
              <li key={word} className="flex flex-col gap-3">
                <span className="text-ink-subtle font-mono text-xs tracking-[0.18em]">
                  0{i + 1}
                </span>
                <strong className="text-ink font-serif text-(length:--text-xl) leading-tight tracking-tight">
                  {word}
                </strong>
                <span className="text-ink-muted text-sm leading-relaxed">{desc}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cta" className="border-line border-t py-24">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2
                id="cta"
                className="text-ink font-serif text-(length:--text-2xl) leading-tight tracking-tight"
              >
                이 문장을 당신의 Memo에 옮겨 보세요.
              </h2>
              <p className="text-ink-muted mt-3 text-base leading-relaxed">
                이메일 하나면 로그인 링크가 옵니다. 비밀번호는 없습니다.
              </p>
            </div>
            <Link
              href="/login"
              className="bg-ink text-paper rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90"
            >
              로그인 링크 받기 →
            </Link>
          </div>
        </section>

        <footer className="border-line flex items-center justify-between border-t py-8 text-xs">
          <span className="text-ink-subtle">© {new Date().getFullYear()} Memo</span>
          <span className="text-ink-subtle font-mono tracking-[0.18em] uppercase">
            Phase 2 · editor landed
          </span>
        </footer>
      </main>
    </div>
  );
}
