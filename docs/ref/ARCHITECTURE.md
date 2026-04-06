# Architecture — MathTutor AI

> 원본: overview.md §J

## 기술스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프레임워크 | Next.js 16 + TypeScript | App Router, Server Components |
| UI | Tailwind CSS + shadcn/ui | Geist Sans/Mono, 다크모드 |
| DB | Supabase (Postgres) | pgvector for 임베딩 |
| AI | Vercel AI Gateway | OIDC 인증, provider 무관 |
| 벡터검색 | pgvector | Supabase 내장 |
| 배포 | Vercel | 자동 배포, Preview URL |
| 수식 렌더링 | KaTeX → MathJax fallback | |

## 시스템 구조

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js 16  │────▶│  Vercel AI GW   │
│ (React SPA) │◀────│  App Router  │◀────│  (LLM 라우팅)    │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
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
PDF/이미지 → Supabase Storage → 텍스트 추출 (OCR/파싱)
  → 청킹 (512 tokens, 15% overlap) → 임베딩 → pgvector 저장
```

### 학생 질문 처리
```
질문 입력 → 임베딩 → pgvector 유사도 검색 → 상위 chunk
  → 시스템 프롬프트 + chunk + 질문 → AI Gateway → 스트리밍 응답
```

### 오개념 대시보드
```
질문 로그 배치 → AI 요약 (개념별 빈도/패턴) → misconception_summaries 저장
  → 교사 대시보드 렌더링 (히트맵 + TOP 5)
```

## 디자인 시스템

- **톤:** 깔끔한 에듀 SaaS, 신뢰감 + 친절함
- **색상:** zinc 기반, 1개 accent color
- **폰트:** Geist Sans (UI) + Geist Mono (코드/수식/ID)
- **모드:** 다크모드 우선

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
    ├── materials/upload/route.ts
    ├── questions/route.ts
    └── ...
```
