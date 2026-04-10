# Data & Prompt Phase Checklist — 2026-04-10

> 목적: 실제형 데모 데이터 교체, 레거시 목업 정리, 교사용 PDF 기록 정책, Quick-Me/로컬 LLM 대응 프롬프트 보강을 한 번에 진행하기 전에 범위와 페이즈를 잠근다.

## 목표

- [ ] 레거시 QA/threshold/full-run 데이터와 스토리지 잔재를 정리한다.
- [ ] 실제 교실에서 등록한 것처럼 보이는 수업/학생/질문 데이터를 다시 심는다.
- [ ] 교사 대시보드에 남길 PDF 기록 범위를 잠근다.
- [ ] 현재 OpenAI 응답 프롬프트 로직을 설명 가능한 수준으로 분해한다.
- [ ] Quick-Me가 "답을 달라"는 요청에서도 계속 묻는 문제를 재현 가능 상태로 정리한다.
- [ ] 추후 Gemma 4 로컬 LLM 전환 시 성능 하락을 상쇄할 프롬프트/캐시 전략을 선행 설계한다.

## 2026-04-10 결정 잠금

- [x] 레거시 테스트 데이터는 전부 삭제한다.
- [x] 실제형 목업 수업은 5개로 간다.
- [x] naming tone은 현실적인 한국 학교 톤으로 간다.
  - [x] 기준 예시: `김민수 선생님 / 2학년 1반`
- [x] 교사는 2명, 학생은 10명으로 잠근다.
- [x] 데모 수업 5개는 아래로 잠근다.
  - [x] 인수분해
  - [x] 이차방정식
  - [x] 일차함수
  - [x] 연립방정식
  - [x] 도형의 닮음
- [x] 수업 자료 형식은 `PDF 위주`, `Markdown도 허용`으로 잠근다.
- [x] 교사 대시보드 PDF 기록은 `파일명 + 업로드 시각 + 자료 수`로 잠근다.
- [x] 학생이 `답만 줘`, `빨리 풀어줘`, `바로 풀어줘` 같은 긴급 표현을 쓰면 Quick-Me 자동 전환을 허용한다.
- [x] Quick-Me 자동 전환 트리거 문구는 아래로 잠근다.
  - [x] `답만`
  - [x] `빨리`
  - [x] `시간 없어`
  - [x] `바로 풀어줘`
- [x] Quick-Me에서는 최종 답을 항상 바로 공개한다.
- [x] 교사는 Quick-Me 선택/자동 전환 비율을 볼 수 있어야 한다.
- [x] Quick-Me 사용 비율은 `AI 보충 분석` 카드 내부에 노출한다.
- [x] Gemma 대비 캐시는 `자주 나오는 질문-빠른답변 세트`까지 포함한다.
- [x] 빠른답변 캐시는 새 테이블로 추가한다.
- [x] `lesson-files`, `question-images` 테스트 파일도 같이 정리한다.
- [x] 리셋 방식은 `DB + Storage 전부 삭제 후 재시드`로 잠근다.

## 현재 확인된 사실

- [x] 현재 원격 DB에는 테스트성 데이터가 많이 쌓여 있다.
- [x] 최근 표본 기준 레거시 lesson 제목 패턴이 `Loader QA`, `PDF threshold`, `API Full Run`, `Local direct upload`, `Prod direct upload`로 확인됐다.
- [x] 현재 응답 시스템 프롬프트는 `src/lib/prompts/index.ts`의 `GRILL_ME_TUTOR` 단일 템플릿 안에서 `grill-me`, `guide-me`, `quick-me`를 같이 다루고 있다.
- [x] Quick-Me는 이전에는 UI 모드 선택에 의존했지만, 현재는 긴급 표현 감지 시 자동 진입하도록 변경되었다.
- [x] `retrieveContext()`는 현재 질문별 검색이 아니라 lesson 전체 텍스트를 context stuffing 하는 구조다.

## 공식문서로 확인한 근거

- [x] Supabase Storage의 `storage` 스키마는 메타데이터이며, SQL로 메타데이터만 지우면 실제 객체는 남아서 계속 과금될 수 있다.
  - 출처: Supabase Docs, Storage Schema
  - 링크: https://supabase.com/docs/guides/storage/schema/design
