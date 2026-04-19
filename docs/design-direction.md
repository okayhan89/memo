# Design Direction — "Quiet Ink"

메모 앱의 시각 방향을 한 문장으로 요약하면: **조용한 종이 위의 깊은 잉크**. 에디토리얼 잡지에서 유래한 고요함과 의도적인 타이포그래피 대비를 기반으로, 쓰는 행위 자체에 집중시키는 UI를 만듭니다.

## Tone

- 차분하고, 종이적이고, 의도적이다.
- 장식적이지 않고 타이포그래피로 리듬을 만든다.
- 템플릿 같은 카드 그리드 지양 — 세로 리딩 라인을 기본으로.
- 대비는 컬러가 아니라 *크기·무게·공간*으로 먼저 표현한다.

## Palette — light (`Quiet Paper`)

| Token | Value | 용도 |
|-------|-------|------|
| `--paper` | `oklch(98% 0.006 90)` | 기본 배경 (따뜻한 오프화이트) |
| `--paper-raised` | `oklch(100% 0 0)` | 카드, 에디터 표면 |
| `--paper-sunken` | `oklch(95% 0.008 90)` | 사이드바, 입력 배경 |
| `--ink` | `oklch(18% 0.015 260)` | 기본 텍스트 (딥 블루블랙) |
| `--ink-muted` | `oklch(40% 0.01 260)` | 본문 보조 |
| `--ink-subtle` | `oklch(60% 0.005 260)` | 캡션, 플레이스홀더 |
| `--line` | `oklch(90% 0.01 90)` | 기본 경계 |
| `--accent` | `oklch(58% 0.17 30)` | 테라코타 — 강조 포인트에만 |
| `--accent-soft` | `oklch(92% 0.04 30)` | 액센트 배경(하이라이트) |

## Palette — dark (`Deep Ink`)

| Token | Value |
|-------|-------|
| `--paper` | `oklch(14% 0.008 260)` |
| `--paper-raised` | `oklch(18% 0.01 260)` |
| `--paper-sunken` | `oklch(11% 0.008 260)` |
| `--ink` | `oklch(96% 0.005 90)` |
| `--ink-muted` | `oklch(70% 0.01 90)` |
| `--line` | `oklch(26% 0.012 260)` |
| `--accent` | `oklch(72% 0.15 30)` |

## Typography

| 역할 | 폰트 | 성격 |
|------|------|------|
| Display (hero heads) | **Fraunces** (variable, serif) | 타이포그래피로 시선을 끄는 메인 보이스 |
| UI / Body | **Inter** + `Apple SD Gothic Neo` / `Pretendard` 폴백 | 한국어·영문 모두 안정적인 본문 |
| Mono | **JetBrains Mono** | 코드, 단축키, 메타 라벨 |

- Display는 italic·SOFT axis 활용 (예: `<em>`)
- UI는 weight 400/500만 사용, 500이 semibold 역할
- 한국어 본문은 `letter-spacing: -0.005em` 전후가 자연스러움

## Spacing Rhythm

- 8pt grid가 아니라 *섹션 단위 fluid* (`--space-section: clamp(4rem, 3rem + 5vw, 10rem)`)
- 카드 내부 여백은 `--space-6`, 섹션 간은 `--space-section`
- 목록 줄간은 leading으로 처리, padding으로 채우지 않는다.

## Motion

- 기본 ease: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out-expo`)
- 기본 duration: 280ms
- 장식적 애니메이션 금지. 상태 전환, 포커스 이동, 리스트 리오더링에만 사용.
- `prefers-reduced-motion: reduce` 전면 준수.

## Component Inspiration

- Bear Notes — 본문 조판의 깨끗함
- iA Writer — "쓰는 감각"을 우선시하는 절제
- Linear — 섬세한 상태/키보드 힌트
- Read Tangle, It's Nice That — 에디토리얼 무드

## Anti-patterns (금지 목록)

- Tailwind 기본 `gray-500` / `indigo-500` 같은 Tailwind 팔레트 그대로 사용 금지.
- 카드 그리드 2×3/3×3 식으로 나열하는 템플릿 레이아웃 지양.
- 오른쪽 아래에 뜨는 "Chat with us" 플로팅 버튼 스타일 금지.
- gradient blob hero 금지.
- Lottie/3D emoji hero 금지.
- 포커스 링 제거(outline: none) 절대 금지 — 스타일링은 허용.

## Checklist (각 surface 마다 4/10 이상 충족)

- [ ] 크기 대비로 계층 분명 (H1 vs body 3× 이상)
- [ ] 공간 리듬이 일정하지 않고 의도적 (가령 섹션 간은 크게, 목록은 타이트)
- [ ] 레이어감 있음 (paper-raised vs paper-sunken, 미묘한 shadow)
- [ ] 타이포 페어링 (serif display + sans body) 적극 사용
- [ ] 컬러는 *의미*로만 — accent는 진짜 액센트 자리에만
- [ ] hover/focus/active 상태 디자인됨
- [ ] 그리드 깨는 에디토리얼 배치 1곳 이상
- [ ] 질감(미묘한 grain / noise / texture) 옵션 고려
- [ ] 모션이 흐름을 돕는가 (방해가 아니라)
- [ ] 데이터 시각화(리스트, 태그, 상태)가 디자인 시스템에 녹아있음
