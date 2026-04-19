#!/usr/bin/env bash
# everything-claude-code 수동 설치 스크립트 (macOS/Linux)
#
# 사용법:
#   1) 터미널 열기 (맥: Spotlight에서 "terminal")
#   2) 아래 한 줄 복붙 후 엔터
#        bash ~/Documents/memo/install-ecc.sh
#
# 재실행해도 안전합니다 (idempotent).

set -euo pipefail

REPO_URL="https://github.com/affaan-m/everything-claude-code.git"
CLONE_DIR="$HOME/.cache/everything-claude-code-src"
CLAUDE_DIR="$HOME/.claude"

log()  { printf "\033[1;34m[ECC]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[ECC]\033[0m %s\n" "$*"; }
die()  { printf "\033[1;31m[ECC]\033[0m %s\n" "$*" >&2; exit 1; }

# ── 1. 사전 요구 체크 ───────────────────────────────────────────
log "Claude Code CLI 확인..."
if ! command -v claude >/dev/null 2>&1; then
  die "claude CLI 가 없습니다. https://claude.com/download 에서 설치 후 다시 실행하세요."
fi
CLAUDE_VER=$(claude --version 2>&1 | head -1 | awk '{print $1}')
log "  claude $CLAUDE_VER OK"

command -v git  >/dev/null 2>&1 || die "git 이 필요합니다."
command -v node >/dev/null 2>&1 || die "Node.js 가 필요합니다 (https://nodejs.org)."
command -v npm  >/dev/null 2>&1 || die "npm 이 필요합니다."
log "  git / node / npm OK"

# ── 2. 레포 받기 (있으면 pull) ─────────────────────────────────
log "레포 준비: $CLONE_DIR"
mkdir -p "$(dirname "$CLONE_DIR")"
if [ -d "$CLONE_DIR/.git" ]; then
  (cd "$CLONE_DIR" && git fetch --depth 1 origin main && git reset --hard origin/main)
else
  git clone --depth 1 "$REPO_URL" "$CLONE_DIR"
fi

# ── 3. 의존성 설치 ─────────────────────────────────────────────
log "npm install..."
(cd "$CLONE_DIR" && npm install --silent)

# ── 4. OSS 풀 프로파일 설치 (agents/skills/commands/hooks/scripts 전부) ─
log "install.sh --profile full 실행..."
(cd "$CLONE_DIR" && bash install.sh --target claude --profile full)

# ── 5. Rules 수동 복사 (플러그인 방식으로는 안 됨) ─────────────
log "rules 복사 (common + typescript + python)..."
mkdir -p "$CLAUDE_DIR/rules"
cp -r "$CLONE_DIR/rules/common"     "$CLAUDE_DIR/rules/"
cp -r "$CLONE_DIR/rules/typescript" "$CLAUDE_DIR/rules/"
cp -r "$CLONE_DIR/rules/python"     "$CLAUDE_DIR/rules/"

# ── 6. 검증 ────────────────────────────────────────────────────
log "검증 중..."
AGENTS=$(ls "$CLAUDE_DIR/agents"   2>/dev/null | wc -l | tr -d ' ')
CMDS=$(  ls "$CLAUDE_DIR/commands" 2>/dev/null | wc -l | tr -d ' ')
SKILLS=$(ls "$CLAUDE_DIR/skills"   2>/dev/null | wc -l | tr -d ' ')
RULES=$( ls "$CLAUDE_DIR/rules"    2>/dev/null | wc -l | tr -d ' ')
HOOKS_JSON="$CLAUDE_DIR/hooks/hooks.json"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  설치 결과 ($CLAUDE_DIR)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "  agents    : %s 개\n" "$AGENTS"
printf "  commands  : %s 개\n" "$CMDS"
printf "  skills    : %s 개\n" "$SKILLS"
printf "  rules     : %s 개 디렉터리\n" "$RULES"
printf "  hooks.json: %s\n" "$([ -f "$HOOKS_JSON" ] && echo 있음 || echo 없음)"
echo

if command -v npx >/dev/null 2>&1; then
  (cd "$CLONE_DIR" && npx --no ecc doctor || true)
fi

echo
log "완료. 새 Claude Code 세션부터 적용됩니다."
log "파일 탐색기에서 확인하려면: Finder → Cmd+Shift+G → '~/.claude' 입력"
log "  또는 터미널: ls -la ~/.claude/"