- [x] Supabase Storage 비용은 버킷 안 모든 asset의 총 크기를 기준으로 계산된다.
  - 출처: Supabase Docs, Storage Pricing
  - 링크: https://supabase.com/docs/guides/storage/pricing
- [x] Supabase signed/resumable upload는 파일 경로 단위 업로드 URL과 overwrite 정책을 분리해 다룬다. 이후 PDF 기록 기능을 붙일 때 파일 경로/이름 정책을 먼저 잠가야 한다.
  - 출처: Supabase Docs, Resumable Uploads
  - 링크: https://supabase.com/docs/guides/storage/uploads/resumable-uploads
- [x] OpenAI Prompt Caching은 긴 공통 prefix를 앞에 두고, 동적인 user-specific 내용을 뒤에 둘 때 이점을 얻는다.
  - 출처: OpenAI Docs, Prompt Caching
  - 링크: https://developers.openai.com/api/docs/guides/prompt-caching
- [x] OpenAI는 prompt object/versioning을 공식 지원하므로, 현재 로컬 상수 기반 프롬프트가 안정화되면 버전 관리형 prompt 운영으로 옮길 여지가 있다.
  - 출처: OpenAI Docs, Prompting
  - 링크: https://developers.openai.com/api/docs/guides/prompting

## Phase 0. 조사 & 스냅샷

- [x] 현재 DB row count와 storage object 수를 스냅샷으로 기록한다.
  - [x] 리셋 전: `users 148`, `lessons 33`, `lesson_materials 88`, `sessions 53`, `student_questions 117`, `ai_responses 126`, `misconception_summaries 25`
  - [x] 리셋 전 storage: `lesson-files 34`, `question-images 17`
- [x] lesson 제목, teacher 이름, file_name 기준으로 레거시 패턴을 분류한다.
- [x] `users`, `lessons`, `lesson_materials`, `sessions`, `student_questions`, `ai_responses`, `misconception_summaries` 간 삭제 순서를 검증한다.
- [x] Quick-Me 실패 원인 후보와 개선 포인트를 구조적으로 정리한다.
- [ ] 현재 `response_type`, `mode`, `current_step`, `answer_check`가 실제로 어떻게 저장되는지 표로 정리한다.

### Phase 0 자기리뷰

- [x] 어떤 데이터를 지울지 regex/pattern 기준이 명확한가
- [x] "실제형 목업"에 꼭 필요한 테이블과 컬럼을 놓치지 않았는가
- [x] Quick-Me 문제를 프롬프트 탓으로 단정하지 않고 UI 모드/히스토리/상태 로직까지 포함해 봤는가

## Phase 1. 데이터 리셋 정책 잠금

- [x] 삭제 대상: QA, threshold, upload test, full run, loader, pdf size test 계열 데이터를 전부 삭제한다.
- [x] 유지 대상: 제출 직전 데모에 필요한 대표 lesson 수와 teacher/student 수를 잠근다.
- [x] storage bucket 정리 범위는 `lesson-files`, `question-images` 모두로 잠근다.
- [x] lesson_materials `file_url`은 실제 객체를 가리키는 방향으로 잠근다.
- [x] seed script를 반복 실행 가능한 형태로 둔다.
- [x] 리셋은 `DB + Storage 전부 삭제 후 재시드`로 진행한다.

### Phase 1 자기리뷰

- [x] DB 삭제가 끝난 뒤 앱이 빈 상태에서 깨지지 않는가
- [x] storage object까지 같이 정리하지 않으면 비용/혼선이 남는다는 점을 반영했는가
- [x] seed 재실행 시 중복 row가 생기지 않게 설계했는가

## Phase 2. 실제형 목업 데이터 설계

- [x] 교사 persona 2~3명을 정의한다.
- [x] 기본 naming tone은 `김민수 선생님 / 2학년 1반` 계열로 잠근다.
- [x] 교사는 2명으로 잠근다.
- [x] 학생은 10명으로 잠근다.
- [x] 학생 persona 10명을 정의한다.
- [x] 수업은 5개로 설계한다.
  - [x] 인수분해
  - [x] 이차방정식
  - [x] 일차함수
  - [x] 연립방정식
  - [x] 도형의 닮음
