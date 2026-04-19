# everything-claude-code 설치 & 하네스 엔지니어링 활용 가이드

> **대상**: Claude Code CLI (내 컴퓨터)
> **설치 방식**: 플러그인 마켓플레이스 (권장) + 수동 보완
> **목적**: 에이전트 하네스(harness) 성능 최적화 — Agents / Skills / Hooks / Rules / Memory / Instincts / MCP / Commands 전 구성 활용
> **레포**: <https://github.com/affaan-m/everything-claude-code>

---

## 0. 먼저 알아둘 것

이 레포는 단순 스킬 모음이 아니라 **"에이전트 하네스 최적화 시스템"** 입니다. 핵심 철학은 세 가지:

1. **Research-first** — 코드를 짜기 전 검색/문서/예제를 먼저 확인하도록 강제
2. **Instincts(본능)** — 신뢰도(confidence) 점수가 붙은 영구 학습 메모리. 같은 실수를 반복하지 않음
3. **Hook-driven discipline** — TDD, 타입체크, 보안 스캔, 리뷰가 자동 트리거

세 개의 식별자가 **다르니 헷갈리지 마세요**:

| 종류 | 값 |
|---|---|
| GitHub 레포 | `affaan-m/everything-claude-code` |
| 플러그인 ID | `everything-claude-code@everything-claude-code` |
| npm 패키지 | `ecc-universal` |

---

## 1. 사전 요구사항

- **Claude Code CLI v2.1.0 이상** (hook system 지원 필수). 구버전이면 먼저 `claude --version`으로 확인 후 업그레이드.
- Node.js + 패키지 매니저 (npm / pnpm / yarn / bun 중 택 1, 자동 감지됨)
- Git
- OS: macOS / Linux / Windows 전부 지원 (Windows는 `%USERPROFILE%\.claude`)

---

## 2. 설치 단계 (플러그인 마켓플레이스 방식)

### 2-1. Claude Code 안에서 두 줄 실행

```text
/plugin marketplace add https://github.com/affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code
```

설치되면 48 agents + 183 skills + 79 legacy command shims 가 붙습니다.

### 2-2. Rules 는 반드시 "수동"으로 설치 ⚠️

플러그인 규격상 rules는 자동 배포가 불가능합니다(상위 제한). 하네스 엔지니어링 관점에서 rules가 가장 강한 가드레일이라 **꼭** 복사해야 합니다.

```bash
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code
mkdir -p ~/.claude/rules
cp -r rules/common ~/.claude/rules/
cp -r rules/typescript ~/.claude/rules/   # 주 스택에 맞춰 골라서
# 필요 시: rules/python, rules/golang, rules/swift, rules/php
```

> 언어 디렉터리를 **통째로** 복사하세요. 개별 파일 복사 금지.

### 2-3. Hooks 런타임 설치 (자동화 핵심)

`hooks/hooks.json` 을 그대로 복사하면 "Duplicate hooks file detected" 에러가 납니다. 반드시 installer 모듈로:

```bash
# macOS / Linux
bash ./install.sh --target claude --modules hooks-runtime

# Windows PowerShell
pwsh -File .\install.ps1 --target claude --modules hooks-runtime
```

### 2-4. MCP 서버 연결 (14개 중 선별)

`mcp-configs/mcp-servers.json` 에서 필요한 서버만 `~/.claude/settings.json` 또는 프로젝트 `.mcp.json` 에 복사. `YOUR_*_HERE` 플레이스홀더를 본인 API 키로 교체.

> **주의**: MCP를 10개 이상 붙이면 200k 컨텍스트가 70k까지 쪼그라듭니다. 정말 쓸 것만 켜세요.

### 2-5. Multi-* 커맨드용 ccg-workflow (옵션)

`/multi-review`, `/multi-plan` 등을 쓸 거면:

```bash
npx ccg-workflow
```

---

## 3. 대안 경로 — OSS installer (마켓플레이스가 안 먹을 때)

자체 호스팅 마켓플레이스 해석에 실패하는 빌드가 있습니다. 그럴 땐:

```bash
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code
npm install
./install.sh --profile full              # 전체 설치
# 또는 언어별
./install.sh typescript
./install.sh --target cursor typescript   # Cursor 에도 깔기
./install.sh --target gemini --profile full
```

