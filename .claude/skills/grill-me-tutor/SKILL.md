---
name: grill-me-tutor
description: Grill-Me 소크라틱 질문법으로 학생 튜터링 코드를 작성할 때 참조하는 스킬. AI가 답변 대신 질문을 던지는 패턴 강제.
metadata:
  filePattern: ["**/student/**", "**/ask/**", "**/question*", "**/chat*", "**/hint*"]
  bashPattern: []
---

# Grill-Me 튜터링 패턴

## 핵심 원칙

- AI는 **답변이 아닌 질문**을 던진다
- 매 질문에 `[RECOMMENDATION]` 태그로 추천 답변 제공
- 프로그레스 바: "질문 N/4" 표시 필수
- 3회 연속 오답 → `[MODE_SWITCH: guide-me]` 자동 전환

## 질문 사다리 4단계

| 단계 | AI 동작 | 프롬프트 키 |
|------|---------|-----------|
| 1 | 접근법 질문 | `GRILL_ME_STEP_1` |
| 2 | 핵심 개념 질문 | `GRILL_ME_STEP_2` |
| 3 | 유사 문제 질문 | `GRILL_ME_STEP_3` |
| 4 | 풀이 설명 요청 | `GRILL_ME_STEP_4` |

## 3가지 모드

| 모드 | 트리거 | 동작 |
|------|--------|------|
| **Grill-Me** | 기본 | 소크라틱 질문 |
| **Guide-Me** | 3회 연속 오답 | 직접 설명 |
| **Quick-Me** | 학생 선택 | 빠른 풀이 |

## 코드 패턴

```typescript
// lib/ai/hintLadder.ts
function getHintStep(consecutiveWrong: number, mode: Mode): number {
  if (consecutiveWrong >= 3) return MODE_SWITCH.GUIDE_ME;
  return currentStep;
}

// AI 응답에 반드시 포함:
// 1. "질문 (N/4)" 라벨
// 2. [RECOMMENDATION] 추천 답변
// 3. 📚 수업자료 근거 표시 (grounded_flag)
```

## 금지

- 정답 직출 (항상 질문 우선)
- 프로그레스 바 없이 질문
- [RECOMMENDATION] 태그 없는 질문
