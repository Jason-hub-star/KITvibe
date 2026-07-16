---
name: supabase-patterns
description: Supabase 접근 패턴 강제. client(RLS) vs admin(Service Role) 분리, 쿼리 패턴, 에러 처리.
metadata:
  filePattern: ["**/supabase/**", "**/lib/actions/**", "**/api/**"]
  bashPattern: ["supabase"]
---

# Supabase 접근 패턴

## 클라이언트 분리 (강제)

```typescript
// 클라이언트 (RLS 보호) — 브라우저에서 사용
import { createSupabaseClient } from '@/lib/supabase/client';

// 서버 (Service Role) — Server Action/API에서만 사용
import { createSupabaseAdmin } from '@/lib/supabase/admin';
```

## 규칙

| 작업 | 클라이언트 | 서버 |
|------|----------|------|
| 읽기 (공개) | ✅ RLS | ✅ |
| 읽기 (민감) | ❌ | ✅ Service Role |
| 쓰기 | ❌ | ✅ Server Action |
| Storage 업로드 | ❌ | ✅ |
| RPC (match_chunks) | ❌ | ✅ |

## 쿼리 패턴

```typescript
// ✅ 항상 .select() 명시
const { data, error } = await supabase
  .from('lessons')
  .select('id, title, topic')
  .eq('teacher_id', userId)
  .single();

// ✅ 에러 체크 필수
if (error) throw new Error(`DB_ERROR: ${error.message}`);

// ❌ 금지
supabase.from('lessons').select('*')  // * 대신 명시적 컬럼
```

## 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL` → 클라이언트 + 서버
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → 클라이언트 + 서버 (RLS)
- `SUPABASE_SERVICE_ROLE_KEY` → **서버 전용** (절대 노출 금지)