Windows:

```powershell
.\install.ps1 --profile full
npx ecc-install typescript
```

### 하네스 튜닝 환경변수

| 변수 | 의미 |
|---|---|
| `ECC_HOOK_PROFILE` | `minimal` \| `standard`(기본) \| `strict` — TDD/타입체크 강도 |
| `ECC_DISABLED_HOOKS` | 예: `pre:bash:tmux-reminder,post:edit:typecheck` |
| `ECC_DISABLED_MCPS` | 예: `github,context7,exa,playwright` |
| `CLAUDE_PACKAGE_MANAGER` | `pnpm` 등 강제 지정 |

`strict` 프로파일은 본격적인 에이전트 운영(야간 장시간 실행)에 권장.

---

## 4. 설치 검증 (반드시 실행)

```bash
/plugin list everything-claude-code@everything-claude-code   # 플러그인 로드 확인
claude --version                                             # v2.1+ 확인
ecc list-installed                                           # 설치된 모듈 목록
ecc doctor                                                   # 헬스체크
ecc repair                                                   # 문제 있으면 복구
node tests/run-all.js                                        # 1282개 테스트 실행
npx ecc-agentshield scan                                     # 보안 스캔
```

`ecc doctor` 에서 빨간 불이 뜨면 **재설치 전에 `ecc repair` 부터** 돌리세요.

---

## 5. 하네스 엔지니어링 관점에서 구성요소 200% 활용법

### 5-1. Agents (48) — "위임의 기술"

단순히 부르기보다, 작업 단계별로 역할을 고정하면 품질이 급상승합니다.

| 단계 | 주로 쓰는 에이전트 |
|---|---|
| 설계 | `planner`, `architect` |
| 구현 | `tdd-guide`, 언어별 `*-build-resolver` |
| 검토 | `code-reviewer`, `security-reviewer`, `refactor-cleaner` |
| 장기 운영 | `chief-of-staff`, `loop-operator`, `harness-optimizer` |

**운영 팁**: PR마다 `code-reviewer` → `security-reviewer` → `doc-updater` 순서로 파이프라인을 고정.

### 5-2. Skills (183) — "작업 유형별 SOP"

- 처음에는 `tdd-workflow`, `search-first`, `verification-loop`, `strategic-compact` 4개만 제대로 익히세요.
- 백엔드 스택이면 `django` / `laravel` / `springboot` 중 본인 것만 활성화.
- `continuous-learning/v2` 는 Instincts 와 짝꿍 — 반드시 같이 켜기.

### 5-3. Hooks — "자동 규율"

가장 체감 큰 영역입니다. `hooks-runtime` 모듈만 제대로 깔리면 다음이 자동:

- TDD 강제 (테스트 없는 커밋 차단)
- edit 후 typecheck/lint 자동
- session-start / session-end / pre-compact 에서 메모리 저장
- 보안 스캔 hook 으로 시크릿 유출 방지

커스터마이즈: `ECC_HOOK_PROFILE=strict` + 필요 없는 hook은 `ECC_DISABLED_HOOKS` 에 명시.

### 5-4. Rules (29~34) — "항상 따르는 헌법"

Skill은 상황에 따라 "참고"되지만 Rule은 **매 호출마다** 주입됩니다. `common/` 은 필수, 스택 rule 은 1개만.

> 실전 팁: 팀 컨벤션이 있으면 `~/.claude/rules/team/` 를 추가로 만들어 팀 전용 규칙 복사.

### 5-5. Memory + Instincts — "재학습 방지 레이어"

- `hooks/memory-persistence/` + `scripts/hooks/` 의 `session-start.js`, `session-end.js`, `pre-compact.js` 가 세션 간 컨텍스트를 디스크에 저장.
- Instincts 는 confidence-scored 학습 기억. 커맨드:

```text
/instinct-status     # 현재 본능 목록 & 신뢰도
/instinct-import     # 다른 프로젝트에서 가져오기
/instinct-export     # 백업
/evolve              # 저신뢰 본능 재평가
/prune               # 쓸모없는 본능 제거
/promote             # 확신 있는 본능 rule 로 승격
```

