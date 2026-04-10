---
project: pulda-ai
version: 1.0
updated: 2026-04-06
deadline: 2026-04-13
competition: KIT 바이브코딩 공모전
topic: AI활용 차세대 교육 솔루션
pitch: "교사의 수업자료에 근거해 학생의 막힘 지점을 Grill-Me 질문법으로 해결하고, 교사에게는 오개념 heatmap과 즉시 개입용 보충과제를 제공하는 수업 후 보충 AI 코치."
---

# 풀다 AI — Overview (SSOT)

> 이 문서는 프로젝트의 **단일 진실 소스(SSOT)**입니다.
> 각 섹션은 `<!-- @extract-to: {파일명} -->` 태그로 표시되어 있어, 에이전트가 개별 문서로 분리 추출할 수 있습니다.

## 목차 (Table of Contents)

| # | 섹션 | 추출 대상 | 줄 |
|---|------|----------|-----|
| A | 시장 분석 & 경쟁사 | `MARKET-ANALYSIS.md` | §A |
| B | 제품 정의 & 범위 잠금 | `PRD.md` | §B |
| C | 사용자 흐름 | `PRD.md`, `WIREFRAME.md` | §C |
| D | AI 시스템 설계 | `PROMPT-DESIGN.md` | §D |
| E | 데이터 모델 | `SCHEMA.md` | §E |
| F | RAG 파이프라인 | `RAG-PIPELINE.md` | §F |
| G | 페이지 & 라우트 | `WIREFRAME.md`, `ROUTE-MAP.md` | §G |
| H | 심사 기준 대응 | `AI-REPORT-DRAFT.md` | §H |
| I | 금지 사항 & 원칙 | `CLAUDE.md` | §I |
| J | 기술스택 & 설정 | `ARCHITECTURE.md` | §J |
| K | 시연 시나리오 | `DEMO-SCENARIO.md` | §K |
| L | 도메인 지식 | `DOMAIN-KNOWLEDGE.md` | §L |
| M | 현장 검증 & 리스크 | `DOMAIN-KNOWLEDGE.md` | §M |
| N | 공모전 제출 요건 | `SUBMISSION-CHECKLIST.md` | §N |

---

<!-- @extract-to: MARKET-ANALYSIS.md -->
## §A. 시장 분석 & 경쟁사

### A-1. 국내 사례

| 제품 | 핵심 기능 | 우리가 가져올 점 | 우리와 다른 점 |
|------|----------|-----------------|---------------|
| **AIDT (교육부)** | 학습진단→경로추천→대시보드→AI튜터 | 진단→추천→heatmap 구조 | 범용 교과서, 도입률 급감 |
| **EBS AI펭톡** | 캐릭터 대화+게임화 영어 말하기 | 저압 반복 연습 UX | 영어 전용, 초등 대상 |
| **클래스팅 AI** | 진단평가+AI패스트트랙+샌드박스+라이팅 | **교사 통제권**, 실시간 모니터링, 루브릭 피드백 | LMS 전체, 전과목 |
| **콴다(QANDA)** | 사진 질문→AI 단계별 풀이→유사문항 | **의도 라우팅+도구 선택** 에이전트 구조 | 정답 직출 (힌트 아님) |
| **U+슈퍼스쿨** | 출결/상담/생기부 행정 AI | 교사 업무 절감 축 | 행정 중심, 학습 보조 아님 |

### A-2. 해외 사례

| 제품 | 핵심 기능 | 우리가 가져올 점 | 우리와 다른 점 |
|------|----------|-----------------|---------------|
| **Khanmigo** | 소크라틱 힌트형 튜터 + Plan/Create/Differentiate | **힌트 래더**, 교사용 도구 분리 | 한국 교육과정 미지원 |
| **Duolingo Max** | 실시간 AI 대화 + 사후 transcript 복기 | 실시간 연습+사후 복기 패턴 | 언어 전용 |
| **Coursera Coach** | 강좌 콘텐츠 anchored RAG 보조 | **수업 콘텐츠 근거 조교** = 성과 입증 | 대학/성인 대상 |
| **Gemini in Classroom** | 교사 공통 작업 보조 + admin control | **관리자 통제권**, 연령 관리 | Google 생태계 한정 |
| **Quizlet Q-Chat** ⚠️ | AI 채팅 퀴즈 (2025-06 서비스 종료) | **교훈**: 학습 흐름에 안 붙으면 실패 | 폐기됨 |

### A-3. 설계 원칙 6가지 (경쟁 분석에서 도출)

