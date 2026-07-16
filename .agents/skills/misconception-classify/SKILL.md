---
name: misconception-classify
description: 수학 오개념 5유형 분류 패턴. AI 응답에 [MISCONCEPTION_TYPE] 태그 강제.
metadata:
  filePattern: ["**/misconception*", "**/analysis*", "**/dashboard*", "**/summary*"]
  bashPattern: []
---

# 오개념 분류 패턴

## 5가지 유형

| # | 유형 | 빈도 | 예시 |
|---|------|------|------|
| 1 | 왜곡된 정리/정의 적용 | 29.66% | 공식은 아는데 잘못 적용 |
| 2 | 기술적 오류 | 21.91% | 계산 실수, 부호 오류 |
| 3 | 풀이 과정 생략 | 18.13% | 중간 단계 건너뜀 |
| 4 | 개념 이미지 오류 | — | 직관적 이해 ≠ 정의 (Tall & Vinner) |
| 5 | 직관적 오류 | — | 당연하다고 생각하지만 틀림 (Fischbein) |

## AI 응답 태그

```
[MISCONCEPTION_TYPE: 1] — 왜곡된 정리 적용
[MISCONCEPTION_TYPE: 2] — 기술적 오류
...
```

## 교사 요약 JSON 형식

```typescript
interface MisconceptionSummary {
  concept_name: string;
  frequency: number;
  misconception_type: 1 | 2 | 3 | 4 | 5;
  summary_text: string;
}
// AI 출력: MisconceptionSummary[]
```

## 히트맵 색상 매핑

| 빈도 | 색상 | Tailwind |
|------|------|---------|
| 70%+ | 빨강 | `bg-red-500` |
| 40-69% | 주황 | `bg-amber-500` |
| 20-39% | 파랑 | `bg-blue-500` |
| 0-19% | 초록 | `bg-green-500` |