- [x] 자료 형식은 `PDF 위주`, `Markdown도 허용`으로 잠근다.
- [x] lesson별 PDF 파일명, topic, subject, 업로드 시각을 자연스럽게 설계한다.
- [x] 질문 유형이 `concept`, `hint`, `review`, `similar`를 모두 덮도록 배치한다.
- [x] 완료 세션 / 진행 중 세션 / 초기 진입 세션을 섞어 넣는다.
- [x] 교사 대시보드에서 heatmap, top questions, AI 보충 카드가 바로 살아날 만큼 질문 밀도를 확보한다.

### Phase 2 자기리뷰

- [x] 화면에 보였을 때 "테스트용" 냄새가 나는 제목/파일명이 남아 있지 않은가
- [x] 학생 질문이 전부 같은 문장 패턴으로 반복되지 않는가
- [x] 오개념 분포가 한 유형으로만 쏠리지 않는가

## Phase 3. 교사 대시보드 PDF 기록 정책

- [x] 교사 대시보드에 어떤 PDF를 썼는지 남긴다.
- [x] 남길 단위는 아래로 잠근다.
  - [x] 파일명
  - [x] 업로드 시각
  - [x] 파일 수
  - [ ] 마지막 수정 시각은 이번 범위에서 제외
  - [ ] 자료 한 줄 요약은 이번 범위에서 제외
- [x] lesson-level 메타데이터와 retrieval trace를 분리한다.
- [x] retrieval trace는 영구 저장 대신 휘발성/TTL 로그로 제한한다.

### 권장 방향

- [x] `lesson_materials`의 파일명/업로드 시각/자료 수는 영구 메타데이터로 유지
- [ ] "이번 응답에서 실제로 어느 PDF chunk를 참조했는가" 같은 retrieval trace는 영구 저장하지 않고, 필요하면 짧은 TTL 디버그 로그로 제한
- [ ] 비용 측면에서 먼저 비싸지는 것은 보통 DB row보다 Storage object 총량이므로, 자료 메타데이터 자체는 큰 비용 요인이 아님

### Phase 3 자기리뷰

- [ ] 교사가 실제로 궁금한 것은 "무슨 자료가 연결되어 있나"인지, "매 응답마다 어떤 chunk를 썼나"인지 구분했는가
- [ ] 디버그용 로그를 제품 기능처럼 영구 저장하려는 과잉 설계를 피했는가

## Phase 4. 현재 프롬프트/응답 로직 분석

- [x] 현재 흐름을 코드 기준으로 문서화한다.
  - [x] `/api/questions` → `classifyIntent()`
  - [x] `/api/questions/[id]/respond` → `generateTutoringResponse()` + `lesson_quick_answers` cache lookup
  - [x] `PROMPTS.GRILL_ME_TUTOR` / `GUIDE_ME_TUTOR` / `QUICK_ME_TUTOR`
  - [x] `parseAiResponse()`
  - [x] `useQuestionChat.deriveNextChatState()`
- [x] `mode`, `current_step`, `consecutive_wrong`, `messages`가 모델 입력으로 어떻게 들어가는지 정리한다.
- [x] 어떤 태그가 저장되고, 어떤 태그가 UI/DB/상태 전이에 쓰이는지 정리한다.
- [x] Quick-Me가 왜 계속 묻는지 원인 후보를 분리한다.
  - [x] UI 모드 진입 자체가 안 됨
  - [x] 단일 템플릿 안에서 grill/guide/quick 지시가 섞임
  - [x] 이전 assistant 질문 히스토리가 모델을 다시 질문형으로 끌고 감
  - [x] response_type과 실제 응답 행동이 불일치
  - [x] lesson 전체 context stuffing이 과도하게 길어 Quick 지시를 희석

### Phase 4 자기리뷰

- [ ] 프롬프트 본문만 보지 않고 route/hook/태그 파서까지 같이 봤는가
- [ ] Quick 문제를 "모델이 멍청해서"가 아니라 시스템 설계 문제로 분해했는가

