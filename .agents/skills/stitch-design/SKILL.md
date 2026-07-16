---
name: stitch-design
description: Google Stitch SDK로 UI 시안 생성 및 React 변환 워크플로우.
metadata:
  filePattern: ["**/scripts/generate-mockups*", "**/stitch*"]
  bashPattern: ["stitch", "mockup"]
---

# Stitch 디자인 워크플로우

## 사용법

```bash
export STITCH_API_KEY="..."
npx tsx scripts/generate-mockups.ts
```

## 규칙

- Stitch 시안은 **참고용** — 그대로 쓰지 않고 shadcn/ui로 재구현
- 시안 PNG는 `docs/design/stitch-outputs/`에 저장 (.gitignore)
- 디자인 결정은 `docs/ref/UI-SPEC.md`에 기록
- 색상/폰트/간격은 `UI-SPEC.md` 디자인 토큰을 따름

## 변환 흐름

```
Stitch 프롬프트 → HTML/PNG 생성 → 디자인 검토
  → UI-SPEC.md에 결정 기록 → shadcn/ui 컴포넌트로 구현
  → Stitch 원본은 삭제 (코드에 포함 안 함)
```
