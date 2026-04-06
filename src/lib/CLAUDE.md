# lib/ — 서버 비즈니스 로직

> **서버 전용.** 클라이언트 컴포넌트(`'use client'`)에서 직접 import 금지.

## 규칙

- 모든 파일은 Server Action(`'use server'`) 또는 서버 유틸
- `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_OIDC_TOKEN` 접근 가능
- AI Gateway 호출은 반드시 이 폴더 안에서만
- 프롬프트 주입 방지: 사용자 입력은 `role: 'user'` message로만

## 하위 폴더

| 폴더 | 역할 |
|------|------|
| `actions/` | Server Actions (도메인별: `lessons.ts`, `questions.ts`) |
| `prompts/` | AI 시스템 프롬프트 템플릿 (1곳 관리) |
| `rag/` | RAG 파이프라인 (텍스트 추출, 청킹, 검색) |
| `supabase/` | Supabase 클라이언트 유틸 (`client.ts`, `admin.ts`) |
| `ai/` | AI 호출 유틸 (의도 분류, 힌트 사다리, 스트리밍) |
