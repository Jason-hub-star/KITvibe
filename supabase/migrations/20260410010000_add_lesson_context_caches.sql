/**
 * @file 20260410010000_add_lesson_context_caches.sql
 * @description 약한 모델 대응용 lesson 컨텍스트 캐시 테이블 추가
 * @domain lesson
 */

CREATE TABLE IF NOT EXISTS public.lesson_context_caches (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id          uuid NOT NULL UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE,
  summary_text       text NOT NULL,
  key_concepts       text[] NOT NULL DEFAULT '{}',
  common_mistakes    text[] NOT NULL DEFAULT '{}',
  solution_template  text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_context_caches_lesson
  ON public.lesson_context_caches(lesson_id);

ALTER TABLE public.lesson_context_caches ENABLE ROW LEVEL SECURITY;