1. **수업 자료 근거형 응답** — 교사 업로드 자료 기준으로만 답변
2. **정답 직출 금지, Grill-Me 질문 사다리** — AI가 질문을 던져 학생이 스스로 답을 찾도록 유도 (4단계: 접근법→핵심개념→유사문제→풀이설명)
3. **멀티모달 입력** — 텍스트+사진 (MVP), 음성은 제외
4. **"대화"가 아닌 "다음 행동 추천"** — 적응형 추천→오답 관리→유사문항→미니퀴즈
5. **교사 통제권 필수** — 프롬프트/피드백/사용 대상 제어
6. **교사 업무 절감** — 오개념 요약, 공통 질문 분석, 보충과제 추천

### A-4. 시장 gap 결론

> **"힌트 래더 + 교사 자료 RAG + 오개념 히트맵"을 동시에 제공하는 제품은 한국 시장에 없음.**
> 콴다의 안티테제 + AIDT 보완재로 포지셔닝.

---

<!-- @extract-to: PRD.md -->
## §B. 제품 정의 & 범위 잠금

### B-1. 제품 한 줄 정의

> 수업 후 학생의 막힘 지점을 AI로 풀어주고, 교사에게는 오개념 대시보드를 제공하는 학습 보조 솔루션

### B-2. 이번 MVP는 / 아닌 것

