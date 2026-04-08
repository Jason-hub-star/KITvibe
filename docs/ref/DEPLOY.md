# Deploy Plan — 풀다 AI

> 현재 상태: Vercel Preview/Production 배포 완료, Production 라이브 URL 응답 확인 완료
> 최종 프로덕션 URL: `https://vibecoding-two-jade.vercel.app`

## 배포 대상

- **플랫폼:** Vercel
- **도메인:** Vercel 기본 URL (커스텀 도메인 불필요)

## 2026-04-08 배포 결과

- **Preview 배포 URL:** `https://vibecoding-6jue3n13r-kimjuyoung1127s-projects.vercel.app`
- **Production 배포 URL:** `https://vibecoding-5b5ear5nj-kimjuyoung1127s-projects.vercel.app`
- **Production Alias:** `https://vibecoding-two-jade.vercel.app`
- **Preview 접근 상태:** Vercel 팀 보호로 `401` 확인
- **Production 스모크 상태:** `/`, `/teacher/upload`, `/student/ask`, `/teacher/dashboard` `HTTP 200`

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
4. Vercel 대시보드에 Supabase 환경변수 설정
5. `vercel deploy` — 프리뷰 배포
6. 검증 후 `vercel --prod` — 프로덕션

실제 완료 로그:

1. Preview 환경변수 5개 반영 완료
2. `vercel deploy --yes` 성공
3. Preview 보호 응답 `401` 확인
4. `vercel deploy --prod --yes` 성공
5. `https://vibecoding-two-jade.vercel.app` 핵심 라우트 `200` 확인

## 배포 직전 체크

- `npm run lint` — 에러 없음, 기존 warning 3개만 허용
- `npm run typecheck` — 통과
- `npm run build` — 통과
- 최신 실사용 완주 기준:
  - 학생 질문 → 4/4 단계
  - 미니퀴즈 생성/채점
  - `/student/summary`
  - 교사 대시보드 집계

## 라이브 URL 스모크 테스트

1. 랜딩 접속
2. 교사 역할 선택
3. `quadratic-e2e.md` 업로드
4. 학생 역할 선택
5. 이미지 포함 질문 1회 + 후속 답변
6. 미니퀴즈 / 세션 요약 진입
7. 교사 대시보드 확인

성공 기준:
- 서버 에러 없음
- 수업 생성 성공
- `student_questions.session_id` 연결 유지
- `4/4단계` 도달
- 대시보드 수치 렌더링

2026-04-08 완료 범위:

- `GET /` → `200`
- `GET /teacher/upload` → `200`
- `GET /student/ask` → `200`
- `GET /teacher/dashboard` → `200`

남은 권장 확인:

- 실기기 브라우저에서 `교사 업로드 → 학생 질문 → 미니퀴즈 → 요약 → 대시보드` 1회 수동 완주

## API Key 보안

- `.env.local` → `.gitignore`에 포함
- `.env.example` → 키 이름만 기재 (값은 빈칸)
- GitHub public 저장소에 키 절대 노출 금지
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용
- `NEXT_PUBLIC_` 접두사 없는 키는 브라우저 번들에 노출되면 안 됨
