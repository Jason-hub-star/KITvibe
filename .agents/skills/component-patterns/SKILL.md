---
name: component-patterns
description: React 컴포넌트 패턴. Server/Client 분리, shadcn/ui 우선, JSDoc 주석, props 타입.
metadata:
  filePattern: ["**/components/**", "**/page.tsx", "**/layout.tsx"]
  bashPattern: []
---

# 컴포넌트 패턴

## Server vs Client 판단

| 이것이 필요하면 | → |
|---------------|---|
| useState, useEffect, onClick | `'use client'` |
| DB fetch, Server Action 호출 | Server Component (기본) |
| shadcn Dialog, Sheet, Tooltip | `'use client'` |
| 마크다운/KaTeX 렌더링 | `'use client'` |

## 파일 구조

```typescript
/**
 * @file components/student/QuestionChat.tsx
 * @description 학생 Grill-Me 채팅 인터페이스
 * @domain question
 * @access client
 */
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StudentQuestion } from '@/types/question.types';

interface QuestionChatProps {
  lessonId: string;
  lessonTitle: string;
}

export function QuestionChat({ lessonId, lessonTitle }: QuestionChatProps) {
  // ...
}
```

## 규칙

- 파일 상단 JSDoc 필수 (`@file`, `@description`, `@domain`, `@access`)
- Props는 `interface {Name}Props` 패턴
- `export function` (default export 금지)
- shadcn/ui 컴포넌트 우선 (커스텀 div 최소화)
- `@/` 절대 import만

## Page 컴포넌트

```typescript
/**
 * @file app/student/ask/page.tsx
 * @description 학생 질문 페이지 (Server Component)
 * @domain question
 * @access shared
 */

import { QuestionChat } from '@/components/student/QuestionChat';

interface PageProps {
  searchParams: Promise<{ lesson?: string }>;
}

export default async function AskPage({ searchParams }: PageProps) {
  const { lesson: lessonId } = await searchParams;
  // Server에서 데이터 fetch → Client 컴포넌트에 props 전달
  return <QuestionChat lessonId={lessonId} />;
}
```

## 금지

- `page.tsx`에 `'use client'` 직접 선언
- 컴포넌트 내부에서 직접 fetch/supabase 호출 (Server Action 사용)
- default export (page.tsx만 예외)
- `any` props 타입
