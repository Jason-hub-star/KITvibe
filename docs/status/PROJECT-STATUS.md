# Project Status

> 최종 업데이트: 2026-04-08

## 현재 단계

**Phase 1: 코어 구현** — D-2 통합+QA+UX 폴리시 완료

## 2026-04-08 원격 스키마 감사 + 구현 잠금

실제 원격 Supabase `public` 스키마를 `rest/v1` OpenAPI와 transaction pooler SQL 조회로 재확인했다.

- 원격 public 테이블: `users`, `lessons`, `lesson_materials`, `student_questions`, `ai_responses`, `misconception_summaries`
- 원격 public RPC: `match_chunks`, `rls_auto_enable`
- 원격 DB에는 아직 `sessions` 테이블이 없다
- 원격 DB의 `ai_responses.misconception_type`는 2026-04-08 반영 완료
- 원격 Storage bucket은 현재 `lesson-files`만 있다
- 원격 RLS는 켜져 있지만, 현재 확인된 policy는 `anon SELECT`만이다
- 따라서 `P-005 결과/요약`, `학생 이미지 질문`, `미니퀴즈`, `3회 오답 자동 전환` 구현 전
  세션 모델과 스키마 정합성을 먼저 잠가야 한다

상세 잠금 문서: `docs/status/IMPLEMENTATION-LOCK.md`

- 구현 진입 기준은 `잠금 체크리스트`와 `진행 게이트`를 먼저 충족하는 방식으로 고정
- 실제 실행 체크는 `docs/status/EXECUTION-CHECKLIST.md`에서 페이즈별로 관리

## 진행 상태

| 단계 | 상태 | 비고 |
|------|------|------|
| 아이디어 평가 | ✅ 완료 | overview.md |
| 시장 조사 | ✅ 완료 | overview.md §A |
| 하네스 선정 | ✅ 완료 | project-setup, design-to-code, socratic-review |
| overview.md 구조화 | ✅ 완료 | §A~§N, @extract-to 태그 |
| 문서 분리 추출 | ✅ 완료 | 23개 문서 생성 |
| 프로젝트 셋업 | ✅ 완료 | git init, GitHub push, 폴더 구조 |
| UI 시안 (Stitch) | ✅ 완료 | 5페이지 PNG + HTML 생성 |
| 디자인 토큰 추출 | ✅ 완료 | Stitch HTML → shadcn CSS 변수 매핑 |
| 기술스택 초기화 (D-7) | ✅ 완료 | Next.js 16 + TS + Tailwind + shadcn/ui |
| DB + 데모 역할 세션 + 레이아웃 (D-6) | ✅ 완료 | Supabase 6테이블, 역할 선택 UI, 공통 레이아웃 |
| 교사 업로드 + RAG (D-5) | ✅ 완료 | 파일 업로드, 텍스트 추출, 청킹, Context Stuffing |
| 학생 질문 + AI 응답 (D-4) | ✅ 완료 | 의도 분류, Grill-Me 질문 사다리, 스트리밍, Stitch UI |
| 교사 대시보드 (D-3) | ✅ 완료 | 오개념 히트맵, 질문 로그, TOP 5, AI 보충 추천 |
| 통합 + 시연 흐름 (D-2) | ✅ 완료 | 버그 12건 수정, QA 18/18 PASS, E2E 관통 PASS |
| 배포 + 제출 준비 (D-1) | ⬜ 대기 | Vercel 배포, AI 리포트 |
| 최종 제출 (D-0) | ⬜ 대기 | 04/13 마감 |

## D-4 완료 산출물

