# components/ — 순수 UI

> **프론트엔드 전용.** 비즈니스 로직, DB 접근, AI 호출 금지.

## 규칙

- shadcn/ui 컴포넌트 우선 사용 (`ui/` 폴더)
- `'use client'`는 상태/이벤트 필요한 컴포넌트에만
- props로 데이터 받기 (자체 fetch 금지)
- 디자인 토큰: Tailwind 변수 사용 (하드코딩 hex/px 금지)
- 파일명: `PascalCase.tsx`

## 하위 폴더

| 폴더 | 역할 | 예시 |
|------|------|------|
| `ui/` | shadcn/ui 설치 컴포넌트 | `button.tsx`, `card.tsx` |
| `layout/` | 공통 레이아웃 | `Header.tsx`, `RoleProvider.tsx` |
| `teacher/` | 교사 전용 UI | `LessonForm.tsx`, `MisconceptionHeatmap.tsx` |
| `student/` | 학생 전용 UI | `QuestionChat.tsx`, `HintBadge.tsx`, `RecommendationReveal.tsx` |
| `common/` | 공유 UI | `LoadingSpinner.tsx`, `ErrorFallback.tsx` |
