# Project Status

> 최종 업데이트: 2026-04-07

## 현재 단계

**Phase 1: 코어 구현** — D-4 학생 질문 + AI 응답 완료

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
| DB + 인증 + 레이아웃 (D-6) | ✅ 완료 | Supabase 6테이블, 역할 선택 UI, 공통 레이아웃 |
| 교사 업로드 + RAG (D-5) | ✅ 완료 | 파일 업로드, 텍스트 추출, 청킹, Context Stuffing |
| 학생 질문 + AI 응답 (D-4) | ✅ 완료 | 의도 분류, Grill-Me 질문 사다리, 스트리밍, Stitch UI |
| 교사 대시보드 (D-3) | ⬜ 대기 | 오개념 히트맵, 질문 로그 |
| 통합 + 시연 흐름 (D-2) | ⬜ 대기 | end-to-end 데모, UI 폴리시 |
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

## 검증 상태

```
✅ npm run lint      — 0 errors (3 warnings: v2 준비 파일)
✅ npm run typecheck  — 통과
✅ npm run build      — 통과
✅ 페이지 렌더링     — 4개 200 OK (/, /teacher/upload, /student/ask, /student/ask?lesson=...)
✅ API 테스트 (curl)  — 질문 저장+분류(concept 0.95), 스트리밍 응답+[RECOMMENDATION] 태그
✅ Stitch 시안 반영   — P-001 93%, P-002 90%, P-003 95%
```

## 마감

- **개발 마감:** 2026-04-13 (월)
- **심사:** 04/14~04/16
- **시상식:** 04/25