| 카테고리 | 파일 | 내용 |
|----------|------|------|
| 타입 | `src/types/question.types.ts` | ChatMode, ParsedAiResponse, ChatMessage, ChatState, RespondRequestBody |
| 프롬프트 | `src/lib/prompts/index.ts` | 4역할 AI 프롬프트 (분류/RAG/Grill-Me/교사요약) |
| AI 유틸 | `src/lib/ai/classifyIntent.ts` | 의도 분류 (generateText + Output.object) |
| AI 유틸 | `src/lib/ai/generateResponse.ts` | 스트리밍 응답 (streamText + RAG context) |
| 공유 유틸 | `src/utils/parseAiTags.ts` | 태그 파싱 ([RECOMMENDATION], [MODE_SWITCH], [GROUNDED], [MISCONCEPTION_TYPE]) |
| AI re-export | `src/lib/ai/parseAiTags.ts` | parseAiResponse re-export (서버용) |
| API | `src/app/api/questions/route.ts` | POST 질문 저장 + 의도 분류 |
| API | `src/app/api/questions/[id]/respond/route.ts` | POST 스트리밍 AI 응답 + 백그라운드 DB 저장 |
| Action | `src/lib/actions/questions.ts` | saveAiResponse, getQuestionsByLesson |
| 훅 | `src/hooks/useQuestionChat.ts` | 채팅 비즈니스 로직 (메시지/모드/스트리밍) |
| UI | `src/components/student/QuestionChat.tsx` | 채팅 레이아웃 셸 (Stitch 에디토리얼) |
| UI | `src/components/student/MessageBubble.tsx` | AI/학생 메시지 버블 + KaTeX + Collapsible |
| UI | `src/components/student/ChatInput.tsx` | textarea + 전송 버튼 |
| UI | `src/components/student/ModeSelector.tsx` | 텍스트+underline 모드 토글 |
| UI | `src/components/student/SessionStats.tsx` | 학습 통계 Bento Grid |
| 페이지 | `src/app/student/ask/page.tsx` | 수업 선택 + 채팅 통합 |

### D-4 추가: 이전 페이즈 Stitch 시안 반영 수정

| 카테고리 | 파일 | 변경 내용 |
|----------|------|-----------|
| 페이지 | `src/app/page.tsx` | Hero+배지+Stats+Methodology+Footer 5섹션 Stitch 리빌드 |
| UI | `src/components/layout/RoleSelector.tsx` | gap-px 구분선, progress bar, sublabel, "→" 화살표 |
| UI | `src/components/layout/Header.tsx` | 로고 아이콘, uppercase, 랜딩/채팅에서 숨김 |
| UI | `src/components/layout/LandingFooter.tsx` | 공통 Footer (로고+4링크+저작권) |
| 페이지 | `src/app/teacher/upload/page.tsx` | 3.5rem 헤드라인 + Footer 추가 |
| UI | `src/components/teacher/UploadForm.tsx` | underline 입력, 10px라벨, flat 파일리스트, space-y-12 |

## D-3 완료 산출물

| 카테고리 | 파일 | 내용 |
|----------|------|------|
| 마이그레이션 | `supabase/migrations/20260409000000_add_misconception_type.sql` | ai_responses에 misconception_type 추가 |
| 타입 | `src/types/question.types.ts` | AiResponse + Dashboard 타입 7개 (DashboardStats, MisconceptionHeatmapItem, TopQuestion, QuestionLogRow, DashboardData) |
| AI 유틸 | `src/lib/ai/generateSummary.ts` | TEACHER_SUMMARY 프롬프트 → 오개념 요약 (generateText + Output.object) |
| Action | `src/lib/actions/dashboard.ts` | getDashboardData(집계), generateMisconceptionSummary(AI+UPSERT) |
| API | `src/app/api/lessons/[id]/dashboard/route.ts` | GET 대시보드 데이터 |
| API | `src/app/api/lessons/[id]/misconceptions/route.ts` | POST 오개념 요약 생성 |
| 수정 | `src/app/api/questions/[id]/respond/route.ts` | misconception_type 저장 추가 |
| UI | `src/components/teacher/DashboardStats.tsx` | 3열 통계 (text-6xl extrabold) |
| UI | `src/components/teacher/MisconceptionHeatmap.tsx` | 수평 Progress 바 히트맵 |
| UI | `src/components/teacher/TopQuestionsCard.tsx` | TOP 5 번호 리스트 |
| UI | `src/components/teacher/QuestionLogTable.tsx` | 검정 헤더 4열 테이블 |
| UI | `src/components/teacher/AISpotlightCard.tsx` | AI 보충 추천 (검정 bg + decorative "AI") |
| UI | `src/components/teacher/CurriculumCard.tsx` | AI 커리큘럼 추천 (4칸 세그먼트 바) |
| UI | `src/components/teacher/LessonSelector.tsx` | 수업 선택 카드 리스트 |
| UI | `src/components/teacher/DashboardMisconceptionLoader.tsx` | 오개념 자동 생성 트리거 |
| 페이지 | `src/app/teacher/dashboard/page.tsx` | 수업 선택 → 대시보드 (Server Component) |