**운영 루틴**: 주 1회 `/instinct-status` → `/prune` → `/promote` 로 관리.

### 5-6. MCP (14) — "외부 도구 연동"

전부 켜지 말고 **10개 이하, 도구 80개 이하** 를 지키세요. 추천 기본 세트:

- `github` (코드/PR 맥락)
- `context7` (최신 라이브러리 문서)
- `sequential-thinking` (장문 추론)
- `memory` (장기 기억 — Instincts 와 시너지)

나머지는 그때그때 `disabledMcpServers` 로 토글.

### 5-7. Commands (79) — "슬래시 인터페이스"

레거시 shim 이지만 여전히 쓸만함:

| 카테고리 | 예시 |
|---|---|
| 개발 사이클 | `/tdd`, `/plan`, `/e2e`, `/code-review`, `/build-fix` |
| 세션/운영 | `/sessions`, `/pm2`, `/quality-gate`, `/model-route` |
| 하네스 자체 | `/harness-audit`, `/loop-*` |
| 멀티 에이전트 | `/multi-review`, `/multi-plan` (ccg-workflow 필요) |

> 플러그인 설치형은 `/ecc:plan` 처럼 **네임스페이스가 붙고**, 수동 복사형은 `/plan` 로 쓰입니다. 혼용하면 충돌.

---

## 6. 하네스 엔지니어링 — 4주 운영 루틴 제안

| 주차 | 할 일 |
|---|---|
| 1주차 | 마켓플레이스 설치 + rules 수동 복사 + `ecc doctor` 통과. 하루에 1개 skill만 몸에 익히기. |
| 2주차 | `ECC_HOOK_PROFILE=standard` → `strict` 로 상향. `/tdd` 를 기본 워크플로로 고정. |
| 3주차 | Instincts 활성화. 매 PR 후 `/promote` 로 확실한 패턴을 rule 로 올림. |
| 4주차 | `/harness-audit` 실행 → 병목 분석. 불필요한 MCP/hook 을 `ECC_DISABLED_*` 로 정리. |

---

## 7. 자주 걸리는 함정 (Troubleshooting)

1. **"Duplicate hooks file detected"** → `.claude-plugin/plugin.json` 에 `"hooks"` 필드를 절대 추가하지 말 것. 이슈 #29, #52, #103.
2. **마켓플레이스 설치 실패** → OSS installer (`./install.sh --profile full`) 로 폴백.
3. **컨텍스트가 갑자기 줄었다** → MCP 수 점검. 10개 이하, 도구 80개 이하 유지.
4. **세팅이 날아갔다** → `ecc list-installed` → `ecc doctor` → `ecc repair` 순서. 재설치는 최후 수단.
5. **Windows에서 rules 가 안 보임** → `%USERPROFILE%\.claude\rules` 경로 확인 (`~/.claude` 아님).
6. **`/plan` 이 안 먹힌다** → 플러그인 설치형은 `/ecc:plan` 을 쓰세요.
7. **Codex / Gemini 사용자** → Hook 패리티가 없습니다. `AGENTS.md` 기반 instruction-only 모드만 동작.

---

## 8. 다음 할 일 체크리스트

- [ ] `claude --version` 으로 v2.1.0 이상 확인
- [ ] 마켓플레이스 add → plugin install 두 줄 실행
- [ ] `rules/common` + 주 스택 rule 수동 복사
- [ ] `./install.sh --target claude --modules hooks-runtime` 로 hook 런타임 설치
- [ ] `~/.claude/settings.json` 에 필요한 MCP 3~4개만 등록
- [ ] `/plugin list`, `ecc doctor`, `node tests/run-all.js` 로 검증
- [ ] `ECC_HOOK_PROFILE=standard` 로 일주일 운영 → `strict` 로 상향
- [ ] 주 1회 `/instinct-status` → `/prune` → `/promote` 루틴 시작

---

## 참고 링크

- 레포: <https://github.com/affaan-m/everything-claude-code>
- README: <https://github.com/affaan-m/everything-claude-code/blob/main/README.md>
- 플러그인 디렉터리: <https://github.com/affaan-m/everything-claude-code/tree/main/plugins>
- Claude Code 마켓플레이스 공식 문서: <https://code.claude.com/docs/en/plugin-marketplaces>
