# Route Map — 풀다 AI

> 원본: overview.md §G

## 페이지 목록

| ID | 페이지 | 프론트 라우트 | 설명 |
|----|--------|-------------|------|
| P-001 | 랜딩 | `/` | 교사/학생 역할 선택 |
| P-002 | 교사 자료 등록 | `/teacher/upload` | 수업자료 업로드 + 주제 입력 |
| P-003 | 학생 질문 | `/student/ask` | 질문 입력 + AI 응답 스트리밍 |
| P-004 | 교사 대시보드 | `/teacher/dashboard` | 오개념 히트맵 + 질문 로그 |
| P-005 | 결과/요약 | `/student/summary` | 세션 요약 |

## 프론트 ↔ 백엔드 매핑

| 페이지 | 프론트 라우트 | API 엔드포인트 | 메서드 | 데이터 |
|--------|-------------|---------------|--------|--------|
| P-001 | `/` | — | static | — |
| P-002 | `/teacher/upload` | `/api/lessons` | POST | title, subject, topic |
| P-002 | `/teacher/upload` | `/api/materials/upload` | POST | file (multipart) |
| P-003 | `/student/ask` | `/api/sessions` | POST | lesson_id, student_id |
| P-003 | `/student/ask` | `/api/questions` | POST | question_text, image?, lesson_id |
| P-003 | `/student/ask` | `/api/questions/[id]/respond` | POST | (AI 스트리밍 응답) |
| P-004 | `/teacher/dashboard` | `/api/lessons/[id]/dashboard` | GET | — |
| P-004 | `/teacher/dashboard` | `/api/lessons/[id]/misconceptions` | POST | 오개념 요약 생성 |
| P-005 | `/student/summary` | `/api/sessions/[id]/summary` | GET | — |

## 보류 페이지

- 로그인, 마이페이지, 학급관리, 설정, 관리자
- **로그인 없이 역할 선택 버튼으로 데모 진행**
