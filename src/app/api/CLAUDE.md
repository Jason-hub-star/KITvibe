# app/api/ — API 라우트

> **응답 포맷 통일 강제.**

## 응답 포맷

```typescript
// 성공
{ success: true, data: T, message?: string }

// 실패
{ success: false, error: string, code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR' }
```

## 규칙

- HTTP 상태 코드: 201 (생성), 400 (검증), 404 (없음), 500 (서버)
- 에러 로그: `console.error('[METHOD /api/path]', error)`
- 사용자에게 스택 트레이스/DB 에러 절대 노출 금지
- 스트리밍 응답: `Content-Type: text/event-stream`
- 모든 POST에 입력 검증 (필수 필드 체크)

## 도메인별 라우트

| 경로 | 메서드 | 도메인 |
|------|--------|--------|
| `/api/users` | POST | user |
| `/api/lessons` | POST | lesson |
| `/api/materials/upload` | POST | lesson |
| `/api/questions` | POST | question |
| `/api/questions/[id]/respond` | POST | question (스트리밍) |
| `/api/lessons/[id]/dashboard` | GET | misconception |
| `/api/lessons/[id]/misconceptions` | GET/POST | misconception |
| `/api/sessions/[id]/summary` | GET | session |
