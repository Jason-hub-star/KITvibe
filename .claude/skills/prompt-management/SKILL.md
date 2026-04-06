---
name: prompt-management
description: AI 프롬프트 템플릿 중앙 관리. 변수 플레이스홀더, 태그 규칙, 프롬프트 주입 방지.
metadata:
  filePattern: ["**/prompts/**", "**/lib/ai/**"]
  bashPattern: []
---

# 프롬프트 관리 패턴

## 1곳 관리 원칙

모든 시스템 프롬프트는 `src/lib/prompts/index.ts` **1개 파일**에서만 관리.

```typescript
export const SYSTEM_PROMPTS = {
  INTENT_CLASSIFIER: `...`,
  GRILL_ME: `...`,
  RAG_RESPONDER: `...`,
  TEACHER_SUMMARY: `...`,
} as const;
```

## 변수 플레이스홀더

| 변수 | 용도 |
|------|------|
| `{current_step}` | Grill-Me 질문 사다리 단계 (1-4) |
| `{retrieved_chunks}` | RAG 검색 결과 텍스트 |
| `{question}` | 학생 질문 원문 |
| `{mode}` | grill-me / guide-me / quick-me |
| `{consecutive_wrong}` | 연속 오답 수 |

## 필수 태그

| 태그 | 의미 |
|------|------|
| `[RECOMMENDATION]` | AI 추천 답변 (접이식 UI) |
| `[MODE_SWITCH: mode]` | 모드 전환 신호 |
| `[MISCONCEPTION_TYPE: N]` | 오개념 유형 (1-5) |

## 프롬프트 주입 방지

```typescript
// ✅ 안전
messages: [
  { role: 'system', content: SYSTEM_PROMPTS.GRILL_ME },
  { role: 'user', content: userQuestion }  // 구조적 분리
]

// ❌ 위험
const prompt = `${SYSTEM_PROMPTS.GRILL_ME}\n질문: ${userQuestion}`;
```
