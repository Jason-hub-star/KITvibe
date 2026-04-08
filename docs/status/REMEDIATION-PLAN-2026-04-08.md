# Remediation Plan — 2026-04-08

> 대상: 실사용 완주 테스트에서 확인된 `session_id 미연결`, `current_step 비누적`, `미니퀴즈/P-005 진입 실패`
> 기준 문서: `overview.md`, `docs/status/IMPLEMENTATION-LOCK.md`, `docs/qa/QA-FULL-RUN-2026-04-08.md`

## 상태 업데이트

- `2026-04-08 2차 재완주 PASS`
- 해결된 항목:
  - `student_questions.session_id` 전건 연결
  - `sessions.current_step = 4` 누적
  - `미니퀴즈 시작` 노출 및 채점
  - `/student/summary` 진입
- 추가 자기리뷰 수정:
  - 이미지 업로드 중 `isStreaming` 선반영으로 재진입/질문 순서 역전 방지

## 문제 요약

실사용 완주 테스트 결과, 학생 채팅은 응답까지 생성되지만 세션 기반 후속 흐름이 끊겨 있다.

핵심 실패는 2개다.

1. 질문 저장 시 `student_questions.session_id`가 `null`로 들어간다.
2. 세션 상태 누적이 안정적으로 반영되지 않아 `sessions.current_step`가 1에 머문다.

그 결과로 아래 기능이 연쇄적으로 막힌다.

- `getSessionTranscript(sessionId)` 기반 미니퀴즈 생성
- `sessions.quiz_question` 저장
- `/api/sessions/[id]/summary`
- `/student/summary`

## 확인된 근거

### 1. 세션 race

- `useQuestionChat`는 mount 후 비동기로 세션을 bootstrap한다.
- 하지만 `sendMessage`는 현재 closure의 `state.sessionId`를 그대로 사용한다.
- 실제 완주 러닝에서 `sessions` 행은 생성됐지만, 같은 러닝의 `student_questions.session_id`는 모두 `null`이었다.

관련 파일:

- [useQuestionChat.ts](/Users/family/jason/vibecoding/src/hooks/useQuestionChat.ts)
- [questions route](/Users/family/jason/vibecoding/src/app/api/questions/route.ts)

### 2. 단계 누적 불안정

- `deriveNextChatState`는 `parsed.recommendation`, `parsed.answerCheck`, `prev.mode`에 강하게 의존한다.
- 현재 구현은 응답 완료 시점의 `state` closure를 기준으로 다음 상태를 계산한다.
- 연속 대화에서 `1/4 -> 2/4 -> 1/4 -> 2/4`처럼 흔들렸고, 원격 `sessions.current_step`도 1에 머물렀다.

관련 파일:

- [useQuestionChat.ts](/Users/family/jason/vibecoding/src/hooks/useQuestionChat.ts)
- [parseAiTags.ts](/Users/family/jason/vibecoding/src/utils/parseAiTags.ts)
- [prompts index](/Users/family/jason/vibecoding/src/lib/prompts/index.ts)

## 수정 원칙

1. 세션 연결을 먼저 고친다.
2. 그 다음 단계 누적 로직을 고친다.
3. 미니퀴즈/요약은 기존 구조를 유지하고, 상위 두 문제 해결 후 재검증한다.
4. SSOT 범위는 늘리지 않는다.
5. 하드코딩 우회 없이 현재 세션 모델을 살린다.

## 해결 페이즈

### Phase R1. 세션 연결 race 제거

목표:

- 첫 질문부터 `student_questions.session_id`가 반드시 채워지게 한다.

수정 범위:

- [useQuestionChat.ts](/Users/family/jason/vibecoding/src/hooks/useQuestionChat.ts)
- 필요 시 [sessions route](/Users/family/jason/vibecoding/src/app/api/sessions/route.ts)

수정 방향:

1. `sessionIdRef`를 두고 bootstrap 성공 시 즉시 ref와 state를 함께 갱신한다.
2. `sendMessage`는 React state snapshot 대신 `sessionIdRef.current`를 우선 사용한다.
3. `sessionId`가 아직 없으면:
   - 질문 전송을 막고 짧게 대기 후 재시도하거나
   - 전송 전에 세션 bootstrap을 강제로 한 번 더 await한다.
4. 질문 저장 성공 응답에서 `session_id`가 `null`이면 즉시 실패로 취급해 다음 단계로 가지 않는다.

합격 기준:

- 첫 질문부터 `student_questions.session_id`가 `null`이 아니다.
- 같은 러닝의 모든 질문이 동일 `session_id`를 가진다.

### Phase R2. 단계 누적 계산 안정화

목표:

- 학생 대화가 실제로 `1/4 -> 2/4 -> 3/4 -> 4/4` 또는 설계된 예외 전이만 따르도록 고정한다.

수정 범위:

- [useQuestionChat.ts](/Users/family/jason/vibecoding/src/hooks/useQuestionChat.ts)
- 필요 시 [prompts index](/Users/family/jason/vibecoding/src/lib/prompts/index.ts)
- 필요 시 [parseAiTags.ts](/Users/family/jason/vibecoding/src/utils/parseAiTags.ts)

