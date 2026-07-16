# 코드 컨벤션 (강제)

## 폴더 관심사 분리

```
src/
├── app/           # 라우팅 접착제 (FE 페이지 + BE API 공존 = Next.js 표준)
├── components/    # 순수 UI (프론트엔드) — 비즈니스 로직 금지
├── lib/           # 비즈니스 로직 (백엔드) — 클라이언트에서 직접 import 금지
│   ├── actions/   # Server Actions
│   ├── prompts/   # AI 프롬프트 템플릿
│   ├── rag/       # RAG 파이프라인
│   └── supabase/  # DB 접근 유틸
├── types/         # 공유 타입 (FE+BE)
└── hooks/         # 클라이언트 커스텀 훅 (FE)
```

## 도메인별 파일명 일치 (강제)

모든 도메인(lesson, question, misconception)은 파일명이 레이어 간 일관되어야 함:

```
도메인: lesson
├── app/api/lessons/route.ts           # API
├── app/teacher/upload/page.tsx        # 페이지
├── components/teacher/LessonForm.tsx  # UI
├── lib/actions/lessons.ts             # Server Action
├── lib/rag/lessonMaterials.ts         # RAG
├── types/lesson.types.ts             # 타입

도메인: question
├── app/api/questions/route.ts
├── app/student/ask/page.tsx
├── components/student/QuestionChat.tsx
├── lib/actions/questions.ts
├── lib/ai/classifyIntent.ts
├── types/question.types.ts
```

## 폴더별 CLAUDE.md (핵심 4곳)

| 폴더 | CLAUDE.md 핵심 내용 |
|------|-------------------|
| `src/lib/` | "서버 전용. 클라이언트에서 직접 import 금지. AI 키 접근 가능" |
| `src/components/` | "순수 UI만. 비즈니스 로직/DB 접근 금지. shadcn/ui 우선 사용" |
| `src/types/` | "DB 컬럼명과 1:1 매핑. any 금지. Subject = string (범용)" |
| `src/app/api/` | "응답 포맷 { success, data/error, code } 통일. 에러 코드 필수" |

## 파일 상단 주석 (강제)

모든 .ts/.tsx 파일 최상단에 JSDoc 주석 필수:

```typescript
/**
 * @file lib/actions/questions.ts
 * @description 학생 질문 처리 Server Actions
 *   - 질문 저장, 의도 분류, Grill-Me 응답 스트리밍
 * @domain question
 * @access server-only
 */
```

필수 태그: `@file`, `@description`, `@domain`, `@access` (server-only | client | shared)

## 파일/폴더 명명

| 대상 | 규칙 | 예시 |
|------|------|------|
| 폴더 | `kebab-case` | `app/student/ask/` |
| 라우트 파일 | Next.js 표준 | `page.tsx`, `route.ts`, `layout.tsx` |
| 컴포넌트 | `PascalCase.tsx` | `QuestionCard.tsx` |
| 유틸/라이브러리 | `camelCase.ts` | `classifyIntent.ts` |
| 타입 | `도메인.types.ts` | `lesson.types.ts` |
| 프롬프트 | `lib/prompts/index.ts` | 4개 역할 전부 여기 |

## Import 패턴

```typescript
// ✅ 항상 절대 경로
import { Button } from '@/components/ui/button';
import type { Lesson } from '@/types/lesson.types';
import { SYSTEM_PROMPTS } from '@/lib/prompts';

// ❌ 금지
import { Button } from '../../components/ui/button';
```

## 컴포넌트 패턴

| 규칙 | 설명 |
|------|------|
| `page.tsx` = Server Component 기본 | 데이터 페칭은 서버에서 |
| `'use client'` = 최소 범위 | 상태/이벤트 필요한 컴포넌트만 |
| AI 호출 = Server Action만 | 클라이언트에서 직접 AI API 호출 금지 |
| Supabase 쓰기 = 서버만 | 클라이언트는 RLS 보호 아래 읽기만 |

## API 응답 포맷 (일관성 강제)

```typescript
// ✅ 성공
{ success: true, data: T, message?: string }

// ✅ 실패
{ success: false, error: string, code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR' }
```

- 201 (생성), 400 (검증 실패), 404 (없음), 500 (서버 오류)
- 에러 로그: `console.error('[ROUTE_NAME]', error)`
- 사용자에게 스택 트레이스/DB 에러 절대 노출 금지

## 타입 정의

```
src/types/
├── lesson.types.ts      # Lesson, LessonMaterial
├── question.types.ts    # StudentQuestion, AiResponse, IntentType
├── api.types.ts         # ApiResponse<T>, 요청/응답 타입
└── index.ts             # barrel export
```

- `Subject = string` (전과목 범용, 기본값 'math')
- `IntentType = 'concept' | 'hint' | 'review' | 'similar'`
- DB 컬럼명 = 타입 속성명 정확히 일치

## 상태 관리

| 상태 | 저장소 | 예시 |
|------|--------|------|
| UI 즉시 상태 | React state | isLoading, modalOpen |
| 세션 간 유지 | localStorage | userRole, userId |
| 공유 가능 | URL searchParams | `?lesson=abc123` |
| 영속 데이터 | Supabase | 질문, 응답, 오개념 |

## 환경 변수

| 변수 | 접근 | 용도 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 + 서버 | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 + 서버 | 공개 키 (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** | 관리자 키 |
| `VERCEL_OIDC_TOKEN` | **서버 전용** | AI Gateway 인증 |

- `NEXT_PUBLIC_` = 브라우저 노출 OK
- 나머지 = **서버 전용, 클라이언트 접근 시 에러 throw**
- `.env.local` = `.gitignore`에 포함 (절대 커밋 금지)

## 에러 처리 3레이어

| 레이어 | 패턴 | 사용자 메시지 |
|--------|------|-------------|
| API route | try/catch + HTTP 상태코드 | `{ error: "...", code: "..." }` |
| Server Action | throw new Error('TYPE: 메시지') | 타입별 분기 |
| 클라이언트 | try/catch + shadcn toast | 친절한 한국어 메시지 |

## 프롬프트 관리

- **모든 시스템 프롬프트**: `src/lib/prompts/index.ts` 1곳에서 관리
- **변수 치환**: `{current_step}`, `{retrieved_chunks}`, `{question}` 플레이스홀더
- **프롬프트 주입 방지**: 사용자 입력은 반드시 `role: 'user'` message로 분리
- **태그 규칙**: `[RECOMMENDATION]`, `[MODE_SWITCH]`, `[MISCONCEPTION_TYPE]`

## Supabase 접근 패턴

```typescript
// 클라이언트 (RLS 보호)
import { createSupabaseClient } from '@/lib/supabase/client';

// 서버 (Service Role)
import { createSupabaseAdmin } from '@/lib/supabase/admin';
```

- 모든 쿼리에 `.select()` 명시
- `?.data` null 체크 필수
- 에러: `if (error) throw new Error(error.message)`
