import Link from 'next/link';

export const metadata = {
  title: '왜 또 하나의 메모 앱인가요',
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-16 md:px-10 md:py-24">
      <Link href="/" className="text-ink-subtle font-mono text-xs tracking-[0.22em] uppercase">
        ← Memo
      </Link>

      <h1 className="text-ink mt-10 font-serif text-(length:--text-3xl) leading-[1.05] tracking-tight">
        <span className="text-accent italic">또 하나의</span>
        <br />
        메모 앱이 필요한 이유.
      </h1>

      <div className="prose-editor text-ink mt-12 max-w-2xl text-(length:--text-base) leading-[1.85]">
        <p>
          좋아하는 메모 앱이 있으신가요? 아마 대부분 그럴 거예요. 그럼에도 이 앱을 만드는 이유는,
          매일 쓰는 사람에게는 “기본기”가 제일 중요하기 때문입니다. 가장 빠른 입력, 가장 충실한
          저장, 그리고 정말 필요한 검색.
        </p>

        <h2>다섯 가지 약속</h2>
        <ol>
          <li>
            <strong>1초의 시작.</strong> 새 메모를 여는 단축키(⌘N)는 0.3초 안에 커서가 반짝여야
            합니다. 첫 글자가 늦게 찍히는 앱은 생각의 흐름을 끊습니다.
          </li>
          <li>
            <strong>연결이 없어도 꺼지지 않는다.</strong> 지하철·비행기·산 정상에서도 쓰던 노트를
            이어서 씁니다. 재접속되는 순간, 조용히 동기화됩니다. (Phase 5에서 제공)
          </li>
          <li>
            <strong>한국어를 이해하는 검색.</strong> 단순 일치가 아니라 형태소·부분 일치·오타 허용을
            기본으로 둡니다. 3만 개의 노트에서도 150ms 안에 원하는 한 문장을 꺼냅니다.
          </li>
          <li>
            <strong>잃어버리지 않는 기록.</strong> 모든 편집은 자동 버전으로 남아, 30일 내라면
            언제든 되돌릴 수 있습니다. 삭제는 30일의 유예를 가집니다.
          </li>
          <li>
            <strong>가볍고, 투명하게.</strong> 추적·광고·다크패턴 없음. 여러분의 노트는 오직
            여러분만 봅니다. 소스는 오픈소스로 공개합니다.
          </li>
        </ol>

        <h2>앞으로의 로드맵</h2>
        <p>
          지금은 Phase 2 — 리치 에디터까지 완성되어 있습니다. 아래 순서로 이어서 배포까지 도달할
          예정입니다.
        </p>
        <ul>
          <li>Phase 3 — 태그·폴더·즐겨찾기·휴지통</li>
          <li>Phase 4 — 한국어 검색 (MVP 종료선)</li>
          <li>Phase 5 — 오프라인·실시간 동기화·버전 히스토리</li>
          <li>Phase 6 — 공개 링크·마크다운/PDF 내보내기</li>
          <li>Phase 7–9 — 성능·관측·프로덕션 배포</li>
        </ul>

        <p className="text-ink-muted">
          지금 이 문장도 Memo의 Tiptap 기반 에디터로 작성할 수 있어야 합니다. 결국, 메모 앱의 가장
          좋은 소개는 사용해 보는 것이에요.
        </p>
      </div>

      <Link
        href="/login"
        className="bg-ink text-paper mt-12 inline-flex w-fit rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-90"
      >
        지금 시작하기 →
      </Link>
    </main>
  );
}
