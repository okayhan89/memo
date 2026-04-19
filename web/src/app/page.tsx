import Link from 'next/link';
import { GuestEditor } from '@/features/guest/GuestEditor';

const PILLARS = [
  {
    kaptien: '01',
    title: '종이 같은 에디터',
    body: 'Tiptap 기반의 리치 에디터 위에서 마크다운 단축키, 코드 하이라이트가 모두 지원됩니다. 서체와 간격은 잡지의 리듬을 따릅니다.',
  },
  {
    kaptien: '02',
    title: '한국어가 일등 시민',
    body: 'IME 끊김 없는 입력, 한국어 형태소·부분 일치 검색, 한글 기본 폴백 폰트. 번역투 없이 바로 편합니다.',
  },
  {
    kaptien: '03',
    title: '가입 없이 먼저',
    body: '이 화면의 에디터는 지금 바로 쓸 수 있어요. 이 기기에 저장되며, 필요할 때만 한 번의 클릭으로 모든 기기로 이어갑니다.',
  },
  {
    kaptien: '04',
    title: '돌아갈 수 있는 기록',
    body: '모든 수정은 자동으로 버전에 기록되어 30일 동안 복원할 수 있습니다. 삭제도 30일의 유예를 가집니다.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-paper min-h-dvh">
      <main className="relative mx-auto flex max-w-5xl flex-col px-6 md:px-10">
        <header className="flex items-center justify-between pt-8">
          <span className="text-ink-subtle font-mono text-xs tracking-[0.22em] uppercase">
            Memo · v0.1
          </span>
          <nav aria-label="주요 탐색" className="text-ink-muted flex items-center gap-5 text-sm">
            <Link href="/about" className="hover:text-ink hidden md:inline">
              소개
            </Link>
            <Link href="/notes" className="hover:text-ink hidden md:inline">
              내 노트
            </Link>
            <Link
              href="/login"
              className="bg-ink text-paper rounded-full px-3.5 py-1.5 text-xs font-medium transition hover:opacity-90"
            >
              로그인
            </Link>
          </nav>
        </header>

        <section aria-labelledby="hero" className="pt-16 md:pt-24">
          <p className="text-accent mb-4 font-mono text-xs tracking-[0.22em] uppercase">
            가입 없이 지금 바로
          </p>
          <h1
            id="hero"
            className="text-ink max-w-3xl font-serif text-(length:--text-3xl) leading-[1.02] tracking-tight md:text-(length:--text-display)"
          >
            첫 문장을 <span className="text-accent italic">아래</span>에 바로.
          </h1>
          <p className="text-ink-muted mt-6 max-w-xl text-base leading-relaxed">
            이메일도, 계정도 필요 없어요. 아래 카드에 바로 타이핑하면 이 기기에 자동 저장됩니다.
            여러 기기에서 이어쓰고 싶을 때 한 번만 로그인하면 초안이 그대로 클라우드로 넘어갑니다.
          </p>
        </section>

        <section aria-label="빠른 메모 작성" className="mt-10 md:mt-14">
          <GuestEditor />
        </section>

        <section
          aria-labelledby="pillars"
          className="border-line mt-24 grid gap-10 border-t py-20 md:grid-cols-2"
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
          <p className="text-accent font-mono text-xs tracking-[0.22em] uppercase">
            단축키 한 눈에
          </p>
          <h2
            id="how"
            className="text-ink mt-4 font-serif text-(length:--text-2xl) leading-tight tracking-tight"
          >
            키보드만으로 충분합니다.
          </h2>
          <dl className="mt-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
            {[
              ['⌘ + B', '굵게'],
              ['⌘ + I', '기울임'],
              ['#, ##, ###', '제목 1·2·3'],
              ['- 또는 *', '글머리 기호 목록'],
              ['1.', '번호 매기기 목록'],
              ['> ', '인용구'],
              ['```', '코드 블록'],
              ['[ ]', '체크박스'],
            ].map(([combo, what]) => (
              <div
                key={combo}
                className="border-line flex items-center justify-between border-b py-3"
              >
                <span className="text-ink-muted font-mono text-xs tracking-[0.18em]">{combo}</span>
                <span className="text-ink text-sm">{what}</span>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="cta" className="border-line border-t py-24">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2
                id="cta"
                className="text-ink font-serif text-(length:--text-2xl) leading-tight tracking-tight"
              >
                준비되었을 때 한 번만 로그인하세요.
              </h2>
              <p className="text-ink-muted mt-3 text-base leading-relaxed">
                지금 위에 쓴 초안이 클라우드로 옮겨져, 다른 기기에서도 그대로 이어집니다.
              </p>
            </div>
            <Link
              href="/login?claim=1"
              className="bg-ink text-paper rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90"
            >
              로그인하고 초안 옮기기 →
            </Link>
          </div>
        </section>

        <footer className="border-line flex items-center justify-between border-t py-8 text-xs">
          <span className="text-ink-subtle">© {new Date().getFullYear()} Memo</span>
          <span className="text-ink-subtle font-mono tracking-[0.18em] uppercase">
            가입 전에 쓸 수 있는 메모
          </span>
        </footer>
      </main>
    </div>
  );
}