| MVP 범위 (DO) | 제외 범위 (DON'T) |
|---------------|-------------------|
| 학생 질문 해결 | LMS 전체 구축 |
| Grill-Me 질문형 학습 보조 | 학교 행정 시스템 |
| 교사용 오개념 파악 | 전 과목 만능 챗봇 |
| 수업 후 보충 개입 | 성적처리 시스템 |
| | 과금/구독 |
| | 학부모 기능 |
| | 음성/영상 기반 |

### B-3. 타겟 사용자

| 구분 | 대상 |
|------|------|
| **1차 (MVP)** | 중·고등학생 1명, 교사 1명 (데모 유저) |
| **2차** | 학원 강사, 멘토, 튜터 |
| **제외** | 학부모, 대학/기업, 운영기관 관리자, B2B |

### B-4. 문제 정의

**해결할 문제:**
1. 학생은 수업 후 막히지만 질문을 정리하기 어렵다
2. 학생은 정답만 보고 넘어가서 진짜 이해가 안 된다
3. 교사는 누가 어디서 막히는지 한눈에 보기 어렵다
4. 교사는 같은 설명을 반복하느라 시간이 많이 든다

**해결하지 않는 문제:**
1. 학교 전체 행정 자동화
2. 시험 감독/부정행위 탐지
3. 완전 자동 채점
4. 진로/상담/생활지도 전체 커버
5. 학사관리 시스템 통합

### B-5. 과목 범위

> **전과목 범용 구조, 데모는 수학 중심**. 코드/DB는 과목 제한 없이 설계하되, 시연 시나리오와 프롬프트 최적화는 수학으로 진행.

### B-6. 입출력 범위

**입력:**

| 구분 | 항목 | 상태 |
|------|------|------|
| MVP 필수 | 텍스트 질문 | ✅ |
| MVP 필수 | 이미지 업로드 1장 | ✅ |
| 있으면 좋음 | 학생 답안 이미지 | ⭐ |
| 있으면 좋음 | 수식 텍스트 입력 | ⭐ |
| 제외 | 음성, 영상, 필기 실시간 인식 | ❌ |

**학생 출력:**

| # | 타입 | 설명 |
|---|------|------|
| 1 | 힌트 | 단계별 힌트 제공 |
| 2 | 개념 설명 | 관련 개념 안내 |
| 3 | 오답 피드백 | 틀린 이유 분석 |
| 4 | 유사문항 | 연습 문제 추천 |
| 5 | 미니퀴즈 | 1문항 즉석 퀴즈 |
| 6 | 세션 요약 | 학습 세션 정리 |

**교사 출력:**

| # | 타입 | 설명 |
|---|------|------|
| 1 | 질문 TOP 5 | 많이 나온 질문 목록 |
| 2 | 막힌 개념 TOP 5 | 자주 막힌 개념 히트맵 |
| 3 | 질문 예시 | 학생 원문 질문 샘플 |
| 4 | 보충 요약 | 보충 설명용 요약 문구 |

### B-7. 구현 우선순위

| 등급 | 항목 |
|------|------|
| **P0 반드시** | 수업자료 업로드, RAG 검색, 학생 질문 4 intent, 교사용 오개념 대시보드 |
| **P1 있으면** | 사진 업로드, 미니퀴즈 자동 생성, 세션 요약 |
| **P2 버림** | 풀 LMS, 전학년 전과목, 완전자동 채점/평가 |

### B-8. 성공 조건

- [ ] 학생이 실제로 질문하고 응답을 받을 수 있다
- [ ] 교사가 어떤 개념에서 학생이 막혔는지 볼 수 있다
- [ ] AI 활용 이유가 명확하다
- [ ] 짧은 데모에서 가치가 바로 보인다

---

<!-- @extract-to: PRD.md, WIREFRAME.md -->
## §C. 사용자 흐름

### C-1. 플로우 A: 교사

```
교사 수업자료 등록 → 학습 주제 입력 → 시스템이 지식베이스 생성
    → 학생 질문 로그 확인 → 오개념 대시보드 확인 → 보충 설명/과제 참고
```

| 단계 | 행동 | 시스템 반응 |
|------|------|-----------|
| 1 | 수업 자료 업로드 (PDF/이미지/텍스트) | 파일 저장 + 텍스트 추출 |
| 2 | 학습 주제/핵심 개념 입력 | RAG 지식베이스 구축 |
| 3 | 학생 질문 로그 확인 | 질문 목록 + 의도 분류 표시 |
| 4 | 오개념 대시보드 확인 | 히트맵 + TOP 5 개념 + 빈도 |
| 5 | 보충 과제 참고 | 요약 문구 + 추천 설명 |

### C-2. 플로우 B: 학생

```
질문 입력 (텍스트/이미지) → AI 의도 분류 → 힌트/설명/유사문항/답안검토 제공
    → 추가 질문 → 미니 퀴즈 → 세션 요약
```

| 단계 | 행동 | 시스템 반응 |
|------|------|-----------|
| 1 | 질문 입력 (텍스트 또는 사진) | 의도 자동 분류 (4가지) |
| 2 | AI 응답 수신 | 힌트/개념설명/유사문항/답안검토 중 택 1 |
| 3 | 추가 질문 | 이전 맥락 유지, 심화 응답 |
| 4 | 미니 퀴즈 | 이해도 확인 1문항 |
| 5 | 세션 종료 | 학습 요약 제공 |

### C-3. 제외 플로우

- 회원 초대/학급 코드/대규모 반 관리
- 학부모 공유, 채팅방 그룹 토론, 실시간 화상수업, 과금/구독

---

<!-- @extract-to: PROMPT-DESIGN.md -->
## §D. AI 시스템 설계

### D-1. 핵심 학습 전략: Grill-Me 질문법

기존 "AI가 힌트를 줌" → **"AI가 질문을 던지고 학생이 스스로 답하게 함"**
Matt Pocock grill-me 패턴 + socratic-review 하네스를 학습에 적용.

**질문 사다리 4단계:**

| 단계 | AI가 하는 것 | 예시 | 학생이 막히면 |
|------|-------------|------|-------------|
| 1 | 접근법 **질문** | "어떤 방법을 쓸 수 있을 것 같아?" | "추천 보기" → 인수분해 |
| 2 | 핵심 개념 **질문** | "상수항 6을 만드는 두 수의 조합은?" | "추천 보기" → 2와 3 |
| 3 | 유사 문제 **질문** | "그러면 x²+7x+12는?" | "추천 보기" → (x+3)(x+4) |
| 4 | 풀이 설명 **요청** | "네 풀이를 단계별로 설명해볼래?" | AI가 검증 + 피드백 |

**UI:** 매 질문에 접이식 "추천 보기" 버튼 (Collapsible) + **프로그레스 바 "질문 2/4"**
**핵심:** AI가 답변이 아닌 **질문**을 던짐 → 학생의 능동적 사고 유도

**적응적 모드 전환:**

| 상황 | 모드 | 동작 |
|------|------|------|
| 기본 | **Grill-Me** | 소크라틱 질문 사다리 (4단계) |
| 3회 연속 오답 | **Guide-Me** | 직접 설명 모드로 전환 (ZPD 벗어남 감지) |
| 시험 D-1 긴급 | **Quick-Me** | 단계별 풀이를 빠르게 보여주고 최종 답을 즉시 공개함 (학생 선택 또는 `답만`/`빨리`/`시간 없어`/`바로 풀어줘` 감지 시 자동 전환) |

**교육학 근거:** Vygotsky ZPD(근접발달영역) — 학생 수준에 맞지 않는 질문은 좌절감만 유발. 3회 오답 = ZPD 이탈 신호 → scaffolding 강도 자동 상향.

### D-2. AI 역할 4가지

| # | 역할 | 입력 | 출력 |
|---|------|------|------|
| 1 | **질문 의도 분류** | 학생 질문 텍스트/이미지 | `concept` / `hint` / `review` / `similar` |
| 2 | **수업 자료 기반 응답** | 질문 + RAG 검색 결과 | 근거 기반 **질문** + "추천 보기" 답변 |
| 3 | **Grill-Me 질문 사다리** | 질문 + 의도 + RAG + 현재 단계 | 단계별 **질문** + 추천 답변 (접이식) |
| 4 | **교사용 요약** | 질문 로그 배치 | 자주 막히는 개념 + 오개념 패턴 + 빈도 |

### D-3. AI가 하지 않는 일

- 성적 확정, 답 100% 보장, 부정행위 판정, 감정 분석, 생기부 자동 작성

### D-4. AI 동작 원칙

1. 수업 자료 기반 우선 응답
2. **정답 직출 금지 — AI는 질문을 던짐**
3. Grill-Me 질문 사다리 (4단계)
4. 매 질문에 "추천 보기" 제공 (학생이 막히면)
5. 교사용 로그 요약 제공
6. 근거 부족 시 명시
7. 출처/근거 항상 표시 (📚 수업자료 근거)
8. 감사 로그는 v2에서 도입 (MVP 미구현)

---

<!-- @extract-to: SCHEMA.md -->
## §E. 데이터 모델

### E-1. 최소 엔티티 (7개)

```
users ─┬─< lessons ─┬─< lesson_materials
       │            ├─< lesson_quick_answers
       │            ├─< misconception_summaries
       │            └─< sessions ─< student_questions ─< ai_responses
       ├─< sessions
       └─< student_questions
```

### E-2. 테이블 정의

**users**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| role | enum('teacher','student') | |
| name | text | |
| created_at | timestamp | |

**lessons**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| teacher_id | uuid FK→users | |
| title | text | |
| subject | text | 기본값 'math' |
| topic | text | |
| created_at | timestamp | |

**lesson_materials**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| file_name | text | |
| file_url | text | |
| extracted_text | text | 파싱 결과 (MVP: 전체 주입) |
| chunk_text | text | nullable — v2 청킹용 |
| chunk_index | integer | default 0 — v2 청킹 순서 |
| embedding | vector(1536) | nullable — v2 벡터검색 (pgvector) |
| created_at | timestamp | |

**lesson_quick_answers**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| trigger_phrase | text | Quick-Me 자동 전환/매칭 기준 표현 |
| question_pattern | text | 자주 나오는 질문 패턴 |
| answer_text | text | 빠른답변 캐시 본문 |
| concept_name | text | nullable |
| usage_count | integer | default 0 |
| created_at | timestamp | |

**sessions**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| student_id | uuid FK→users | |
| current_mode | enum('grill-me','guide-me','quick-me') | 기본값 'grill-me' |
| current_step | integer | 기본값 1 |
| consecutive_wrong | integer | 기본값 0 |
| quiz_question | text | nullable |
| quiz_answer | text | nullable |
| quiz_passed | boolean | nullable |
| summary_text | text | nullable |
| next_recommendation | text | nullable |
| summary_concepts | text[] | nullable |
| started_at | timestamp | |
| ended_at | timestamp | nullable |

**student_questions**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| student_id | uuid FK→users | |
| session_id | uuid FK→sessions | nullable |
| question_text | text | |
| image_url | text | nullable |
| intent_type | enum('concept','hint','review','similar') | |
| created_at | timestamp | |

**ai_responses**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| question_id | uuid FK→student_questions | |
| response_type | enum('hint','explanation','feedback','similar','quiz','summary') | |
| response_text | text | |
| grounded_flag | boolean | 자료 근거 여부 |
| misconception_type | smallint | nullable — 1~5 오개념 유형 |
| created_at | timestamp | |

**misconception_summaries**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| concept_name | text | |
| frequency | integer | |
| summary_text | text | |
| created_at | timestamp | |

**제약**
- `sessions.current_step` 1~4 범위 유지
- `sessions.consecutive_wrong` 0 이상
- `misconception_summaries (lesson_id, concept_name)` unique — 같은 수업/개념 조합은 UPSERT

### E-3. 제외 테이블

billing, organization, classroom_membership, guardian, notification, audit_log (대규모)

---

<!-- @extract-to: RAG-PIPELINE.md -->
## §F. RAG 파이프라인

### F-1. 지식 소스

- 교사가 올린 수업 자료 (PDF/이미지/텍스트)
- 교사가 입력한 수업 주제/핵심 개념

### F-2. 처리 흐름 (확장성 고려)

**MVP (Context Stuffing):**
```
업로드 → 텍스트 추출 (pdf-parse / gray-matter+remark)
  → extracted_text를 DB에 저장
  → 학생 질문 시 해당 수업의 전체 텍스트를 프롬프트에 주입
```

**v2 (벡터 검색 — 스위치 전환):**
```
업로드 → 텍스트 추출 → 청킹 → 임베딩 → pgvector 저장
  → 학생 질문 → 임베딩 → match_chunks() → top 3 → 프롬프트 주입
```

**확장 준비 완료:** pgvector 활성화, embedding 컬럼 존재, match_chunks RPC 생성됨. 코드에서 `USE_VECTOR_SEARCH` 스위치 1개로 전환.

### F-3. Chunking 전략 (v2용, 미리 설계)

| 전략 | 파라미터 | 적용 |
|------|----------|------|
| Recursive Character Splitting | 512 tokens, 15% overlap | PDF 기본값 |
| **헤딩 기준 자연 분할** | #/## 경계 | Obsidian .md |
| 수식 블록 단위 | 문제-풀이-해설 같은 chunk | 수학 특화 |

### F-4. 응답 원칙

- 자료 근거 있으면 → 근거 기반 응답 + `grounded_flag: true`
- 자료 근거 부족 → "수업 자료 기준으로는 확실하지 않습니다" + `grounded_flag: false`
- 환각 방지 문구 항상 포함

### F-5. 제외

- 전 인터넷 검색, 자동 웹 브라우징, 유튜브 크롤링, 외부 논문 검색

---

<!-- @extract-to: WIREFRAME.md, ROUTE-MAP.md -->
## §G. 페이지 & 라우트

### G-1. MVP 페이지 (5개)

| ID | 페이지 | 경로 | 역할 |
|----|--------|------|------|
| P-001 | 랜딩 | `/` | 교사/학생 역할 선택 |
| P-002 | 교사 자료 등록 | `/teacher/upload` | 수업자료 업로드 + 주제 입력 |
| P-003 | 학생 질문 | `/student/ask` | 질문 입력 + AI 응답 |
| P-004 | 교사 대시보드 | `/teacher/dashboard` | 오개념 히트맵 + 질문 로그 |
| P-005 | 결과/요약 | `/student/summary` | 세션 요약 |

### G-2. 보류 페이지

- 로그인, 마이페이지, 학급관리, 설정, 관리자페이지
- **로그인 없이 데모 가능한 구조** (teacher/student 버튼으로 역할 분기)

### G-3. API 라우트맵

| 페이지 | 프론트 라우트 | 백엔드 API | 메서드 |
|--------|-------------|-----------|--------|
| P-001 | `/` | — | static |
| P-002 | `/teacher/upload` | `/api/lessons` | POST |
| P-002 | `/teacher/upload` | `/api/materials/upload-url` | POST |
| P-002 | `/teacher/upload` | `/api/materials/upload` | POST |
| P-003 | `/student/ask` | `/api/sessions` | POST |
| P-003 | `/student/ask` | `/api/questions/image` | POST |
| P-003 | `/student/ask` | `/api/questions` | POST |
| P-003 | `/student/ask` | `/api/questions/[id]/respond` | POST |
| P-003 | `/student/ask` | `/api/sessions/[id]/quiz` | POST |
| P-003 | `/student/ask` | `/api/sessions/[id]/quiz/grade` | POST |
| P-004 | `/teacher/dashboard` | `/api/lessons/[id]/dashboard` | GET |
| P-004 | `/teacher/dashboard` | `/api/lessons/[id]/misconceptions` | POST |
| P-005 | `/student/summary` | `/api/sessions/[id]/summary` | GET |

---

<!-- @extract-to: AI-REPORT-DRAFT.md -->
## §H. 심사 기준 대응

| 심사 기준 | 대응 기능 | 어필 포인트 | 정량 근거 |
|----------|----------|------------|----------|
| **기술적 완성도** | 업로드→Grill-Me 질문→대시보드 end-to-end | 3분 데모로 전체 흐름 시연 | — |
| **AI 활용 능력** | 의도 분류, Grill-Me 질문 사다리, 오개념 클러스터링, 하이브리드 로컬/클라우드 | 4가지 AI 역할 + Claude Code SSOT 협업 + 토큰 효율화 5전략 | 출력 토큰 70% 감소 (질문형) |
| **기획력·실무 접합성** | 학생 막힘 해소, 교사 보충 개입, API $0 (Gemma 4) | AIDT 보완재 + 비용 제로 + 프라이버시 | Khanmigo 0.23SD 향상 |
| **창의성** | Grill-Me 질문법 + Obsidian RAG + 하이브리드 Gemma 4 | 콴다의 안티테제 + 로컬 AI 교육 | 학생 68% 소크라틱 선호 |

> ※ AI와 기획한 기획문서, 지침서를 프로젝트 내부에 포함 권장 (메일 명시)
> → `docs/`, `ai-context/`, `CLAUDE.md`, `overview.md` 전부 GitHub에 포함됨

---

<!-- @extract-to: CLAUDE.md -->
## §I. 금지 사항 & 원칙

### I-1. 절대 금지

- 범위 욕심내서 기능 늘리기
- 전과목 지원 척하기
- AI가 모든 걸 알아서 하는 척하기
- 데이터 없는 상태에서 과한 분석 시각화
- 복잡한 권한체계
- 모바일/웹/태블릿 동시 완벽 대응

### I-2. 게임화 정책

| 구분 | 내용 | 이유 |
|------|------|------|
| **금지 (강한 게임화)** | 리더보드, 코인, 캐릭터, 출석 보상, 경쟁 랭킹 | 신뢰성·교사 통제권·보충 개입 메시지를 흐림. 로그인 없는 데모 구조와 불일치. "신나게 붙잡아 두는 서비스"가 아님 |
| **허용 (mastery 마이크로 UX)** | 질문 사다리 진행도(1/4→4/4), 미니퀴즈 통과 시 "오개념 회복" 배지, 오늘 해결한 막힘 수, 교사용 회복률 카드 | 경쟁이 아닌 즉각 피드백·자기조절·작은 성취감. metacognitive trigger + immediate feedback + context alignment |

> **최종 방향:** 강한 게임화 ❌ / 가벼운 mastery UX ⭕ / 라이브 폐쇄 루프 데모 강화 ⭕
> 심사위원은 귀여운 재미보다 **"왜 이 AI가 현장에서 바로 먹히는지"**에 반응한다.

### I-3. 핵심 원칙

- 적은 기능, 강한 데모
- 분명한 pain point
- AI가 왜 필요한지 설명 가능
- 실제로 작동하는 흐름 우선

---

<!-- @extract-to: ARCHITECTURE.md -->
## §J. 기술스택 & 설정

### J-1. 기술스택 (확정)

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프론트 | Next.js (latest) + TypeScript | App Router, `src/` 구조 |
| UI | Tailwind CSS + shadcn/ui | Geist Sans/Mono, 라이트모드 (웜 모노크로매틱) |
| DB | Supabase (Postgres + pgvector + Storage) | 벡터검색 + 파일 저장 |
| AI (공모전) | OpenAI via Vercel AI Gateway | 10만원 크레딧 보유 |
| AI (프로덕션) | **Gemma 4 E4B** (Ollama/WebGPU) | 로컬 실행, API 비용 $0 |
| 임베딩 | `openai/text-embedding-3-small` (1536d) | $0.02/1M |
| 파일 파싱 | `pdf-parse` + `gray-matter`/`remark` (Obsidian .md) | |
| 배포 | Vercel | 자동 배포 |
| 수식 렌더링 | KaTeX (→MathJax fallback) | |

### J-2. AI 모델 전략

**공모전:** OpenAI `gpt-4o-mini` (10만원 크레딧, 안정적)

**프로덕션 (비용 $0 목표):**

| 용도 | 모델 | 환경 | 비용 |
|------|------|------|------|
| 기본 튜터링 (60-70%) | **Gemma 4 E4B** (4-bit, ~5GB) | 학생 노트북 Ollama/WebGPU | **$0** |
| 기본 튜터링 (폰) | **Gemma 4 E2B** (4-bit, ~3GB) | 학생 폰 LiteRT-LM | **$0** |
| 복잡한 요청 (30-40%) | OpenAI/Gemini API | 클라우드 fallback | 종량제 |

**Gemma 4 핵심:** AIME 수학 89.2%, Apache 2.0, 128K 컨텍스트, 텍스트+이미지+오디오, 한국어 네이티브, Ollama Day-0 지원

**하이브리드 라우팅:**
```
학생 질문 → Task Router (JS 규칙)
  ├─ 단순 → Gemma 4 로컬 ($0)
  └─ 복잡 → Cloud API (fallback)
  └─ WebGPU 미지원 → 자동 Cloud
```

### J-3. Obsidian .md RAG 지원

| 항목 | PDF | Obsidian .md |
|------|-----|-------------|
| 파싱 품질 | 깨짐 가능 | **100% 정확** |
| 구조화 | 비구조적 | **헤딩 자연 청킹** |
| 메타데이터 | 없음 | **YAML frontmatter** |
| 개념 관계 | 없음 | **`[[위키링크]]` 추출** |

### J-4. 디자인 톤

- 깔끔한 에듀 SaaS 톤
- 신뢰감 + 친절함 중심
- 라이트모드 웜 모노크로매틱 (#faf9f7 배경, #000000 primary, accent 없음)
- Geist Sans (UI) + Geist Mono (코드/수식)

---

<!-- @extract-to: DEMO-SCENARIO.md -->
## §K. 시연 시나리오

### K-1. 데모 흐름 (3분)

| 순서 | 화면 | 행동 | 기대 결과 |
|------|------|------|----------|
| 1 | 랜딩 | "교사로 시작" 클릭 | 교사 업로드 페이지 |
| 2 | 교사 업로드 | "이차방정식" PDF 업로드 + 주제 입력 | "지식베이스 생성 완료" |
| 3 | 랜딩 | "학생으로 시작" 클릭 | 학생 질문 페이지 |
| 4 | 학생 질문 | 문제 사진 업로드 + "이 문제 어떻게 풀어요?" | AI가 힌트 제공 (정답 아님) |
| 5 | 학생 질문 | "인수분해를 어떻게 해요?" 재질문 | 개념 설명 + 유사문항 |
| 6 | 교사 대시보드 | 교사로 전환 | 히트맵에 "인수분해 단계에서 막힘" 표시 |

### K-2. 데모 방식

- 로그인 없이 역할 선택 버튼으로 진행
- teacher / student 토글

---

<!-- @extract-to: DOMAIN-KNOWLEDGE.md -->
## §L. 도메인 지식

### L-1. 수학 오개념 연구

| 오류 유형 | 빈도 |
|----------|------|
| 왜곡된 정리/정의 적용 | 29.66% |
| 기술적 오류 (계산/부호) | 21.91% |
| 풀이 과정 생략 | 18.13% |

**AI 탐지 성과:** GPT-4 기반 오개념 분류 최대 83.9% 정확도, Step-level 자동 수정 약 70% F1

### L-2. 힌트 기반 튜터링 효과 (Khanmigo)

| 지표 | 효과 |
|------|------|
| 수학 성취도 (주 30분+) | **0.23 SD 향상** (50→59 percentile) |
| 대수 준비도 | **0.15 SD 향상** |
| ELL 수학 성취 | **0.31 SD 향상** |
| 소크라틱 선호도 | 학생 68%가 ChatGPT보다 선호 |

**주의:** 구조적 페이딩 실패 위험 (불필요 시에도 힌트 지속 제공) → 적응적 지원 철회 설계 필요

### L-3. RAG 교육 시스템 벤치마크

| 시스템 | 성과 |
|--------|------|
| Coursera Coach | 퀴즈 통과율 9.5%↑, 수업 완료 11.6%↑ |
| LPITutor | 정적 대비 환각 감소 |
| OwlMentor | 2학기 연속 적용 성공 |

**Chunking:** Recursive 512 tokens / 15% overlap 기본, 수식은 블록 단위

### L-4. 수식 처리 기술

- LLM LaTeX 정확도: 복잡한 수식 **15%** (TeXpert)
- **해결:** KaTeX 렌더링 + CoT prompting + CAS(SymPy) 위임 + 검증 루프

### L-5. 교사 대시보드 디자인

**4원칙:** Simplify (상위 3-5개만) → Prioritize (핵심 KPI 상단) → Contextualize (오류 유형 구분) → Integrate (여백으로 인지 부하 감소)

**필수:** 대시보드 해석 안내, 실행 가능한 피드백 ("이 학생들 그룹 보충수업"), 교사 참여 설계

### L-6. 한국 교육 AI 정책 (2025-2026)

- AIDT 2학기 채택률 **58.8% 급감** → 법적 지위 '교과서'→'교육자료' 격하
- 교사 87%: "의견 반영 부족"
- **시사점:** "수업 후 보충" 영역은 AIDT가 약한 틈새 → 우리 기회

---

<!-- @extract-to: DOMAIN-KNOWLEDGE.md -->
## §M. 현장 검증 & 리스크

### M-1. 검증된 전제

| 전제 | 근거 | 제품 시사점 |
|------|------|-----------|
| 교사 행정 업무 과다 | TALIS 2024: OECD 평균 초과 | 교사 업무 절감이 도입 동기 |
| 학생 질문 저해 | KCI 2025: 환경/평가 걱정/자신감/동기 | 익명 질문, 단계형 템플릿 필요 |
| 도입 마찰 심각 | AIDT 로그인·기기 점검이 수업 잠식 | **"30초 내 수업 시작"** 목표 |
| 교사 통제권 = 채택 관문 | UTAUT 연구 | 모든 AI 출력에 교사 승인 |

### M-2. 리스크 & 대응

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| AI 환각 (잘못된 힌트) | 🔴 치명적 | 출처 표시 + 교사 검토 + 오류 신고 + 감사 로그 |
| 개인정보 (미성년 데이터) | 🔴 치명적 | 수집 최소화 + 목적 제한 + 데모 단계부터 준수 |
| 평가 공정성 논란 | 🟡 높음 | "과제 대행" 아닌 "학습 보조"로 명확히 포지셔닝 |
| 수식 렌더링 오류 | 🟡 높음 | KaTeX + MathJax fallback + CAS 검증 |
| 로그인/접속 마찰 | 🟡 높음 | 로그인 없는 데모 모드, 교사 일괄 제어 |
| ZPD 이탈 (질문 난이도 부적절) | 🟡 높음 | **3회 오답 → Guide-Me 자동 전환** (적응적 난이도) |
| 수학 입력 UX 마찰 | 🟡 높음 | 사진 OCR 질문 지원, 텍스트 + 이미지 멀티모달 |
| 국외 데이터 이전 (OpenAI) | 🟡 높음 | Gemma 4 로컬 모드 = 데이터 외부 전송 없음 |
| LMS 비호환 (NEIS/e학습터) | 🟢 중간 | v2 로드맵: CSV 내보내기 → API 연동 |

### M-3. 개인정보영향평가(PIA) 계획

| 항목 | MVP 대응 | v2 대응 |
|------|---------|---------|
| 수집 최소화 | 이름 + 역할만 (로그인 없음) | 학교 계정 연동 시 최소 필드 |
| 미성년 데이터 | 보호자 동의 프로세스 문서화 | 학교 단위 동의 체계 |
| 국외 이전 | Gemma 4 로컬 옵션 제공 | 국내 클라우드 (네이버/카카오) 옵션 |
| 보관 기간 | 학기 종료 시 자동 삭제 | 교사가 보관 기간 설정 |
| 접근 권한 | 역할 선택 기반 UI 가드 (데모용, 보안 경계 아님) | RBAC 역할 기반 접근 |

### M-4. 실행 권고 (8개 페르소나 분석 기반)

1. MVP 첫 화면 **"수업 시작까지 30초"** (로그인 최소화, 교사 일괄 제어)
2. 학생 기능은 **'답변'보다 '질문 생성·진단' 우선**
3. **교사 통제권 = 제품 핵심 가치** (근거/출처/승인 중심, 감사 로그는 v2)
4. **개인정보 = MVP 선행 조건** (수집 최소화, 데모 단계부터 준수)
5. 환각 방어: **출처 제시 + 교사 검토 + 오류 신고 루프**
6. **적응적 모드 전환**: 기본 Grill-Me → 3회 오답 시 Guide-Me → 긴급 시 Quick-Me
7. **대화 프로그레스 바**: "질문 2/4" 표시로 무한 질문 느낌 제거
8. **"데이터 로컬 처리" 강조**: Gemma 4 로컬 = 학생 데이터 외부 미전송 → 학부모 신뢰

---

<!-- @extract-to: SUBMISSION-CHECKLIST.md -->
## §N. 공모전 제출 요건

### N-1. 일정

| 구분 | 일정 | 비고 |
|------|------|------|
| 개발기간 | 04/06(월)~**04/13(월)** | D-7 |
| 심사 | 04/14(화)~04/16(목) | 3일간 |
| 결과 발표 | 04/16(목) | 개별 연락 |
| 시상식 | 04/25(토) | |

### N-2. 제출물 체크리스트

- [ ] GitHub public 저장소 (API Key 노출 금지)
- [ ] 배포된 라이브 URL
- [ ] AI 빌딩 리포트 (docx 양식 → PDF)
- [ ] 개인정보 동의서 + 참가 각서 (서명 PDF)

### N-3. AI 리포트 양식 핵심

1. 사용자/문제점 정의
2. 핵심 기능
3. 기대 효과
4. AI 도구별 활용 전략 (페르소나, 에이전트 구성, 데이터 흐름)
5. 토큰 효율화 전략

### N-4. 심사 기준

- 기술적 완성도
- AI 활용 능력 및 효율성
- 기획력 및 실무 접합성
- 창의성

### N-5. 주의사항

- 제출 기한(04/13) 이후 접수 = 심사 제외
- 기한 이후 Commit = 부정행위 → 탈락
- AI 기획문서/지침서를 프로젝트에 포함 권장

---

## 출처

[1]: https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=295&boardSeq=100317
[2]: https://ai.ebs.co.kr/
[3]: https://www.classting.com/
[4]: https://qandahelp.qanda.ai/hc/en-us/articles/32992015661337
[5]: https://www.lguplus.com/biz/all/product-service/metaverse/superschool/B000000140
[6]: https://www.khanacademy.org/khan-labs
[7]: https://blog.duolingo.com/beginner-video-call-with-falstaff/
[8]: https://www.coursera.org/explore/coach
[9]: https://edu.google.com/workspace-for-education/products/classroom/
[10]: https://quizlet.com/blog/meet-q-chat
[11]: https://blog.khanacademy.org/learner-khanmigo/
[12]: https://blog.khanacademy.org/teacher-khanmigo/
[13]: https://blog.classting.com/2026-ai-jungjeomhaggyo-dijiteolseondohaggyoreul-wihan-keulraeseuting-ai-sinjepum-3jong/
