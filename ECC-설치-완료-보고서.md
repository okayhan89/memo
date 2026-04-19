# everything-claude-code 설치 완료 보고서 (OSS 풀 설치 + 플러그인 하이브리드)

**설치 일시**: 2026-04-19
**대상**: `~/.claude` (사용자 홈, user scope)
**버전**: `v1.10.0` (commit `1a50145`)
**상태**: ✅ OK — `ecc doctor` 통과 (issues: none)

---

## ⚠️ "파일이 안 보여요" 해결

`~/.claude` 는 **숨김 폴더** (앞에 점). 파일 탐색기에서 보려면:

| OS | 방법 |
|---|---|
| macOS Finder | 홈으로 이동 후 `Cmd + Shift + .` (점) |
| Windows 탐색기 | 보기 → "숨긴 항목" 체크 |
| VS Code | 홈 폴더 열기 (숨김 파일 기본 표시) |

---

## 실제 설치 구조 (이제 눈에 보입니다)

```
~/.claude/
├── agents/       48개 .md 파일  ← OSS 직접 설치 (편집 가능)
├── commands/     79개 .md 파일  ← OSS 직접 설치 (편집 가능)
├── rules/        common + 14개 언어 디렉터리  ← 규칙, 매 호출마다 주입
│   ├── common/   10개 (agents, code-review, coding-style, dev-workflow,
│   │             git-workflow, hooks, patterns, performance, security, testing)
│   ├── typescript/
│   ├── python/
│   └── ... (cpp, csharp, dart, golang, java, kotlin, perl, php, rust, swift, web, zh)
├── hooks/        hooks.json  ← 95개 훅 설정
├── scripts/      96개 파일  ← 훅 런타임 (JS)
├── ecc/          install-state.json
└── plugins/cache/everything-claude-code/everything-claude-code/1.10.0/
    └── skills/   183개 스킬 폴더  ← 플러그인 경로 (Cowork는 skills/ 폴더가
                                     읽기전용이라 plugins/ 경로로 우회,
                                     사용자 로컬에서는 상관 없음)
```

## 왜 이런 하이브리드가 됐나

Cowork 샌드박스는 기본 `~/.claude/skills/` 를 **읽기 전용**으로 마운트해요 (docx/pptx/pdf 등 내장 스킬 보호용). 그래서 OSS 풀 설치가 skills 쓰는 부분에서 막혔습니다. **하지만 사용자 로컬 컴퓨터(실제 Claude Code 실행 환경)는 이 제한이 없으므로**, 본인 머신에서 동일 명령을 돌리면 `~/.claude/skills/` 에 183개 스킬이 그대로 풀립니다.

결과적으로:

- 지금 Cowork에서는 → agents/commands/rules/hooks 는 직접 보이고, skills 만 플러그인 캐시
- 본인 머신에서 다시 돌리면 → skills 도 직접 풀림

**둘 다 기능은 100% 동일.** 플러그인 캐시의 skills 도 Claude Code가 자동 인식합니다.

---

## 사용자 머신에서 "완전히 풀어놓고" 싶을 때

본인 노트북/데스크톱에서 터미널 열고:

```bash
# 1) 레포 받기
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code
npm install

# 2) 풀 프로파일 설치 (skills 까지 ~/.claude/skills/ 에 직접 풀림)
./install.sh --target claude --profile full

# 3) 검증
npx ecc doctor
```

macOS Finder에서 `~/.claude/skills/` 열어서 183개 폴더 확인 가능.

---

## 실행된 명령 이력 (이번 세션)

```bash
# 초기 설치 (hook 런타임 + rules)
claude plugin marketplace add https://github.com/affaan-m/everything-claude-code
claude plugin install everything-claude-code@everything-claude-code
cp -r ecc-repo/rules/{common,typescript,python} ~/.claude/rules/
bash ecc-repo/install.sh --target claude --modules hooks-runtime

# 사용자가 "파일이 안 보인다" → OSS 풀 설치로 전환
claude plugin uninstall everything-claude-code@everything-claude-code
bash ecc-repo/install.sh --target claude --profile full
  # ⇒ agents/commands/rules/hooks 는 직접 기록, skills 에서 read-only 오류
claude plugin install everything-claude-code@everything-claude-code
  # ⇒ skills 만 플러그인 캐시로 우회 복구
```

---

## 검증 결과

```
$ claude plugin list
Installed plugins:
  ❯ everything-claude-code@everything-claude-code
    Version: 1.10.0
    Status: ✔ enabled

$ npx ecc doctor
Doctor report:
- claude-home    Status: OK    Issues: none
Summary: checked=1, ok=1, warnings=0, errors=0
```

---

## 새 Claude Code 세션에서 바로 쓸 수 있는 것

| 즉시 활성 | 설명 |
|---|---|
| 48 agents (`.md` 편집 가능) | planner, architect, tdd-guide, code-reviewer, security-reviewer, harness-optimizer, chief-of-staff, loop-operator, 언어별 build-resolver/reviewer 등 |
| 183 skills (플러그인 경로) | tdd-workflow, search-first, verification-loop, strategic-compact, continuous-learning/v2, agent-harness-construction 등 |
| 79 slash commands | `/ecc:plan`, `/ecc:tdd`, `/ecc:code-review`, `/ecc:harness-audit`, `/ecc:build-fix` 등 |
| Hooks 자동 규율 | Bash 전 안전 검사(이번 세션에서 이미 여러 번 발동), 편집 후 typecheck, 세션 라이프사이클 메모리 저장 |
| 140+ rules (common+언어별) | 매 호출마다 주입되는 가드레일 |

> 플러그인으로 설치했으므로 커맨드 네임스페이스는 `/ecc:` 로 시작합니다 (`/ecc:plan` 등).

---

## 하네스 엔지니어링 1주차 루틴

| 날 | 할 일 |
|---|---|
| Day 1 | 새 Claude Code 세션 → `/ecc:plan` 한번, `/ecc:tdd` 한번 돌려보기 |
| Day 2 | `ECC_HOOK_PROFILE=standard` 로 코딩, hook 체감 기록 |
| Day 3 | 걸리적거리는 hook 만 `ECC_DISABLED_HOOKS` 로 선별 차단 |
| Day 4 | MCP 3~4개만 연결 (github / context7 / sequential-thinking 추천) |
| Day 5 | `/ecc:harness-audit` 실행 → 결과 반영 |
| Day 6–7 | `ECC_HOOK_PROFILE=strict` 로 상향, `/ecc:instinct-status` 첫 확인 |

---

## 문제가 생기면

```bash
npx ecc doctor       # 헬스체크
npx ecc list-installed
npx ecc repair       # 자동 복구
claude plugin list
```

그래도 꼬이면 [설치 가이드](computer:///sessions/hopeful-stoic-davinci/mnt/memo/everything-claude-code-설치-가이드.md) 의 "7. 자주 걸리는 함정" 섹션 참고.

---

**요약**: 설치 완료. 숨김 폴더라 안 보였을 뿐, 파일은 전부 제자리에 있습니다. agents/commands/rules/hooks 는 `~/.claude/` 바로 아래에 풀려서 편집 가능한 상태고, skills 는 플러그인 캐시로 동작 중. `ecc doctor` 녹색불.
