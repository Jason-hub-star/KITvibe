# Architecture — 풀다 AI

> 원본: overview.md §J

## 기술스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프레임워크 | Next.js (latest) + TypeScript | App Router, `src/` 구조 |
| UI | Tailwind CSS + shadcn/ui | Geist Sans/Mono, 라이트모드 (웜 모노크로매틱) |
| DB | Supabase (Postgres + pgvector + Storage) | 벡터검색 + 파일 저장 |
| AI (공모전) | OpenAI via Vercel AI Gateway | 10만원 크레딧 |
| AI (프로덕션) | **Gemma 4 E4B** (Ollama/WebGPU) | 로컬, API $0 |
| 임베딩 | `openai/text-embedding-3-small` (1536d) | $0.02/1M |
| 파일 파싱 | `pdf-parse` + `gray-matter`/`remark` (.md) | |
| 배포 | Vercel | 자동 배포, Preview URL |
| 수식 렌더링 | KaTeX → MathJax fallback | |

## AI 모델 전략

**공모전:** OpenAI `gpt-4o-mini` (10만원 크레딧)

**프로덕션 하이브리드:**
```
학생 질문 → Task Router (JS 규칙)
  ├─ 단순 (의도분류, 기본질문, 격려) → Gemma 4 E4B 로컬 ($0)
  └─ 복잡 (RAG 상세설명, 교사요약) → Cloud API (fallback)
  └─ WebGPU 미지원 → 자동 Cloud
```

**Gemma 4 핵심:** AIME 89.2%, Apache 2.0, 128K ctx, E4B ~5GB (4-bit)

## 시스템 구조

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│    Browser      │────▶│  Next.js     │────▶│  OpenAI / AI GW │
│ (React + WebGPU)│◀────│  App Router  │◀────│  (공모전 모드)    │
│ [Gemma 4 로컬]  │     └──────┬───────┘     └─────────────────┘
└─────────────────┘            │
                        ┌──────┴───────┐
                        │   Supabase   │
                        │  ┌─────────┐ │
                        │  │Postgres │ │
                        │  │pgvector │ │
                        │  │Storage  │ │
                    │  └─────────┘ │
                    └──────────────┘
```

## 데이터 흐름

### 교사 자료 업로드
```
브라우저 → signed upload URL 발급 → Supabase Storage direct upload
  → 서버 후처리 → 텍스트 추출 (OCR/파싱)
  → 청킹 (512 tokens, 15% overlap) → 임베딩 → pgvector 저장
```

### 학생 질문 처리
```
질문 입력 → 임베딩 → pgvector 유사도 검색 → 상위 chunk
  → 시스템 프롬프트 + chunk + 질문 → AI Gateway → 스트리밍 응답
```

### 로컬 LLM 전환 준비
```
기본값: OpenAI 유지
  └─ env 미설정 시 기존 기능 영향 없음

비교 모드:
  AI_TUTOR_PROVIDER=ollama
  AI_TUTOR_OLLAMA_MODEL=gemma4-unsloth-e4b:latest
  OLLAMA_BASE_URL=http://127.0.0.1:11434/v1

점검:
  npm run ai:runtime-check

안전한 A/B 테스트:
  기본: env 없이 실행 = 기존 OpenAI 그대로
  비교: AI_TUTOR_PROVIDER=ollama 만 켜서 튜터링만 로컬 모델로 전환
  권장 확인: Quick-Me 즉답, Grill-Me 질문 유지, 태그 누락 여부, 수업 맥락 이탈 여부
```

### 오개념 대시보드
```
질문 로그 배치 → AI 요약 (개념별 빈도/패턴) → misconception_summaries 저장
  → 교사 대시보드 렌더링 (히트맵 + TOP 5)
```

## 디자인 시스템

- **톤:** 에디토리얼 아카데믹, 신뢰감 + 절제
- **색상:** 라이트모드 웜 모노크로매틱 (#faf9f7 배경, #000000 primary, accent 없음)
- **폰트:** Geist Sans (UI) + Geist Mono (코드/수식/ID)
- **반경:** 직각 미학 (--radius: 0.125rem)
- **참조:** `docs/design/DESIGN-TOKENS.md` (Stitch HTML 추출 토큰)

## 폴더 구조 (예정)

```
app/
├── page.tsx                    # P-001 랜딩
├── teacher/
│   ├── upload/page.tsx         # P-002 자료 등록
│   └── dashboard/page.tsx      # P-004 대시보드
├── student/
│   ├── ask/page.tsx            # P-003 질문
│   └── summary/page.tsx        # P-005 요약
└── api/
    ├── lessons/route.ts
    ├── materials/upload-url/route.ts
    ├── materials/upload/route.ts
    ├── questions/route.ts
    └── ...
```

## v2 로드맵: Edge API 서버 아키텍처

```
[학교 내 온프레미스 서버]
  Gemma 4 26B A4B (Ollama)
       ↑
[학생 기기 (경량 클라이언트)]
  브라우저만 필요, LLM 설치 불필요
       ↑
[교사 관리 콘솔]
  모델 버전, 프롬프트, 접근 권한 제어
```

**장점:** 학생 기기 사양 무관, 데이터 학교 밖 미전송, GPU 서버 1대로 30명 동시 처리
**필요 사양:** RTX 3060 12GB 이상 (26B MoE 4-bit ≈ 18GB)
**MVP에서는 미구현** — Vercel 클라우드 + 학생 기기 WebGPU(Gemma 4 E4B)로 대체
