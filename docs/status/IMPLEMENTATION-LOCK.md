# Implementation Lock

> 최종 업데이트: 2026-04-08

## 목적

`P-005 결과/요약`, `학생 이미지 질문`, `미니퀴즈/세션 요약 생성`, `3회 오답 자동 전환` 구현 전에
데이터 계약과 구현 순서를 잠근다.

## 잠금 체크리스트

아래 항목은 구현 전에 반드시 고정되어야 하는 결정이다.

| 항목 | 상태 | 잠금 결정 |
|------|------|----------|
| 원격 스키마 정합성 | ✅ LOCKED | `ai_responses.misconception_type`를 먼저 반영 |
| 세션 경계 모델 | ✅ LOCKED | 신규 `sessions` 테이블 도입 |
| 질문-세션 연결 | ✅ LOCKED | `student_questions.session_id` 추가 |
| 학생 이미지 입력 | ✅ LOCKED | 기존 `student_questions.image_url` 재사용 |
| 이미지 업로드 범위 | ✅ LOCKED | 이미지 1장, 5MB, OCR 제외 |
| Storage bucket | ✅ LOCKED | `question-images` 신규 버킷 추가 |
| 3회 오답 판정 신호 | ✅ LOCKED | AI 태그 `[ANSWER_CHECK: correct|partial|wrong]` 도입 |
| 자동 모드 전환 규칙 | ✅ LOCKED | `grill-me -> guide-me`, `guide-me -> grill-me`, `quick-me`는 수동만 |
| 미니퀴즈 범위 | ✅ LOCKED | 세션당 자유응답 1문항 |
| 퀴즈 결과 저장 위치 | ✅ LOCKED | `sessions.quiz_answer`, `sessions.quiz_passed` |
| 세션 요약 저장 위치 | ✅ LOCKED | `sessions.summary_text` 캐시 |
| P-005 라우트 계약 | ✅ LOCKED | `/student/summary`, `/api/sessions/[id]/summary` 유지 |
| 구현 진입 게이트 | ✅ LOCKED | `Migration 0 -> sessions -> image -> mode -> quiz -> summary` 순서 고정 |

## 진행 게이트

다음 단계로 넘어가기 전 충족해야 하는 기준을 고정한다.

### Gate 0. 스키마 정합성

- 원격 `ai_responses.misconception_type` 반영 완료
- REST 또는 SQL로 반영 여부 재검증 완료

### Gate 1. 세션 모델

- `sessions` 생성 완료
- `student_questions.session_id` 추가 완료
- 타입 문서 동기화 완료

### Gate 2. 학생 입력 확장

- `question-images` bucket 생성 완료
- 업로드 API 완료
- 학생 질문 UI에서 `image_url` 전달 완료

### Gate 3. 적응형 모드

- 프롬프트에 `[ANSWER_CHECK]` 출력 규칙 추가
- 파서/클라이언트 상태/DB 동기화 완료
- 3회 오답 자동 전환 QA 완료

### Gate 4. 회복 검증

- 미니퀴즈 생성 완료
- 퀴즈 결과 세션 저장 완료
- 세션 summary 생성 완료

### Gate 5. 결과 화면

- `/api/sessions/[id]/summary` 구현 완료
- `/student/summary` 구현 완료
- 세션 종료 후 진입 흐름 연결 완료

## 원격 DB 확인 기준

- 확인 일시: 2026-04-08
- 확인 경로 1: 원격 Supabase `rest/v1` OpenAPI (`application/openapi+json`)
- 확인 경로 2: transaction pooler `aws-1-ap-northeast-2.pooler.supabase.com:6543`
- 비고:
  - `supabase link --project-ref gxvtgrcqkbdibkyeqyil`는 현재 CLI 계정 권한 부족으로 실패
  - `supabase db dump --linked`는 현재 로컬 Docker 의존성 때문에 실행 불가
  - 대신 transaction pooler 경유 직접 SQL 조회는 성공
- 따라서 아래 내용은 **원격 DB를 SQL로 직접 조회한 결과**를 기준으로 작성

