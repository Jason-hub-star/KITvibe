# MathTutor AI

> 수업 후 학생의 막힘 지점을 힌트형 AI로 해결하고, 교사에게는 오개념 heatmap을 제공하는 수학 학습 보조 MVP

## Loading Order

1. `CLAUDE.md` (이 파일)
2. `docs/status/PROJECT-STATUS.md`
3. `docs/ref/PRD.md`
4. 필요 시: `docs/ref/ARCHITECTURE.md`, `docs/ref/SCHEMA.md`, `docs/ref/PROMPT-DESIGN.md`
5. 검색: `ai-context/`, `docs/ref/`, `docs/demo/`

## Hard Rules

1. **관련 파일 먼저 읽기** — 수정 전 반드시 대상 파일 확인
2. **변경 목적 먼저 명시** — 왜 바꾸는지 한 줄 설명 후 작업
3. **파괴적 git 조작 금지** — force push, reset --hard, branch -D 금지
4. **구현 후 검증** — `npm run lint && npm run typecheck && npm run build`
5. **문서 동기화** — 구조적 변경 시 docs/ 관련 문서 업데이트
6. **overview.md = SSOT** — 제품 정의/범위는 overview.md가 진실 소스

## 범위 잠금

- **과목:** 수학만
- **페이지:** 5개 (랜딩, 교사 업로드, 학생 질문, 교사 대시보드, 결과 요약)
- **AI 역할:** 4개 (의도 분류, 자료 기반 응답, 힌트형 응답, 교사용 요약)
- **입력:** 텍스트 + 이미지 1장
- **마감:** 2026-04-13

## 절대 금지

- 범위 욕심내서 기능 늘리기
- 전과목 지원 척하기
- 강한 게임화 (리더보드, 코인, 캐릭터, 경쟁 랭킹)
- 데이터 없는 상태에서 과한 시각화
- 복잡한 권한체계
- 정답 직출 (항상 힌트 우선)

## 허용하는 가벼운 UX

- 힌트 사다리 진행도 (1/4→4/4)
- 미니퀴즈 통과 시 "오개념 회복" 배지
- 오늘 해결한 막힘 수
- 교사용 회복률 카드

## 기술스택

- Next.js 16 + TypeScript + Tailwind + shadcn/ui
- Supabase (Postgres + pgvector)
- Vercel AI Gateway (OIDC)
- KaTeX (수식 렌더링)
- Vercel 배포

## 검증 명령

```bash
npm run lint
npm run typecheck
npm run build
```
