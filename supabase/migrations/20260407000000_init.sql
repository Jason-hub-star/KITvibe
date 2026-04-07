/**
 * @file 20260407000000_init.sql
 * @description 풀다 AI 초기 스키마 — 6 테이블 + pgvector + match_chunks RPC + RLS
 * @domain all
 */

-- ============================================================
-- 1. Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- ============================================================
-- 2. Custom ENUM types
-- ============================================================
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE intent_type AS ENUM ('concept', 'hint', 'review', 'similar');
CREATE TYPE response_type AS ENUM ('hint', 'explanation', 'feedback', 'similar', 'quiz', 'summary');

-- ============================================================
-- 3. Tables
-- ============================================================

-- users
CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role       user_role NOT NULL,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- lessons
CREATE TABLE lessons (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      text NOT NULL,
  subject    text NOT NULL DEFAULT 'math',
  topic      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- lesson_materials
CREATE TABLE lesson_materials (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id      uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_name      text NOT NULL,
  file_url       text NOT NULL,
  extracted_text text,
  chunk_text     text,
  chunk_index    integer NOT NULL DEFAULT 0,
  embedding      extensions.vector(1536),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- student_questions
CREATE TABLE student_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  image_url     text,
  intent_type   intent_type,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ai_responses
CREATE TABLE ai_responses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id    uuid NOT NULL REFERENCES student_questions(id) ON DELETE CASCADE,
  response_type  response_type NOT NULL,
  response_text  text NOT NULL,
  grounded_flag  boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- misconception_summaries
CREATE TABLE misconception_summaries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  concept_name text NOT NULL,
  frequency    integer NOT NULL DEFAULT 0,
  summary_text text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. Indexes
-- ============================================================

-- FK lookup indexes
CREATE INDEX idx_lessons_teacher      ON lessons(teacher_id);
CREATE INDEX idx_materials_lesson     ON lesson_materials(lesson_id);
CREATE INDEX idx_questions_lesson     ON student_questions(lesson_id);
CREATE INDEX idx_questions_student    ON student_questions(student_id);
CREATE INDEX idx_responses_question   ON ai_responses(question_id);
CREATE INDEX idx_misconceptions_lesson ON misconception_summaries(lesson_id);

-- Vector similarity search (IVFFlat — 적은 데이터에서도 동작, 대규모 시 HNSW 전환)
CREATE INDEX idx_materials_embedding ON lesson_materials
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 10);

-- ============================================================
-- 5. RPC: match_chunks (벡터 유사도 검색)
-- ============================================================
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding extensions.vector(1536),
  match_count     integer DEFAULT 3,
  filter_lesson   uuid DEFAULT NULL
)
RETURNS TABLE (
  id             uuid,
  lesson_id      uuid,
  file_name      text,
  chunk_text     text,
  chunk_index    integer,
  similarity     float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lm.id,
    lm.lesson_id,
    lm.file_name,
    lm.chunk_text,
    lm.chunk_index,
    1 - (lm.embedding OPERATOR(extensions.<=>) query_embedding) AS similarity
  FROM public.lesson_materials lm
  WHERE lm.embedding IS NOT NULL
    AND (filter_lesson IS NULL OR lm.lesson_id = filter_lesson)
  ORDER BY lm.embedding OPERATOR(extensions.<=>) query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- 6. RLS (Row Level Security)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons                ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE misconception_summaries ENABLE ROW LEVEL SECURITY;

-- MVP: anon 읽기 허용 (데모용, 인증 미구현)
-- Service Role은 RLS bypass이므로 서버 쓰기는 자동 허용

CREATE POLICY "anon_read_users"
  ON users FOR SELECT
  TO anon USING (true);

CREATE POLICY "anon_read_lessons"
  ON lessons FOR SELECT
  TO anon USING (true);

CREATE POLICY "anon_read_materials"
  ON lesson_materials FOR SELECT
  TO anon USING (true);

CREATE POLICY "anon_read_questions"
  ON student_questions FOR SELECT
  TO anon USING (true);

CREATE POLICY "anon_read_responses"
  ON ai_responses FOR SELECT
  TO anon USING (true);

CREATE POLICY "anon_read_misconceptions"
  ON misconception_summaries FOR SELECT
  TO anon USING (true);

-- 클라이언트에서 직접 INSERT 허용 (데모 유저 생성용)
CREATE POLICY "anon_insert_users"
  ON users FOR INSERT
  TO anon WITH CHECK (true);

-- 학생이 직접 질문 INSERT (anon key 사용)
CREATE POLICY "anon_insert_questions"
  ON student_questions FOR INSERT
  TO anon WITH CHECK (true);
