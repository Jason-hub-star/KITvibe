---
name: adaptive-mode
description: ZPD 기반 적응적 모드 전환 (Grill-Me → Guide-Me → Quick-Me). 3회 오답 감지, 모드 복귀 로직.
metadata:
  filePattern: ["**/ai/**", "**/hint*", "**/adaptive*", "**/mode*"]
  bashPattern: []
---

# 적응적 모드 전환

## 3가지 모드

| 모드 | 트리거 | AI 동작 |
|------|--------|---------|
| **Grill-Me** | 기본 | 소크라틱 질문 (답변 X) |
| **Guide-Me** | `consecutive_wrong >= 3` | 직접 설명 (ZPD 이탈) |
| **Quick-Me** | 학생 "빨리"/"급해" 입력 | 단계별 풀이 빠르게 |

## 전환 로직

```typescript
function determineMode(consecutive_wrong: number, userInput: string, currentMode: Mode): Mode {
  // 긴급 모드 요청 감지
  if (/빨리|급해|시험|바로/.test(userInput)) return 'quick-me';

  // 3회 연속 오답 → Guide-Me
  if (consecutive_wrong >= 3 && currentMode === 'grill-me') return 'guide-me';

  // Guide-Me에서 1회 정답 → Grill-Me 복귀
  if (currentMode === 'guide-me' && consecutive_wrong === 0) return 'grill-me';

  return currentMode;
}
```

## 교육학 근거

- **Vygotsky ZPD**: 3회 오답 = 근접발달영역 이탈 신호
- **Fischbein 직관 이론**: 질문으로 직관적 오류 드러내기
- **Tall & Vinner**: 개념 이미지 vs 정의 괴리 노출