### D-3 셀프 리뷰 발견/수정 (3회 루프)

| 이슈 | 심각도 | 수정 |
|------|--------|------|
| useEffect deps에 isGenerating → 무한루프 | 🔴 | useRef(hasTriggered) + cleanup 패턴 |
| DB 컬럼 `name`인데 `display_name`으로 JOIN | 🔴 | `name` 필드로 수정 |
| Output.object에 배열 스키마 직접 전달 | 🟡 | z.object({ items: z.array(...) }) wrapper |
| FK 힌트 모호성 (users 관계 2개) | 🟡 | 정확한 constraint 이름 명시 |
| 학생 입력이 system 프롬프트에 삽입 (주입 위험) | 🟡 | user message로 분리 |

## D-2 완료 산출물

### 버그 수정 (12건 → 13건)

| 이슈 | 심각도 | 수정 |
|------|--------|------|
| studentId localStorage 키 불일치 (`pulda_user_id` → `useRole().userId`) | 🔴 P0 | `useQuestionChat`에 `studentId` 파라미터 추가 |
| 대시보드 render prop 직렬화 에러 (Server→Client 함수 전달) | 🔴 P0 | render prop → props 패턴 변경 |
| ChatInput `bg-white` 하드코딩 | 🟡 P1 | `bg-background` 디자인 토큰 |
| Footer `<span>` 접근성 위반 | 🟡 P1 | `<button>` 변경 |
| 대시보드 빈 상태 UX (0/0/0%) | 🟡 P1 | 회복률 `—`, 빈 상태 메시지 |
| 대시보드 loading.tsx 부재 | 🟡 P1 | 스켈레톤 UI 신규 생성 |
| 학생 채팅 홈 복귀 불가 | 🟡 P1 | Home 아이콘 링크 추가 |
| UploadForm label htmlFor 누락 | 🟡 P1 | `htmlFor` + `id` 매칭 |
| QuestionLogTable 모바일 깨짐 | 🟢 P2 | `overflow-x-auto` |
| ModeSelector underline 위치 | 🟢 P2 | `-mb-px` + `pb-3` |
| 수업 카드 모바일 패딩 | 🟢 P2 | `p-4 md:p-8` |
| Hero 소형폰 텍스트 오버플로 | 🟢 P2 | `text-4xl sm:text-5xl` |

### QA 결과

```
총 18개 시나리오 실행: 18/18 ALL PASS
├── P0 (데모 차단):  6/6  PASS
├── P1 (UX 손상):    8/8  PASS
├── P2 (품질):       4/4  PASS
└── E2E 관통 테스트:  4/4  PASS (업로드→질문→AI→대시보드)
```

상세: `docs/qa/QA-TEST-SCENARIOS.md`

### UX 폴리시