수정 방향:

1. `deriveNextChatState` 입력을 `state` closure가 아니라 최신 committed state로 바꾼다.
2. `setState(prev => ...)` 내부에서 다음 상태를 계산해 stale snapshot을 없앤다.
3. `step` 증가 규칙을 명시적으로 고정한다.
   - `grill-me`에서 `answerCheck !== 'wrong'`일 때만 `+1`
   - `guide-me -> grill-me` 복귀 시 `correct`면 `+1`
   - 절대 감소하지 않음
4. UI 표시 step과 서버 동기화 step이 같은 source of truth를 바라보도록 정리한다.

합격 기준:

- 정상 답변 시 `current_step`이 감소하지 않는다.
- 원격 `sessions.current_step`와 헤더 표시 step이 일치한다.
- 4단계 도달 시점이 재현 가능하다.

### Phase R3. 미니퀴즈 게이트 복구

목표:

- 4단계 도달 후 `미니퀴즈 시작` 버튼이 확실히 노출된다.

수정 범위:

- [QuestionChat.tsx](/Users/family/jason/vibecoding/src/components/student/QuestionChat.tsx)
- [quiz route](/Users/family/jason/vibecoding/src/app/api/sessions/[id]/quiz/route.ts)

수정 방향:

1. 미니퀴즈 노출 조건을 `state.currentStep >= 4 && state.sessionId` 그대로 유지하되, 앞선 단계 누적 문제를 해소한 후 QA한다.
2. quiz route 호출 전 `session transcript`가 비어 있으면 명시적 에러를 반환한다.
3. 세션에 이미 quiz가 있으면 재생성 대신 재사용하는 현재 정책은 유지한다.

합격 기준:

- 4단계 후 `미니퀴즈 시작` 버튼 노출
- 생성 후 `sessions.quiz_question` 저장
- 채점 후 `sessions.quiz_passed` 저장

### Phase R4. P-005 요약 복구

목표:

- 미니퀴즈 이후 `/student/summary`까지 실제로 진입 가능하게 한다.

수정 범위:

- [summary route](/Users/family/jason/vibecoding/src/app/api/sessions/[id]/summary/route.ts)
- [summary page](/Users/family/jason/vibecoding/src/app/student/summary/page.tsx)
- [SessionSummaryView.tsx](/Users/family/jason/vibecoding/src/components/student/SessionSummaryView.tsx)

수정 방향:

1. `getSessionTranscript(sessionId)`가 실제 질문들을 가져오는지 재검증한다.
2. 요약 생성 전 캐시 miss일 때만 AI 생성하는 현재 정책은 유지한다.
3. `summary_text`, `next_recommendation`, `summary_concepts` 저장까지 한 번에 성공해야 한다.

합격 기준:

- `세션 요약 보기` 링크 노출
- `/student/summary?session=...` 진입 성공
- 원격 `sessions.summary_text` 비어있지 않음

### Phase R5. 재완주 QA

목표:

- 같은 시나리오로 완주 PASS를 다시 확보한다.

실행 시나리오:

1. 교사 역할 선택
2. Markdown 수업자료 업로드
3. 학생 역할 선택
4. 이미지 포함 질문 1회
5. 후속 답변 4회
6. 미니퀴즈 생성/채점
7. P-005 요약 진입
8. 교사 대시보드 확인

합격 기준:

- `PASS` 업로드
- `PASS` 질문 저장
- `PASS` `student_questions.session_id` 연결
- `PASS` `sessions.current_step = 4`
- `PASS` 미니퀴즈 노출
- `PASS` `/student/summary`
- `PASS` 교사 대시보드 집계

## 파일별 예상 수정 책임

### 1순위

- [useQuestionChat.ts](/Users/family/jason/vibecoding/src/hooks/useQuestionChat.ts)
  - 세션 ref
  - stale closure 제거
  - step 누적 규칙 고정

### 2순위

- [QuestionChat.tsx](/Users/family/jason/vibecoding/src/components/student/QuestionChat.tsx)
  - 미니퀴즈 노출 QA
- [questions route](/Users/family/jason/vibecoding/src/app/api/questions/route.ts)
  - `session_id` 유효성 가드
- [quiz route](/Users/family/jason/vibecoding/src/app/api/sessions/[id]/quiz/route.ts)
  - transcript 비어 있음 방어

### 3순위

- [summary route](/Users/family/jason/vibecoding/src/app/api/sessions/[id]/summary/route.ts)
  - 세션 기반 요약 재검증
- [QA full run](/Users/family/jason/vibecoding/docs/qa/QA-FULL-RUN-2026-04-08.md)
  - 재완주 결과 업데이트

## 비범위

- 권한 체계 재설계
- 새로운 세션 테이블 추가
- OCR 추가
- 미니퀴즈 형식 확장
- Quick-Me 자동 전환 도입

## 바로 다음 액션

1. 완주 PASS 결과를 기준선으로 유지
2. 남은 lint warning 3건은 기능 페이즈와 분리해 정리
3. 모바일 실기기 QA를 한 번 더 수행
