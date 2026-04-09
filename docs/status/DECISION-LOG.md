# Decision Log

> append-only. 구조적 결정만 기록.

---

## 2026-04-06 — 아이디어 확정

### 맥락
KIT 바이브코딩 공모전 (AI활용 차세대 교육 솔루션), 04/13 마감, 500팀 참가

### 검토된 대안
1. AI 수업 설계 보조 (교사용) — 기각: MVP 1주 내 완성도 불확실
2. 학부모-교사 AI 브릿지 — 기각: 공모전 임팩트 약함
3. AI 기반 형성평가 자동화 — 기각: 수업 중 도구라 데모 시연 어려움

### 최종 결정
"수업 후 막힘 해소 AI 코치 + 교사용 오개념 대시보드" (수학 특화)

### 이유
- 시장 gap: 힌트 래더 + 교사 자료 RAG + 오개념 히트맵 조합 = 직접 경쟁자 없음
- Khanmigo 0.23SD 학습 향상 데이터로 방법론 입증
- 1주 MVP 범위 현실적

### 위험 요소
- AI 환각 (수학 풀이 오류) → 출처 표시 + 교사 검토 + 검증 루프
- 04/13 마감 → P0 기능만 집중

---

## 2026-04-06 — 기술스택 확정

### 결정
Next.js 16 + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel AI Gateway + pgvector

### 이유
- Vercel 배포 최적화, AI Gateway OIDC로 API 키 관리 불필요
- Supabase pgvector로 RAG 벡터검색 내장
- shadcn/ui로 빠른 UI 구축

---

## 2026-04-06 — 게임화 정책 확정

### 결정
강한 게임화 금지, mastery 마이크로 UX만 허용

### 이유
- 신뢰성·교사 통제권 메시지 보호
- 로그인 없는 데모 구조와 호환
- 심사위원은 현장 적합성에 반응

---

## 2026-04-06 — AI 모델 전략 확정

### 맥락
Gemini 한도 금방 참, 다수 동시접속 시 먹통 경험. OpenAI 10만원 크레딧 보유.

### 검토된 대안
1. Gemini 2.5 Flash 단일 — 기각: 한도 문제 경험, 동시접속 불안정
2. 순수 로컬 LLM — 기각: Vercel 배포 불가, 공모전 데모 안정성 부족
3. OpenAI + Gemma 4 하이브리드 — **채택**

### 최종 결정
- **공모전:** OpenAI `gpt-4o-mini` via AI Gateway (10만원 크레딧)
- **프로덕션:** Gemma 4 E4B 로컬 (60-70%) + Cloud fallback (30-40%)

### 이유
- 공모전은 안정성 최우선 → OpenAI 크레딧 활용
- 프로덕션은 비용 $0 목표 → Gemma 4 (AIME 89.2%, Apache 2.0, 8GB 노트북 실행)
- 하이브리드 = 심사위원 킬러 포인트 ("API 비용 제로 + 프라이버시")

### 위험 요소
- Gemma 4 WebGPU 브라우저 호환성 → Feature detection + Cloud fallback
- Gemma 4 한국어 품질 → 프롬프트 템플릿으로 출력 형식 고정

---

## 2026-04-06 — Grill-Me 질문법 채택

### 결정
기존 "AI가 힌트를 줌" → "AI가 질문을 던지고 학생이 답하게 함" 전환

### 이유
- Matt Pocock grill-me 패턴: 의사결정 트리 각 분기를 질문으로 탐색
- Khanmigo 실증: 학생 68%가 질문형(소크라틱) 선호
- 높은 스캐폴딩 = 유의미한 학습 향상 (ScienceDirect 2025)
- 심사 어필: 단순 힌트가 아닌 능동적 사고 유도 = 창의성 점수 ↑

### UI 설계
- 매 AI 질문에 접이식 "추천 보기" 버튼 (Collapsible)
- 학생이 막히면 추천 열어봄, 안 막히면 직접 답변

---

## 2026-04-06 — Obsidian .md RAG 지원 추가

### 결정
PDF 외에 Obsidian 마크다운 파일을 RAG 소스로 지원