| 작업 | 내용 |
|------|------|
| 랜딩 Hero 카피 | 토스 스타일: "선생님은 수업자료만 올리세요. AI가 답 대신 질문을 던져..." |
| 3-Step How it works | 정적 3열 카드 (업로드→질문→대시보드) |
| 채팅 예시 질문 버튼 | "이 개념이 잘 이해가 안 돼요" 등 3개 원클릭 |
| 모드 선택기 한국어화 | GRILL-ME → "질문으로 풀기", GUIDE-ME → "설명 받기", QUICK-ME → "바로 풀이" |
| "⚠️ 자료 미확인" 제거 | 수업자료 근거일 때만 "📚 수업자료에서 찾았어요" 표시 |
| SessionStats 경량화 | 거대 2열 카드 → 얇은 프로그레스 바 + 격려 메시지 |
| Methodology 빈 칸 제거 | placeholder → How it works로 통합 |
| 브랜드 헤더 추가 | 랜딩 좌상단 BookOpen + "풀다 AI" |

### 코드 품질 개선

| 작업 | 내용 |
|------|------|
| `borderRadius: 0` 인라인 23개 제거 | 전역 `--radius: 0rem` SSOT로 통일 |
| AISpotlightCard `bg-white` → 토큰 | `bg-background text-foreground` |
| ModeSelector 마이크로 타이포 통일 | `font-bold tracking-widest` 추가 |
| `error.tsx` 생성 | 런타임 에러 바운더리 |
| `not-found.tsx` 생성 | 커스텀 404 |
| `admin.ts` `import 'server-only'` | 클라이언트 번들 가드 |
| setTimeout 메모리 누수 수정 | `modeAlertTimerRef` + `clearTimeout` |

### SSOT 정합성 감사 (12/12 PASS)

| 규칙 | 결과 |
|------|------|
| JSDoc 주석 | ✅ 비즈니스 파일 41개 완벽 |
| Import `@/` 절대경로 | ✅ 상대경로 0건 |
| `any` 타입 금지 | ✅ 0건 |
| 파일명 규칙 | ✅ 100% 준수 |
| 폴더별 CLAUDE.md | ✅ 4곳 존재 |
| 하드코딩 금지 | ✅ 0건 |
| API 응답 포맷 | ✅ 7개 라우트 통일 |
| 에러 로그 패턴 | ✅ `[ROUTE_NAME]` 준수 |
| 컴포넌트 순수성 | ✅ DB/AI 직접 호출 0건 |
| `'use client'` 최소 범위 | ✅ page.tsx 전부 SC |
| Supabase 접근 분리 | ✅ admin=서버, 컴포넌트=API 경유 |
| 프롬프트 중앙 관리 | ✅ `lib/prompts/index.ts` 1곳 |

### AI 프롬프트 품질 검증 + 수정

| 모드 | Before | After |
|------|--------|-------|
| Guide-Me | 🔴 질문을 던짐 (Grill-Me처럼 동작) | ✅ "설명해줄게요." + 단계별 설명 |
| Quick-Me | 🔴 질문을 던짐 | ✅ "바로 풀어볼게요." + 풀이 + 최종 답 |
| Grill-Me | ⚠️ 수업 맥락 미활용 | ✅ 수업 제목 주입 ({lesson_title}) |

수정: 모드별 행동 강조, "질문하지 마세요" 명시, 시작 문구 강제, 존댓말 톤 통일

### 15-스킬 프로젝트 리뷰

```
수정 완료: error.tsx, not-found.tsx, server-only, setTimeout cleanup
v2 대상: Supabase Database 타입, cn() 유틸 활용, API 인증, rate limiting, 다크모드
```

## 검증 상태

```
✅ npm run lint      — 0 errors (3 warnings: v2 준비 파일)
✅ npm run typecheck  — 통과
✅ npm run build      — 통과
✅ 페이지 렌더링     — 4개 구현 (/, /teacher/upload, /student/ask, /teacher/dashboard)
⚠️ P-005 상태       — `/student/summary`는 SSOT에 있으나 현재 미구현
✅ API 라우트        — 7개 구현
✅ QA 통과           — 18/18 시나리오 + E2E 관통
✅ SSOT 정합성       — 12/12 PASS
✅ 에러 바운더리     — error.tsx + not-found.tsx
```

## 마감

- **개발 마감:** 2026-04-13 (월)
- **심사:** 04/14~04/16
- **시상식:** 04/25
