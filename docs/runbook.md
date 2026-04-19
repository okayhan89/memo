# 배포 런북 — Memo

이 문서는 Memo 앱을 **Supabase Cloud + Vercel** 조합으로 프로덕션에 띄우는 순서입니다. 약 30분이면 완료할 수 있습니다.

## 선행 조건

- GitHub 계정 + 이 리포가 푸시된 리모트 저장소
- Supabase 계정 (https://supabase.com)
- Vercel 계정 (https://vercel.com)
- (선택) 사용할 도메인 DNS 제어

## 1. Supabase 프로젝트 만들기

1. Supabase 대시보드 → New Project
   - Region: **Northeast Asia (Tokyo)** 권장 (한국 레이턴시 ~30ms)
   - Database password: 20자 이상 무작위 (어딘가에 안전하게 저장)
2. 프로젝트가 만들어지면 **Project Settings → API** 에서 다음 세 개 복사
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` 키 → `SUPABASE_SERVICE_ROLE_KEY` (서버 전용, 절대 클라이언트 노출 금지)

## 2. 마이그레이션 적용

로컬에서 한 번만 실행하면 됩니다. (CLI는 이미 `web/node_modules/.bin/supabase` 에 들어 있습니다.)

```bash
cd /Users/hanseung-yeob/Documents/memo
export SUPABASE_ACCESS_TOKEN=<Supabase Personal Access Token>
# 한 번만: 프로젝트 링크
web/node_modules/.bin/supabase link --project-ref <project-ref>
# 마이그레이션 푸시
web/node_modules/.bin/supabase db push --include-all
```

> Personal Access Token은 Supabase 대시보드 → Account → Access Tokens 에서 발급합니다.

완료되면 **Database → Tables** 에서 `profiles`, `folders`, `notes`, `tags`, `note_tags`가 생기고, **Database → Functions** 에서 `search_notes`가 보입니다.

## 3. Auth 설정

Supabase 대시보드 → Authentication → URL Configuration

- Site URL: `https://memo.example.com` (실제 도메인)
- Additional Redirect URLs:
  - `https://memo.example.com/auth/callback`
  - (프리뷰를 쓰려면) `https://*.vercel.app/auth/callback`

Email 템플릿을 한국어로 바꿔두면 사용자 경험이 훨씬 좋습니다.

## 4. 로컬 `.env.local` 작성

`web/.env.local` (이 파일은 gitignore 됩니다)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon
SUPABASE_SERVICE_ROLE_KEY=eyJ...service-role

NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

```bash
cd web && PORT=3001 pnpm dev
```

로그인 페이지에서 본인 이메일로 매직 링크를 받아 노트 흐름이 동작하는지 확인합니다.

## 5. Vercel에 배포

1. Vercel 대시보드 → Add New → Project → GitHub 리포 import
2. **Root Directory**: `./` (Vercel이 `vercel.json`의 `buildCommand`를 읽습니다)
3. Environment Variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (실제 배포 URL)
   - `NEXT_PUBLIC_APP_ENV=production`
   - (선택) `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`
4. **Deploy** 클릭 → 첫 배포 (~2분)
5. 성공하면 `https://memo-xxxx.vercel.app` 에서 바로 사용 가능

## 6. 커스텀 도메인

1. Vercel → Project Settings → Domains → `memo.example.com` 추가
2. DNS CNAME `cname.vercel-dns.com` 설정
3. Supabase Auth URL Configuration에서 Site URL·Redirect URL도 커스텀 도메인으로 갱신

## 7. 관측 (선택)

### Sentry
1. sentry.io 프로젝트 생성 (Next.js 템플릿)
2. DSN을 `NEXT_PUBLIC_SENTRY_DSN`에 추가
3. `@sentry/nextjs` 패키지로 교체하고 `sentry.client.config.ts` 작성 (Phase 8 확장 포인트)

### PostHog
1. app.posthog.com 프로젝트 생성
2. Project API Key를 `NEXT_PUBLIC_POSTHOG_KEY`에 추가
3. `@/lib/analytics.ts`의 `track()` 호출이 자동으로 동작합니다

## 8. 운영 체크리스트

- [ ] Supabase 일일 자동 백업 활성화 (Pro 플랜)
- [ ] Vercel → Production Branch는 `main`으로 제한
- [ ] GitHub Branch Protection: PR + CI green 없이는 main 병합 불가
- [ ] `securityheaders.com` A 등급 확인
- [ ] Lighthouse mobile ≥ 90 확인
- [ ] axe-core 위반 0건 확인
- [ ] 실제 로그인/노트 작성/검색/삭제/복원 E2E 수기 검증

## 9. 롤백

Vercel → Deployments → 문제 없는 이전 배포 → **Promote to Production**. 데이터베이스 변경이 포함된 마이그레이션이라면 `supabase db push --dry-run` 으로 미리 확인하고, 위험 시 포인트-인-타임 복구(Supabase Pro)로 대응.

## 10. 시크릿 로테이션

- Service Role Key: Supabase → Settings → API → Reset → Vercel 환경 변수 갱신 → 재배포
- Database Password: Supabase → Settings → Database → Reset
- Personal Access Token: Account → Access Tokens

---

## 알려진 로컬 포트 충돌

macOS에서 Cursor IDE가 포트 3000을 선점하는 경우가 있어, 이 프로젝트는 기본 개발 포트를 **3001**로 사용합니다 (`PORT=3001 pnpm dev`).

## Phase별 진행 상황

- [x] Phase 0 — 리포 / 툴체인 / CI
- [x] Phase 1 — 인증 + 노트 CRUD + RLS
- [x] Phase 2 — Tiptap 리치 에디터
- [x] Phase 3 — 휴지통 / 즐겨찾기 필터 (태그·폴더는 Phase 5 이후 확장)
- [x] Phase 4 — 한국어 전체 검색 (tsvector + trigram + RPC)
- [x] Phase 6 (부분) — 마크다운 내보내기
- [x] Phase 7 (부분) — 테마 토글 / 명령 팔레트 / 접근성 기본
- [x] Phase 8 (부분) — 보안 헤더 / 관측 스캐폴딩
- [x] Phase 9 (부분) — 배포 런북 / vercel.json / health check
- [ ] Phase 5 — 오프라인 / CRDT 동기화 / 버전 히스토리 (차기 스프린트)
- [ ] Phase 6 (나머지) — 공개 링크 / PDF 내보내기
- [ ] Phase 8 (나머지) — `@sentry/nextjs` 전면 통합 / Lighthouse CI 워크플로