## Phase 5. Quick-Me 리디자인 잠금

- [x] Quick-Me를 별도 시스템 프롬프트로 분리한다.
- [x] Quick-Me에서는 반드시 답을 주도록 계약을 강화한다.
- [x] Quick-Me 본문에 질문문/되물음을 금지하는 룰을 넣는다.
- [x] Quick-Me 응답 포맷을 더 짧고 강하게 고정한다.
- [x] Quick-Me에는 출력 예시를 넣고, 모델 입력은 최신 user 메시지 중심으로 줄인다.
  - [ ] 핵심 개념
  - [ ] 풀이 단계
  - [x] 최종 답
  - [ ] 실수 포인트 1개
- [ ] 학생이 "답만 달라"라고 했을 때
  - [ ] UI 모드 전환 안내만 할지
  - [x] 텍스트만으로 Quick-Me 전환을 허용할지
  - [ ] 둘 다 허용할지
  를 잠근다.
- [x] 교사용 지표에 `Quick-Me 사용/자동 전환 비율`을 포함하는 방향으로 잠근다.
- [x] Quick-Me 자동 전환 트리거 문구를 아래로 잠근다.
  - [x] `답만`
  - [x] `빨리`
  - [x] `시간 없어`
  - [x] `바로 풀어줘`
- [x] Quick-Me 비율은 `AI 보충 분석` 카드 내부에 노출하는 방향으로 잠근다.

### Phase 5 자기리뷰

- [x] SSOT의 기존 "Quick-Me는 학생이 모드 선택" 원칙 변경을 overview.md에 반영했는가
- [x] Quick-Me가 Grill-Me의 안티패턴이 아니라 명시적 예외 흐름으로 보이게 했는가

## Phase 6. Gemma 4 로컬 LLM 대비 보강

- [x] 긴 혼합 지시 대신 mode별 짧은 프롬프트로 분리한다.
- [ ] 태그 출력 예시를 one-shot/few-shot로 줄지 결정한다.
- [ ] `정확히 이 순서로 출력` 같은 포맷 제약을 더 강하게 줄지 검토한다.
- [x] MVP fallback RAG도 질문과 겹치는 자료를 우선 선택하도록 보강한다.
- [x] lesson별 quick answer cache / concept cache가 필요한지 검토한다.
- [x] quick answer cache는 새 테이블로 추가한다.

### 권장 방향

- [x] Gemma용 prompt는 짧고 명령적인 mode별 템플릿으로 유지한다.
- [x] Quick-Me는 "질문 금지, 답 우선"을 중복 명시해야 한다.
- [x] lesson마다 `핵심 개념 요약`, `자주 틀리는 포인트`, `대표 풀이 템플릿`, `자주 나오는 질문-빠른답변 세트` 같은 경량 캐시를 두면 약한 모델 보조에 유리하다.

### Phase 6 자기리뷰

- [ ] "모델 교체"와 "프롬프트 정리"를 분리해서 생각했는가
- [ ] DB 캐시가 원문 자료를 중복 저장하는 낭비 구조가 아닌가

## Phase 7. 구현 & QA

- [x] demo data reset script 작성
- [x] storage cleanup 포함 dry-run 전략 마련
- [x] 실제 데이터 교체 실행
- [x] teacher dashboard 화면 QA
- [x] student quick-me 응답 QA
- [x] 대시보드 자료 기록 표기 QA
- [x] Quick-Me 히스토리 축소 및 focused context fallback 적용
- [x] lint / typecheck / build
- [x] 문서 동기화

### Phase 7 자기리뷰

- [x] 삭제/삽입 후 DB가 SSOT와 맞는가
- [x] demo data가 교사/학생 화면 양쪽에서 자연스러운가
- [x] Quick-Me 회귀 없이 Grill-Me/Guide-Me도 유지되는가

## 다음 실행 순서

1. Phase 0 조사 결과를 표로 정리
2. Phase 1 정책 잠금
3. Phase 2 데모 데이터 설계안 작성
4. Phase 7의 reset script 구현 및 실행
5. 이후 Phase 4~6 프롬프트 리디자인 착수
