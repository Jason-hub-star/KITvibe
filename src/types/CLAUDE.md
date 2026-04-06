# types/ — 공유 타입 정의

> **FE + BE 공유.** DB 컬럼명과 1:1 매핑 필수.

## 규칙

- `any` 사용 금지 → `unknown` + 타입 가드
- `Subject = 'math'` 리터럴 타입으로 과목 잠금
- `IntentType = 'concept' | 'hint' | 'review' | 'similar'`
- DB 컬럼명 = 타입 속성명 정확히 일치 (snake_case)
- API 응답: `ApiResponse<T>` 제네릭 타입 통일

## 파일 구조

| 파일 | 내용 |
|------|------|
| `lesson.types.ts` | Lesson, LessonMaterial, Subject |
| `question.types.ts` | StudentQuestion, AiResponse, IntentType, ResponseType |
| `api.types.ts` | ApiResponse<T>, 요청/응답 타입 |
| `index.ts` | barrel export |