### 이유
- PDF 파싱 품질 불안정 vs .md 100% 정확
- 헤딩(#/##) 기준 자연 청킹 = 별도 splitter 불필요
- YAML frontmatter = 메타데이터 자동 추출 (과목, 단원, 난이도)
- `[[위키링크]]` = 개념 간 관계 자동 추출
- 구현 시간: 2-3시간
- 차별점: "교사가 Obsidian으로 정리 → AI 자동 학습" 스토리

---

## 2026-04-06 — 임베딩 모델 확정

### 검토된 대안
1. Gemini Embedding 2 ($0.20/1M, 768d, 멀티모달) — 기각: 10배 비쌈, pgvector 사례 적음
2. OpenAI text-embedding-3-small ($0.02/1M, 1536d) — **채택**

### 최종 결정
`openai/text-embedding-3-small` (1536d, $0.02/1M)

### 이유
- Gemini보다 10배 저렴
- pgvector 1536d 연동 사례 풍부
- 대회 전체 임베딩 비용 ~$0.007 (무시 가능)

---

## 2026-04-06 — UI 구현 전략: Stitch 하이브리드

### 맥락
Google Stitch SDK로 5페이지 UI 시안 생성 완료 (PNG + HTML).
HTML은 Tailwind CDN + Manrope 폰트 + Material Symbols 아이콘 기반 정적 마크업.

### 검토된 대안
1. Stitch HTML 그대로 사용 — 기각: CDN 의존, 정적, Next.js Server Component 불가, 인터랙션 없음
2. shadcn/ui 완전 재구현 (HTML 무시) — 기각: 시안 비주얼 재현 어려움, 시간 낭비
3. 하이브리드 (컬러/레이아웃 추출 → shadcn 구현) — **채택**

### 최종 결정
Stitch HTML에서 **디자인 토큰(컬러, 타이포, 간격, 레이아웃 구조) 추출** → `DESIGN-TOKENS.md`에 정리 → shadcn/ui `globals.css` CSS 변수로 매핑하여 구현

### 매핑 요약
- Stitch `background: #faf9f7` → shadcn `--background`
- Stitch `primary: #000000` → shadcn `--primary`
- Stitch `Manrope` 폰트 → Geist Sans (CLAUDE.md 기술스택)
- Stitch `Material Symbols` → Lucide React (shadcn 표준)
- Stitch `borderRadius: 0px~0.125rem` → shadcn `--radius: 0.125rem`

### 핵심 디자인 원칙 (Stitch에서 관찰)
1. 극도의 미니멀리즘 — 장식 없음, 타이포그래피가 주인공
2. 직각 미학 — border-radius 거의 0 (에디토리얼/아카데믹)
3. 모노크로매틱 웜 — 검정~회색~따뜻한 흰색
4. 대문자 라벨 — `uppercase tracking-widest`
5. 넉넉한 여백 — `space-y-16~24`, `p-8~12`

### 산출물
- `docs/design/stitch-outputs/P00X-*.html` — 5개 HTML (디자인 레퍼런스)
- `docs/design/stitch-outputs/P00X-*.png` — 5개 PNG (시각 레퍼런스)
- `docs/design/DESIGN-TOKENS.md` — 통합 디자인 토큰 + shadcn 매핑

---

## 2026-04-06 — 라이트모드 전환

### 맥락
초기 UI-SPEC.md는 다크모드(zinc-950) + indigo accent로 설계.
Stitch 시안은 라이트모드(#faf9f7 warm white) + 블랙 primary로 생성됨.

### 최종 결정
**라이트모드 기본** + 모노크로매틱 웜 팔레트로 전환

### 이유
- Stitch 시안이 라이트모드로 확정됨 (5개 페이지 전부 `class="light"`)
- 에디토리얼/아카데믹 미학과 라이트모드가 더 어울림
- 교육 맥락에서 라이트모드가 가독성 우수
- 다크모드는 v2에서 추가 가능 (CSS 변수 구조가 이미 지원)

---

## 2026-04-07 — MVP 검색 전략: Context Stuffing 확정

### 맥락
RAG 파이프라인 구현 시 벡터 검색 vs 전체 텍스트 주입 결정 필요.

### 검토된 대안
1. 벡터 검색 (임베딩 → match_chunks RPC) — 보류: MVP에서 자료 < 128K이면 과도한 복잡도
2. Context Stuffing (전체 텍스트 주입) — **채택**

### 최종 결정
MVP는 **Context Stuffing** (extracted_text 전체 주입), v2에서 벡터 검색 전환

### 이유
- 교사 업로드 자료가 통상 128K 미만 → 전체 주입이 정확도 더 높음
- 임베딩 API 호출 비용/시간 절약
- `USE_VECTOR_SEARCH = false` 스위치 1개로 v2 전환 가능
- 청킹 + DB 저장은 이미 구현 (v2 대비)
- 임베딩 인프라(pgvector 컬럼, HNSW 인덱스, match_chunks RPC)도 준비됨

### 구현 세부
- `search.ts`: `getFullText()` — chunk_index=0인 행만 조회하여 파일별 전체 텍스트 결합
- `embed.ts`: export만 존재, 호출 시 throw (v2 활성화 시 구현)
- `retrieveContext()`: 통합 인터페이스 (MVP: getFullText, v2: searchChunks)

---

## 2026-04-07 — 파일 업로드: API Route 선택

### 검토된 대안
1. Server Action으로 파일 업로드 — 기각: Next.js Server Action 파일 크기 제한 (1MB 기본)
2. API Route (FormData) — **채택**

### 최종 결정
파일 업로드는 `/api/materials/upload` API Route로 처리, 수업 생성은 Server Action

### 이유
- API Route는 파일 크기 제한 없음 (자체 10MB 검증)
- FormData 네이티브 지원
- 클라이언트에서 직접 fetch → 파일별 진행 상태 추적 가능

---

## 2026-04-09 — 대용량 PDF 업로드: direct upload 전환

### 검토된 대안
1. 기존 `multipart -> /api/materials/upload` 유지 — 기각: Production에서 약 4.3MB부터 `413 FUNCTION_PAYLOAD_TOO_LARGE`
2. 브라우저 → Supabase Storage signed direct upload + 서버 후처리 — **채택**

### 최종 결정
브라우저는 `/api/materials/upload-url`에서 signed upload URL을 발급받고, 파일은 Supabase Storage로 직접 업로드한다. 업로드 후 `/api/materials/upload`는 Storage 파일을 내려받아 텍스트 추출/청킹/DB 저장만 담당한다.

### 이유
- Vercel 함수 요청 바디 한계를 우회하면서 SSOT 10MB 제한을 유지할 수 있다
- 교사 업로드 UX와 파일별 상태 관리를 그대로 살릴 수 있다
- 후처리 API를 분리해 재시도와 중복 처리 방어가 쉬워진다

---

## 2026-04-07 — 채팅 UI 훅 패턴 채택 (useChat 미사용)

### 검토된 대안
1. `@ai-sdk/react` useChat — 기각: 커스텀 메타데이터(mode, step, recommendation, grounded) 관리 불가
2. 커스텀 `useQuestionChat` 훅 — **채택**

### 최종 결정
`@ai-sdk/react` 미설치, 커스텀 훅으로 채팅 상태 관리

### 이유
- AI 응답에 [RECOMMENDATION], [MODE_SWITCH], [GROUNDED] 등 메타 태그 파싱 필요
- 모드 전환 로직 (grill-me → guide-me → quick-me) 커스텀 상태 필요
- useChat는 이러한 메타데이터를 네이티브로 지원하지 않음
- ReadableStream 직접 소비로 태그 실시간 필터링 가능

---

## 2026-04-07 — Stitch 시안 반영 전략 수정

### 맥락
D-6/D-5에서 UI-SPEC.md(shadcn 기반)를 따랐으나, Stitch HTML 비주얼과 큰 괴리 발견.
셀프 리뷰 결과 P-001 30%, P-002 60% 수준.

### 최종 결정
**Stitch HTML 우선, SSOT 기능 보충** 원칙으로 이전 페이즈도 수정

### 변경사항
- P-001: 5섹션 풀 리빌드 (max-w-lg → max-w-7xl, 5xl→7xl, Stats+Methodology+Footer 추가)
- P-002: underline 입력, 10px 라벨, flat 파일리스트, space-y-12, 3.5rem 헤드라인
- P-003: 처음부터 Stitch 우선으로 구현 (95% 반영)
- 공통: LandingFooter 컴포넌트, Header 조건부 숨김

### 이유
- 공모전 심사에서 시각적 완성도가 첫인상 결정
- Stitch 시안이 에디토리얼 미학의 SSOT
- UI-SPEC은 기능 요구사항 보충용으로 역할 재정립

---

## 2026-04-07 — AI 모델: openai('gpt-4o-mini') 직접 사용

### 맥락
AI Gateway + OIDC가 최신 권장이지만, OPENAI_API_KEY 10만원 크레딧 보유.

### 최종 결정
`@ai-sdk/openai`에서 `openai('gpt-4o-mini')` 직접 호출

### 이유
- 공모전용 단기 프로젝트, AI Gateway 설정 오버헤드 불필요
- OPENAI_API_KEY 크레딧 이미 보유
- 프로덕션에서 Gemma 4 전환 예정 → Gateway는 그때 설정
