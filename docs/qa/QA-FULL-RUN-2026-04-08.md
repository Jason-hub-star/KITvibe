# QA Full Run — 2026-04-08

> 실행 일시: 2026-04-08
> 환경: `http://localhost:3000`, `.env.local`, 원격 Supabase 연결
> 방식: 실제 브라우저 자동화로 교사 업로드 → 학생 질문 → 미니퀴즈 → 세션 요약 → 교사 대시보드까지 순차 검증
> 최신 결과: 2차 재완주 `PASS`

## 사용 테스트 데이터

- 수업 자료: `test-data/quadratic-e2e.md`
- 학생 질문 이미지: `test-data/tc05-screenshot.png`
- 초기 실패 러닝: `완주 테스트 310423`
- 최신 PASS 러닝: `완주 테스트 R1 1775630411556`
- 최신 PASS lesson_id: `b9cab0ff-df8b-4d76-92a3-343245edf890`
- 최신 PASS session_id: `b0a9e3a1-c37b-49f1-9861-8de75da438e8`

## 요약

- `PASS` 랜딩에서 교사/학생 역할 선택
- `PASS` 교사 업로드 후 lesson 생성
- `PASS` 학생 질문 저장 및 AI 응답 생성
- `PASS` `student_questions.session_id` 전건 연결
- `PASS` `sessions.current_step = 4` 도달
- `PASS` 미니퀴즈 생성 / 채점 / `/student/summary` 진입
- `PASS` 교사 대시보드 API 집계

## 최신 재완주 결과

### 1. 랜딩 → 교사 업로드

- 결과: `PASS`
- 확인 내용:
  - 역할 선택 후 `/teacher/upload` 진입 성공
  - `quadratic-e2e.md` 업로드 후 `지식베이스 생성 완료` Alert 확인
  - 생성 스크린샷: `test-data/full-run-upload-pass.png`

### 2. 학생 질문 → 4단계 도달

- 결과: `PASS`
- 확인 내용:
  - 이미지 포함 첫 질문 저장 성공
  - 후속 답변 5회 내 `4/4단계` 도달
  - 헤더 최종 상태: `완주 테스트 R1 1775630411556 / 4/4단계`

### 3. 세션 연결 / 미니퀴즈 / 요약

- 결과: `PASS`
- DB 확인:
  - `sessions.current_step = 4`
  - `sessions.quiz_question is not null`
  - `sessions.summary_text is not null`
  - `student_questions` 6건 모두 동일 `session_id = b0a9e3a1-c37b-49f1-9861-8de75da438e8`
- UI 확인:
  - `미니퀴즈 시작` 버튼 노출
  - 채점 후 `세션 요약 보기` 링크 노출
  - `/student/summary?session=...` 진입 성공
  - 요약 스크린샷: `test-data/full-run-summary-pass.png`

### 4. 교사 대시보드 집계

- 결과: `PASS`
- API 확인:
  - `GET /api/lessons/b9cab0ff-df8b-4d76-92a3-343245edf890/dashboard`
  - `totalQuestions = 6`
  - `activeStudents = 1`
  - `recoveryRate = 44`

## 초기 실패 러닝 기록

### 1. 랜딩 → 교사 업로드

- 결과: `PASS`
- 확인 내용:
  - 역할 선택 후 `/teacher/upload` 진입 성공
  - 제목/주제/파일 입력 후 `지식베이스 생성 완료` Alert 확인
  - lesson 생성 확인

### 2. 교사 업로드 → 학생 질문 진입

- 결과: `PASS`
- 확인 내용:
  - 학생 역할 선택 후 `/student/ask` 진입 성공
  - 생성한 수업 카드 표시 확인
  - 수업 선택 후 `/student/ask?lesson=...` 진입 성공

### 3. 학생 질문 + AI 응답

- 결과: `PASS`
- 확인 내용:
  - 이미지 첨부 + 텍스트 질문 전송 성공
  - `student_questions` 저장 확인
  - `ai_responses` 저장 확인
  - RAG 기반 질문 응답 생성 확인

### 4. 세션 연결

- 결과: `FAIL`
- 실제 확인:
  - `sessions` 행은 생성됨
  - 하지만 같은 러닝에서 저장된 `student_questions.session_id`는 모두 `null`
  - 따라서 세션 transcript, quiz, summary의 데이터 소스가 끊김

- 근거:
  - `sessions`: `595ea624-8fc4-4815-8327-e384deab7d80`
  - `student_questions`: `2e7a18be-b7e0-4fa3-8c31-8c4e226c17ef`, `03c8a966-99a6-446b-ab32-20c4c68f6759`, `bd38c93b-d18d-4761-b49b-5cac46ab3528`, `8e9d7990-ebef-4386-bc7a-4d3a68d934c1`, `f6620427-ca83-4d2e-85e8-cdf19d0b591d`
  - 위 질문들의 `session_id`는 모두 `null`

### 5. 질문 사다리 진행 / 미니퀴즈 / 세션 요약

- 결과: `FAIL`
- 실제 확인:
  - 학생과 AI가 5턴 이상 대화했지만 헤더 진행 상태가 `1/4`, `2/4` 사이에서 흔들림
  - 원격 `sessions.current_step`는 끝까지 `1`에 머무름
  - `미니퀴즈 시작` 버튼이 나타나지 않음
  - 따라서 `/student/summary` 진입까지 이어지지 못함

### 6. 교사 대시보드 집계

- 결과: `PASS`
- 확인 내용:
  - `GET /api/lessons/e34701ec-8871-41cf-9ed8-ce5a4f159eaa/dashboard` 성공
  - 집계 결과:
    - `totalQuestions = 5`
    - `activeStudents = 1`
  - `recoveryRate = 40`
  - 질문 로그와 오개념 heatmap 데이터 생성 확인

## 수정 후 자기리뷰 메모

1. `useQuestionChat`에서 `sessionIdRef + sessionPromiseRef + stateRef` 구조로 세션 race와 stale closure를 함께 제거함
2. 태그가 누락돼도 `parseAiTags` fallback으로 `ANSWER_CHECK`를 보수적으로 추정하도록 보강함
3. 재완주 중 이미지 질문 업로드가 끝나기 전 입력창이 다시 열리는 재진입 버그를 추가로 발견했고, `isStreaming`을 업로드 시작 시점에 먼저 올려 순서 역전을 막음
4. 기존 `test-data/quadratic-equations.pdf`는 업로드 시 서버 로그에 `bad XRef entry`가 남아, 완주 테스트는 계속 Markdown fixture로 유지하는 것이 안전함
