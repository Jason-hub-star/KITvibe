/**
 * @file 20260410000000_add_lesson_quick_answers.sql
 * @description Quick-Me 빠른답변 캐시 테이블 추가
 * @domain question
 */

CREATE TABLE IF NOT EXISTS public.lesson_quick_answers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id      uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  trigger_phrase text NOT NULL,
  question_pattern text NOT NULL,
  answer_text    text NOT NULL,
  concept_name   text,
  usage_count    integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quick_answers_lesson
  ON public.lesson_quick_answers(lesson_id);

ALTER TABLE public.lesson_quick_answers ENABLE ROW LEVEL SECURITY;
