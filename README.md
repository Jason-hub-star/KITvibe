# 풀다 AI

> **막힘을 질문으로 풀다.**
> 교사의 수업자료에 근거해 학생의 막힘 지점을 AI로 해결하고, 교사에게는 오개념 대시보드를 제공하는 수업 후 보충 AI 코치.

[![배포 상태](https://img.shields.io/badge/Vercel-배포됨-black?logo=vercel)](https://vibecoding-two-jade.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![2026 KIT 바이브코딩 공모전](https://img.shields.io/badge/KIT_바이브코딩-2026-orange)](https://github.com/Jason-hub-star/KITvibe)

**[라이브 데모 →](https://vibecoding-two-jade.vercel.app)**

---

## 문제 정의

학교 수업 후 학생이 혼자 복습하다 막히면 — **아무도 없다.**

- 교사는 수업이 끝난 뒤 개별 지도 여력이 없음
- 검색·유튜브는 정답을 그냥 알려줘서 이해 없이 넘어감
- 오개념이 쌓여도 교사는 어디서 막히는지 파악이 어려움

---

## 핵심 기능

### 학생
| 기능 | 설명 |
|------|------|
| **Grill-Me 질문법** | 정답 대신 단계별 질문으로 학생 스스로 답을 찾도록 유도 (4단계: 접근법 → 핵심개념 → 유사문제 → 풀이설명) |
| **수업자료 RAG** | 교사가 업로드한 PDF를 기반으로만 응답 (할루시네이션 차단) |
| **멀티모달 입력** | 텍스트 + 사진(풀이 노트 등) 질문 지원 |
| **미니퀴즈** | 세션 마지막에 1문항 자기 점검, 오개념 회복 확인 |
| **모드 전환** | Grill-Me(기본) / Guide-Me(단계 설명) / Quick-Me(즉시 풀이) |

### 교사
| 기능 | 설명 |
|------|------|
| **수업자료 업로드** | PDF → 자동 임베딩 → 지식베이스 구축 |
| **오개념 히트맵** | 학생들이 어디서 막히는지 실시간 시각화 |
| **질문 로그** | 누가 어떤 질문을 했는지 전체 조회 |
| **세션 통계** | 질문 수, 도달 단계, 모드 분포 요약 |

---

## 기술 스택

```
Frontend       Next.js 16 (App Router, Turbopack) + Tailwind CSS + shadcn/ui
AI             OpenAI gpt-4o-mini (tutor) + text-embedding-3-small (RAG)
               Vercel AI SDK · AI Gateway · 스트리밍 응답
Database       Supabase (PostgreSQL + pgvector)
Infra          Vercel (Edge + Serverless Functions)
Font           Geist Sans / Geist Mono
```

### AI 전략

- **3-tier 모델**: Sonnet (메인) · Haiku (서브에이전트) · Opus (아키텍처 설계)
- **로컬 LLM 대비**: Ollama + Gemma 4 E4B 로컬 라우팅 준비 완료 (`AI_TUTOR_PROVIDER=ollama`)
- **RAG 파이프라인**: PDF → `pdf-parse` → `text-embedding-3-small` → pgvector → 코사인 유사도 검색

---

## 라우트 구조

```
/                       랜딩 — 역할 선택 (교사 / 학생)
/teacher/upload         수업자료 업로드 + 수업 생성
/teacher/dashboard      오개념 히트맵 + 질문 로그
/student/ask            수업 선택 → AI 채팅
/student/summary        세션 요약 + 다음 추천 행동
```

---

## 로컬 실행

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# OPENAI_API_KEY

# 3. DB 마이그레이션 (Supabase)
# supabase/migrations/ 폴더의 SQL을 Supabase Dashboard에서 실행

# 4. 개발 서버 시작
npm run dev
# → http://localhost:3000
```

### 환경변수 목록

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `AI_TUTOR_PROVIDER` | — | `openai`(기본) / `ollama` |
| `AI_TUTOR_OLLAMA_MODEL` | — | 로컬 모델명 (예: `gemma4-unsloth-e4b:latest`) |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (pages)/             라우트별 페이지
│   ├── api/                 API 라우트 (questions, sessions, lessons, users...)
│   └── globals.css          디자인 토큰 (Stitch 에디토리얼 시스템)
├── components/
│   ├── layout/              헤더, 역할 선택, 푸터
│   ├── student/             채팅 UI, 메시지 버블, 모드 선택기
│   └── teacher/             업로드 폼, 대시보드 카드
├── hooks/                   useQuestionChat (스트리밍 + 모드 제어)
├── lib/
│   └── ai/provider.ts       AI 모델 선택 중앙화
└── types/                   공유 타입 정의
```

---

## 디자인 시스템

Stitch 에디토리얼 스타일 — 웜 모노크로매틱 팔레트

- **배경**: `#faf9f7` (웜 화이트)
- **Primary**: `#222222` (그래파이트)
- **타이포**: `ui-kicker` · `ui-micro` · `ui-support` semantic 유틸리티

---

## 공모전 정보

- **대회**: 2026 KIT 바이브코딩 공모전
- **주제**: AI 활용 차세대 교육 솔루션
- **팀**: 김주영 (개인)
- **개발 기간**: 2026-04-06 ~ 2026-04-13

---

## 라이선스

MIT
