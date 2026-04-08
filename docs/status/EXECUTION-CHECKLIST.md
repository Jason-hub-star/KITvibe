# Execution Checklist

> 최종 업데이트: 2026-04-08
> 원칙: 각 페이즈는 `자기리뷰 -> SSOT 대조 -> 검증 -> 커밋` 순서로 진행한다.

## 공통 게이트

- [x] SSOT(`overview.md`) 기준 범위 잠금 확인
- [x] 원격 DB 실스키마 확인
- [x] 구현 전 잠금 문서 작성
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
- [ ] commit

자기리뷰:

- 모바일 전송 버튼이 `44x44` 최소 터치 영역 기준보다 작던 점을 발견했고, 커밋 전에 즉시 보정함
- 교사 업로드/대시보드 제목은 단계형 폰트 크기로 바꿔 모바일 잘림 위험을 낮춤
- 학생 채팅은 실제 모바일 브라우저에서 마지막 메시지 안전영역만 한 번 더 확인 필요

## Phase 1. 구현 잠금 + 원격 스키마 감사

- [x] 실제 원격 public 테이블 확인
- [x] 실제 enum / RLS / bucket 확인
- [x] 스키마 드리프트(`misconception_type`, `sessions`) 확인
- [x] 구현 잠금 문서화
- [ ] self-review 기록
- [ ] 검증
- [ ] commit

## Phase 2. Migration 0

- [ ] `ai_responses.misconception_type` 원격 정합성 반영
- [ ] 반영 후 SQL 재검증
- [ ] self-review 기록
- [ ] 검증
- [ ] commit

## Phase 3. 세션 모델 도입

- [ ] `sessions` 테이블 추가
- [ ] `student_questions.session_id` 추가
- [ ] 타입 / SSOT / 상태 문서 동기화
- [ ] self-review 기록
- [ ] 검증
- [ ] commit

## Phase 4. 학생 이미지 질문

- [ ] `question-images` bucket 추가
- [ ] 업로드 API 추가
- [ ] 학생 질문 UI 연결
- [ ] self-review 기록
- [ ] 검증
- [ ] commit

## Phase 5. 적응형 모드

- [ ] `[ANSWER_CHECK]` 태그 계약 반영
- [ ] `consecutive_wrong` 상태 반영
- [ ] 3회 오답 자동 전환 / Guide-Me 복귀 구현
- [ ] self-review 기록
- [ ] 검증
- [ ] commit

## Phase 6. 미니퀴즈 + P-005 요약

- [ ] 세션당 1문항 미니퀴즈 구현
- [ ] 세션 summary 생성 / 저장
- [ ] `/api/sessions/[id]/summary` 구현
- [ ] `/student/summary` 구현
- [ ] self-review 기록
- [ ] 검증
- [ ] commit
