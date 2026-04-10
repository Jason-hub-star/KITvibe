# Schema — 풀다 AI

> 원본: overview.md §E

## ER 다이어그램

```
users ─┬─< lessons ─┬─< lesson_materials
       │            ├─< lesson_context_caches
       │            ├─< lesson_quick_answers
       │            ├─< misconception_summaries
       │            └─< sessions ─< student_questions ─< ai_responses
       ├─< sessions
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

### sessions

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| student_id | uuid FK→users | |
| current_mode | enum('grill-me','guide-me','quick-me') | 기본값 'grill-me' |
| current_step | integer | 기본값 1 |
| consecutive_wrong | integer | 기본값 0 |
| quiz_question | text | nullable |
| quiz_answer | text | nullable |
| quiz_passed | boolean | nullable |
| summary_text | text | nullable |
| next_recommendation | text | nullable |
| summary_concepts | text[] | nullable |
| started_at | timestamp | |
| ended_at | timestamp | nullable |

### lesson_materials

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| file_name | text | 원본 파일명 |
| file_url | text | Supabase Storage URL |
| extracted_text | text | 파싱 결과 (MVP: 전체 텍스트 주입에 사용) |
| chunk_text | text | nullable — v2 청킹 시 개별 chunk 저장 |
| chunk_index | integer | default 0 — v2 청킹 시 순서 |
| embedding | vector(1536) | nullable — v2 벡터검색 시 사용 (pgvector 확장성) |

### lesson_quick_answers

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| trigger_phrase | text | Quick-Me 자동 전환/매칭 기준 표현 |
| question_pattern | text | 자주 나오는 질문 패턴 |
| answer_text | text | 빠른답변 캐시 본문 |
| concept_name | text | nullable |
| usage_count | integer | default 0 |
| created_at | timestamp | |

### lesson_context_caches

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons, unique | lesson당 1개 컨텍스트 캐시 |
| summary_text | text | lesson 핵심 요약 |
| key_concepts | text[] | 핵심 개념 목록 |
| common_mistakes | text[] | 자주 틀리는 포인트 |
| solution_template | text | 대표 풀이 템플릿 |
| created_at | timestamp | |
| updated_at | timestamp | |

### student_questions

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| lesson_id | uuid FK→lessons | |
| student_id | uuid FK→users | |
| session_id | uuid FK→sessions | nullable, 현재 학습 세션 |
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
| misconception_type | smallint | nullable, 1~5 오개념 유형 |
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

## 제약

- `sessions.current_step` 1~4 범위 유지
- `sessions.consecutive_wrong` 0 이상
- `misconception_summaries (lesson_id, concept_name)` unique — 같은 수업/개념 조합은 UPSERT

## 제외 테이블

billing, organization, classroom_membership, guardian, notification, audit_log
