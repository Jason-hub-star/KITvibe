---
name: api-response
description: API 라우트 응답 포맷 통일. 성공/실패 구조, HTTP 상태코드, 에러 코드 강제.
metadata:
  filePattern: ["**/api/**/*.ts", "**/route.ts"]
  bashPattern: []
---

# API 응답 패턴

## 응답 포맷 (강제)

```typescript
// ✅ 성공
NextResponse.json(
  { success: true, data: T, message?: string },
  { status: 200 | 201 }
);

// ✅ 실패
NextResponse.json(
  { success: false, error: string, code: ErrorCode },
  { status: 400 | 404 | 500 }
);

type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
```

## API 라우트 템플릿

```typescript
/**
 * @file app/api/{domain}/route.ts
 * @description {설명}
 * @domain {도메인}
 * @access server-only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. 입력 검증
    if (!body.requiredField) {
      return NextResponse.json(
        { success: false, error: '필수 항목입니다', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // 2. 비즈니스 로직
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('table')
      .insert(body)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 3. 성공 응답
    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/{domain}]', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

## 금지

- `any` 타입 응답
- 스택 트레이스 사용자 노출
- `success` 필드 없는 응답
- HTTP 상태 코드 없이 에러 반환