## 원격 public 스키마 스냅샷

### 테이블

- `users`
- `lessons`
- `lesson_materials`
- `student_questions`
- `ai_responses`
- `misconception_summaries`

### RPC

- `match_chunks`
- `rls_auto_enable`

### 확인된 사실

- `sessions` 테이블이 없다
- `session_summaries`, `quiz_attempts` 같은 세션 전용 테이블도 없다
- `student_questions.image_url`는 이미 존재한다
- `ai_responses.response_type` enum에는 이미 `'quiz'`, `'summary'`가 포함돼 있다
- 원격 `ai_responses`에는 아직 `misconception_type` 컬럼이 없다
- 원격 RLS는 6개 테이블 모두 enable 되어 있다
- 원격 public policy는 현재 `anon SELECT`만 확인되며, 로컬 migration에 있는 `anon INSERT` 정책은 보이지 않는다
- 원격 Storage bucket은 현재 `lesson-files`만 존재한다
- 즉, 로컬 타입/문서와 원격 DB 사이에 스키마 드리프트가 1건 존재한다

## 구현 전 잠금 결정

### 1. Migration 0: 원격 스키마 정합성부터 맞춘다

가장 먼저 아래 한 건을 원격에 반영한다.

- `ai_responses.misconception_type smallint null`

이유:

- 현재 `src/types/question.types.ts`와 `src/app/api/questions/[id]/respond/route.ts`는 이 컬럼이 있다고 가정한다
- 실제 원격 DB에는 없어서, 오개념 유형 저장은 현재 실패 가능한 상태다

### 2. 세션 단위를 DB에 도입한다

`P-005 /student/summary`와 `3회 오답 자동 전환`은 현재 6개 테이블만으로는 안정적으로 복원할 수 없다.
따라서 **최소 세션 모델**을 추가한다.

신규 테이블:

- `sessions`

권장 컬럼:

- `id uuid primary key default gen_random_uuid()`
- `lesson_id uuid not null references lessons(id) on delete cascade`
- `student_id uuid not null references users(id) on delete cascade`
- `current_mode text not null default 'grill-me'`
- `current_step integer not null default 1`
- `consecutive_wrong integer not null default 0`
- `quiz_question text null`
- `quiz_answer text null`
- `quiz_passed boolean null`
- `summary_text text null`
- `next_recommendation text null`
- `started_at timestamptz not null default now()`
- `ended_at timestamptz null`

추가 컬럼:

- `student_questions.session_id uuid null references sessions(id) on delete set null`

잠금 이유:

- 같은 학생이 같은 수업에서 여러 번 질문하면 현재 구조만으로는 "한 번의 학습 세션" 경계를 안정적으로 구분할 수 없다
- `ai_responses`는 `question_id` 기반이라 세션 요약을 직접 매달기엔 모델이 맞지 않는다
- `summary_text`와 `quiz_passed`를 `sessions`에 두면 `P-005`와 교사 회복률 집계가 단순해진다

### 3. 학생 이미지 질문은 기존 `image_url`을 재사용한다

학생 질문 이미지 지원은 신규 질문 테이블 없이 처리한다.

잠금 사항:

- DB는 기존 `student_questions.image_url`만 사용
- 새 Storage bucket `question-images` 추가
- 업로드는 서버 API에서만 수행
- MVP는 이미지 1장만 허용
- 허용 형식: `image/*`
- 크기 제한: 5MB
- MVP에서는 OCR을 넣지 않는다

잠금 이유:

- SSOT 입력 범위가 이미 `텍스트 + 이미지 1장`으로 고정돼 있다
- 현재 스키마가 이를 이미 수용한다
- OCR까지 동시에 넣으면 범위가 커지고, RAG/튜터링 품질 검증도 흐려진다

### 4. 3회 오답 자동 전환은 AI 태그 계약을 먼저 잠근다

현재는 `consecutiveWrong` 상태가 증가하지 않고, 오답 판정 신호도 없다.
따라서 구현 전에 응답 태그를 확장한다.

신규 태그 계약:

