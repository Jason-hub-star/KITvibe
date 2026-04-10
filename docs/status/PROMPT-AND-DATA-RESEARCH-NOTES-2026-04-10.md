# Prompt & Data Research Notes — 2026-04-10

## 현재 프롬프트/응답 구조 요약

- 학생 질문 저장: `src/app/api/questions/route.ts`
  - 텍스트 질문이면 `classifyIntent()`로 `concept|hint|review|similar` 분류
  - DB에는 `student_questions`로 저장
- AI 응답 생성: `src/app/api/questions/[id]/respond/route.ts`
  - `mode`, `current_step`, `consecutive_wrong`, `messages`를 받아 `generateTutoringResponse()` 호출
  - Quick-Me 긴급 표현이면 `lesson_quick_answers`를 먼저 조회하고, hit 시 캐시 응답을 우선 반환
  - 스트리밍 완료 후 `parseAiResponse()`로 태그를 파싱하고 `ai_responses`에 저장
- 시스템 프롬프트: `src/lib/prompts/index.ts`
  - `GRILL_ME_TUTOR`, `GUIDE_ME_TUTOR`, `QUICK_ME_TUTOR` 3개 템플릿으로 분리
- 상태 전이: `src/hooks/useQuestionChat.ts`
  - `deriveNextChatState()`가 `answerCheck`, `modeSwitch`, `consecutiveWrong`를 기준으로 단계와 모드를 갱신
  - `resolveRequestedMode()`가 긴급 표현을 감지하면 Quick-Me 자동 전환

## Quick-Me가 계속 묻는 현상에 대한 현재 가설

1. 텍스트만으로 Quick-Me가 자동 진입하지 않아 학생 긴급 표현이 UI 상태에 묻혔다.
2. 단일 프롬프트 안에 세 모드 지시가 함께 있어서 약한 모델일수록 현재 모드를 놓칠 가능성이 있었다.
3. 이전 assistant의 질문형 히스토리가 그대로 모델 입력에 섞여, Quick 지시를 약화시킬 수 있었다.
4. 현재 RAG는 lesson 전체 텍스트를 그대로 넣어 prompt를 길게 만든다.
5. 캐시가 없으면 약한 모델에서 Quick 답변 포맷이 흔들릴 수 있다.

## 2026-04-10 구현 반영

- Quick-Me는 `답만`, `빨리`, `시간 없어`, `바로 풀어줘` 입력 시 자동 전환
- `QUICK_ME_TUTOR`는 별도 프롬프트로 분리했고, 질문 금지와 최종 답 공개를 명시
- `lesson_quick_answers` 테이블을 추가해 lesson별 빠른답변 캐시를 저장
- `lesson_context_caches` 테이블을 추가해 lesson별 핵심 요약/개념/실수 포인트/대표 템플릿을 저장
- 캐시 hit 시 모델 호출 전 캐시 응답을 우선 반환하고 usage_count를 누적
- 교사 대시보드에는 `수업 자료 기록` 카드와 `Quick-Me 사용/비율`을 노출
- Quick-Me 모델 입력은 최신 user 메시지만 전달해, 이전 질문형 히스토리가 빠른답변 톤을 흐리지 않도록 줄였다
- MVP fallback RAG도 질문 토큰과 겹치는 자료를 우선 선택해, lesson 전체 context stuffing을 조금 더 집중형으로 줄였다
- retrieveContext는 이제 lesson context cache를 항상 prefix로 붙이고, 그 뒤에 관련 자료 본문을 이어 붙인다
- Quick-Me 본문은 `핵심 개념 / 풀이 / 최종 답 / 실수 포인트` 라벨 고정, Grill-Me는 `질문 / 생각 포인트` 라벨 고정으로 강화했다

## 2026-04-10 잠금 결정 반영

- 레거시 테스트 데이터는 전부 삭제
- 실제형 데모 수업은 5개
- 교사는 2명, 학생은 10명
- naming tone은 `김민수 선생님 / 2학년 1반` 같은 현실형
- 수업 자료는 PDF 위주, Markdown도 허용
- 대시보드 PDF 기록은 `파일명 + 업로드 시각 + 자료 수`
- 학생의 긴급 표현(`답만 줘`, `빨리 풀어줘`, `바로 풀어줘`)은 Quick-Me 자동 전환 허용
- Quick-Me 자동 전환 키워드는 `답만`, `빨리`, `시간 없어`, `바로 풀어줘`
- Quick-Me는 최종 답을 항상 바로 공개
- 교사는 Quick-Me 사용/자동 전환 비율을 `AI 보충 분석` 카드 내부에서 볼 수 있어야 함
- Gemma 대비 캐시는 `자주 나오는 질문-빠른답변 세트`까지 포함
- 빠른답변 캐시는 새 테이블로 추가
- storage cleanup 범위는 `lesson-files`, `question-images` 둘 다 포함
- 리셋 방식은 `DB + Storage 전부 삭제 후 재시드`

## PDF 기록 정책에 대한 현재 판단

- lesson 단위로 "어떤 자료가 연결되어 있는가"는 남기는 편이 좋다.
- 다만 응답마다 어떤 chunk를 썼는지까지 영구 저장하면 제품 기능보다 디버그 로그가 된다.
- 따라서 권장안은:
  - 영구 보관: `file_name`, `uploaded_at`, `material_count`
  - 휘발성 또는 TTL: retrieval trace, debug provenance

## 공식문서 메모

- Supabase Storage metadata만 지우면 실제 object는 남을 수 있으므로 cleanup은 반드시 Storage API로 해야 한다.
  - https://supabase.com/docs/guides/storage/schema/design
- Supabase Storage 비용은 버킷 자산 총량 기준이므로 레거시 test PDF는 실제 object 삭제가 중요하다.
  - https://supabase.com/docs/guides/storage/pricing
- OpenAI Prompt Caching은 공통 prefix를 앞에 둘수록 유리하므로, mode별 프롬프트를 분리하고 variable을 뒤로 두는 것이 캐시 친화적이다.
  - https://developers.openai.com/api/docs/guides/prompt-caching
