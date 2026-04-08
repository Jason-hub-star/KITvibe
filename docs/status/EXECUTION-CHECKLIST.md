# Execution Checklist

> 최종 업데이트: 2026-04-08
> 원칙: 각 페이즈는 `자기리뷰 -> SSOT 대조 -> 검증 -> 커밋` 순서로 진행한다.

## 공통 게이트

- [x] SSOT(`overview.md`) 기준 범위 잠금 확인
- [x] 원격 DB 실스키마 확인
- [x] 구현 전 잠금 문서 작성
- [x] Phase 0 self-review 기록
- [x] Phase 0 검증
- [x] Phase 0 git commit
- [ ] 각 페이즈 종료 시 self-review 기록
- [ ] 각 페이즈 종료 시 `npm run lint && npm run typecheck && npm run build`
- [ ] 각 페이즈 종료 시 git commit

## Phase 0. 반응형 기준 정리 + 모바일 보정

- [x] 반응형 기준 문서 추가
- [x] 스타일/스펙 문서 연결
- [x] 교사 페이지 모바일 제목 잘림 보정
- [x] 학생 입력창 모바일 배치 보정
- [x] 모바일 전송 버튼 최소 터치 영역 44x44 보정
- [x] self-review 기록
- [x] 검증
- [x] commit

자기리뷰:

- 모바일 전송 버튼이 `44x44` 최소 터치 영역 기준보다 작던 점을 발견했고, 커밋 전에 즉시 보정함
- 교사 업로드/대시보드 제목은 단계형 폰트 크기로 바꿔 모바일 잘림 위험을 낮춤
- 학생 채팅은 실제 모바일 브라우저에서 마지막 메시지 안전영역만 한 번 더 확인 필요

## Phase 1. 구현 잠금 + 원격 스키마 감사

- [x] 실제 원격 public 테이블 확인
- [x] 실제 enum / RLS / bucket 확인
- [x] 스키마 드리프트(`misconception_type`, `sessions`) 확인
- [x] 구현 잠금 문서화
- [x] self-review 기록
- [x] 검증
- [x] commit

## Phase 2. Migration 0

- [x] `ai_responses.misconception_type` 원격 정합성 반영
- [x] 반영 후 SQL 재검증
- [x] self-review 기록
- [x] 검증
- [x] commit

## Phase 3. 세션 모델 도입

- [x] `sessions` 테이블 추가
- [x] `student_questions.session_id` 추가
- [x] 타입 / SSOT / 상태 문서 동기화
- [x] self-review 기록
- [x] 검증
- [x] commit

## Phase 4. 학생 이미지 질문

- [x] `question-images` bucket 추가
- [x] 업로드 API 추가
- [x] 학생 질문 UI 연결
- [x] self-review 기록
- [x] 검증
- [x] commit

## Phase 5. 적응형 모드

- [x] `[ANSWER_CHECK]` 태그 계약 반영
- [x] `consecutive_wrong` 상태 반영
- [x] 3회 오답 자동 전환 / Guide-Me 복귀 구현
- [x] self-review 기록
- [x] 검증
- [ ] commit

## Phase 6. 미니퀴즈 + P-005 요약

- [ ] 세션당 1문항 미니퀴즈 구현
- [ ] 세션 summary 생성 / 저장
- [ ] `/api/sessions/[id]/summary` 구현
- [ ] `/student/summary` 구현
- [ ] self-review 기록
- [ ] 검증
- [ ] commit

## Self-review Log

### Phase 1

- `overview.md`와 실제 원격 DB를 대조해 `P-005`, 이미지 질문, 3오답 전환을 바로 구현하면 다시 뜯게 되는 구조임을 확인
- 원격 DB에는 `sessions`가 없고 `ai_responses.misconception_type`도 없어, 문서와 코드 가정이 실제 스키마보다 앞서 나간 상태임을 확인
- 원격 RLS는 활성화돼 있지만 현재 확인된 정책은 `anon SELECT`만이라, 로컬 migration 문구와 실제 원격 상태가 다름을 기록

### Phase 2

- 기존 migration 파일은 있었지만 원격에는 실제 적용되지 않은 상태였고, 이 불일치가 API 저장 경로를 흔들고 있었음을 확인
- 새 migration 파일을 늘리기보다 기존 migration을 `IF NOT EXISTS`로 보정해 재실행 안전성을 확보함
- transaction pooler SQL과 `rest/v1` 응답 둘 다에서 `misconception_type`가 노출되는지 확인해 앱 경로 기준 정합성까지 닫음

### Phase 3

- 세션을 붙이기 전 `useQuestionChat`가 `studentId`를 초기값으로만 보유한다는 점을 발견했고, hydration 이후 값이 늦게 들어와도 동기화되도록 보정함
- 세션 생성 실패 시 재시도가 막히는 ref 잠금 이슈를 커밋 전에 수정함
- 로컬 migration, 원격 SQL, OpenAPI 노출, Next.js build 라우트에서 모두 `sessions` 경로가 보이는지 확인해 FE/BE/DB 정합성을 맞춤

### Phase 4

- 학생 이미지 질문이 “Storage에만 저장되고 AI는 무시하는 상태”가 되지 않도록, 업로드 경로와 멀티모달 응답 경로를 함께 연결함
- 이미지 업로드 예외가 `try/catch` 밖으로 빠지는 흐름을 발견하고 커밋 전에 정리함
- private bucket 저장과 AI 입력 전달을 분리해, DB에는 storage URL을 남기고 AI에는 client-side data URL을 전달하는 구조로 잠금
- 예시 질문 버튼 시그니처 변경이 Phase 4 본커밋에서 누락된 것을 발견했고, 바로 후속 fix commit으로 정리함

### Phase 5

- `Quick-Me`는 SSOT상 수동 전환만 허용되므로, 기존 프롬프트의 자동 `quick-me` 전환 규칙을 제거함
- `ANSWER_CHECK`가 없으면 3회 오답 판정이 성립하지 않아서, 프롬프트와 파서와 클라이언트 상태를 한 번에 연결함
- 세션 상태(`current_mode`, `current_step`, `consecutive_wrong`)를 응답 후마다 서버에 동기화해, 이후 요약 페이지의 기반 데이터를 먼저 고정함