- `[ANSWER_CHECK: correct]`
- `[ANSWER_CHECK: partial]`
- `[ANSWER_CHECK: wrong]`

카운트 규칙:

- `wrong` → `consecutive_wrong + 1`
- `partial` → 유지
- `correct` → `consecutive_wrong = 0`

모드 전환 규칙:

- 기본값은 `grill-me`
- `consecutive_wrong >= 3` 이고 현재 모드가 `grill-me`면 `guide-me`로 자동 전환
- `guide-me` 상태에서 `correct` 1회가 나오면 `grill-me`로 복귀
- `quick-me`는 자동 전환하지 않고 학생 수동 선택만 허용

잠금 이유:

- 세션 상태와 프롬프트 태그가 동시에 맞지 않으면 자동 전환은 재현 불가능하다
- 이 규칙이 고정돼야 `useQuestionChat`, 응답 파서, 프롬프트, DB 업데이트가 한 방향으로 맞는다

### 5. 미니퀴즈는 1문항만, 결과는 세션에 남긴다

잠금 사항:

- 미니퀴즈는 세션당 1문항
- 객관식 확장 없이 자유응답 1문항으로 시작
- 퀴즈 생성 시점:
  - `grill-me`에서 4단계 완료 후
  - 또는 `guide-me` 설명 완료 후
- 퀴즈 질문 자체는 `ai_responses.response_type = 'quiz'`로 저장
- 학생 답변과 통과 여부는 `sessions.quiz_answer`, `sessions.quiz_passed`에 저장

잠금 이유:

- `ai_responses`의 기존 enum을 활용하면서도, 세션 결과 카드에는 별도 집계 없이 바로 접근할 수 있다
- 세션당 1문항으로 제한해야 MVP 범위와 복구율 지표가 단순해진다

### 6. P-005 요약은 세션 기반 캐시형으로 구현한다

잠금 사항:

- 라우트는 SSOT대로 `/student/summary` 유지
- API도 SSOT대로 `/api/sessions/[id]/summary` 유지
- 요약은 세션 종료 시 1회 생성 후 `sessions.summary_text`에 저장
- 이후 조회는 재생성보다 캐시 우선

요약 데이터 소스:

- `sessions`
- `student_questions` (`session_id` 기준)
- `ai_responses` (`question_id` 조인)

잠금 이유:

- 세션 단위가 먼저 있어야 결과 페이지의 ID와 데이터 소스가 명확해진다
- 매 조회마다 AI 요약을 다시 만들면 비용과 일관성 문제가 생긴다

## 구현 순서 잠금

1. 원격 DB 정합성 수정
   - `misconception_type` 마이그레이션 반영
   - 반영 후 REST/OpenAPI로 재검증
2. 세션 스키마 추가
   - `sessions` 테이블
   - `student_questions.session_id`
   - 관련 타입 문서 동기화
3. 세션 시작/종료 API 추가
   - 학생 질문 화면 진입 시 세션 생성
   - 종료 시 `ended_at` 확정
4. 학생 이미지 질문 업로드
   - `question-images` 버킷
   - 업로드 API
   - `student_questions.image_url` 연결
5. 자동 모드 전환 계약 반영
   - 프롬프트에 `[ANSWER_CHECK]`
   - `parseAiResponse` 확장
   - `useQuestionChat` 카운트/전환 반영
   - `sessions` 상태 동기화
6. 미니퀴즈 생성/채점
   - `response_type = 'quiz'`
   - 세션 결과 저장
7. P-005 결과/요약 페이지
   - `/api/sessions/[id]/summary`
   - `/student/summary`
   - 캐시된 `summary_text` 렌더링

## 구현 중 금지

- `sessions` 없이 요약 페이지부터 붙이지 않기
- `question_id` 마지막 1건에 요약을 억지로 매달지 않기
- 학생 이미지 질문에 OCR까지 같이 넣지 않기
- `quick-me`를 3회 오답 자동 전환 경로에 포함하지 않기
- 원격 `misconception_type` 반영 전에 관련 저장 로직부터 확장하지 않기
