# Schema — MathTutor AI

> 원본: overview.md §E

## ER 다이어그램

```
users ─┬─< lessons ─┬─< lesson_materials
       │            ├─< student_questions ─< ai_responses
       │            └─< misconception_summaries
       └─< student_questions
```

## 테이블 정의

### users

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | auto-generated |
| role | enum('teacher','student') | 역할 |
| name | text | 표시 이름 |
| created_at | timestamp | 기본값 now() |

### lessons

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| teacher_id | uuid FK→users | |
| title | text | 수업 제목 |
| subject | text | 기본값 'math' |
| topic | text | 핵심 개념/주제 |
| created_at | timestamp | |

### lesson_materials

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| file_name | text | 원본 파일명 |
| file_url | text | Supabase Storage URL |
| extracted_text | text | OCR/파싱 결과 |
| embedding | vector(1536) | 임베딩 벡터 (pgvector) |

### student_questions

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| student_id | uuid FK→users | |
| question_text | text | 질문 본문 |
| image_url | text | nullable, 이미지 URL |
| intent_type | enum('concept','hint','review','similar') | AI 분류 결과 |
| created_at | timestamp | |

### ai_responses

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| question_id | uuid FK→student_questions | |
| response_type | enum('hint','explanation','feedback','similar','quiz','summary') | |
| response_text | text | AI 응답 본문 |
| grounded_flag | boolean | 수업 자료 근거 여부 |
| created_at | timestamp | |

### misconception_summaries

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| concept_name | text | 오개념 대상 개념 |
| frequency | integer | 질문 빈도 |
| summary_text | text | AI 요약 |
| created_at | timestamp | |

## 제외 테이블

billing, organization, classroom_membership, guardian, notification, audit_log
