---
name: schema-mapping
description: DB 컬럼 ↔ TypeScript 타입 1:1 매핑 강제. enum 값 고정, nullable 규칙.
metadata:
  filePattern: ["**/types/**", "**/schema*", "**/migration*"]
  bashPattern: ["supabase migration"]
---

# 스키마 ↔ 타입 매핑

## 고정 enum 값

```typescript
type Subject = string;  // 전과목 범용 (기본값 'math')
type IntentType = 'concept' | 'hint' | 'review' | 'similar';  // 4개만
type ResponseType = 'hint' | 'explanation' | 'feedback' | 'similar' | 'quiz' | 'summary';  // 6개만
type UserRole = 'teacher' | 'student';
type Mode = 'grill-me' | 'guide-me' | 'quick-me';
```

## nullable 규칙

| 컬럼 | nullable | 이유 |
|------|----------|------|
| `image_url` | ✅ | 이미지 없는 질문 |
| `chunk_text` | ✅ | v2 확장용 |
| `chunk_index` | ✅ | v2 확장용 |
| `embedding` | ✅ | v2 벡터검색 확장용 |
| 나머지 | ❌ | 필수 필드 |

## 타입 속성명 = DB 컬럼명

```typescript
// ✅ 일치
interface Lesson {
  id: string;
  teacher_id: string;  // DB: teacher_id
  created_at: string;  // DB: created_at
}

// ❌ 금지 (camelCase 변환)
interface Lesson {
  teacherId: string;   // DB와 불일치
  createdAt: string;
}
```
