# Deploy Plan — MathTutor AI

## 배포 대상

- **플랫폼:** Vercel
- **도메인:** Vercel 기본 URL (커스텀 도메인 불필요)

## 환경변수

| 변수 | 용도 | 소스 |
|------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL | Supabase Dashboard |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 공개 키 | Supabase Dashboard |
| SUPABASE_SERVICE_ROLE_KEY | Supabase 서비스 키 (서버만) | Supabase Dashboard |
| VERCEL_OIDC_TOKEN | AI Gateway 인증 | `vercel env pull` 자동 |

## 배포 순서

1. `vercel link` — 프로젝트 연결
2. AI Gateway 활성화 (Vercel 대시보드)
3. `vercel env pull` — OIDC 토큰 + 환경변수 풀
4. Supabase 프로젝트 생성 + 환경변수 설정
5. `vercel deploy` — 프리뷰 배포
6. 검증 후 `vercel --prod` — 프로덕션

## API Key 보안

- `.env.local` → `.gitignore`에 포함
- `.env.example` → 키 이름만 기재 (값은 빈칸)
- GitHub public 저장소에 키 절대 노출 금지
