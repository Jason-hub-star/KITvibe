/**
 * @file 20260409010000_add_sessions.sql
 * @description 세션 모델 추가 — sessions 테이블 + student_questions.session_id
 * @domain session
 */

DO $$
BEGIN
  CREATE TYPE public.chat_mode AS ENUM ('grill-me', 'guide-me', 'quick-me');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id           uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id          uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_mode        public.chat_mode NOT NULL DEFAULT 'grill-me',
  current_step        integer NOT NULL DEFAULT 1,
  consecutive_wrong   integer NOT NULL DEFAULT 0,
  quiz_question       text,
  quiz_answer         text,
  quiz_passed         boolean,
  summary_text        text,
  next_recommendation text,
  started_at          timestamptz NOT NULL DEFAULT now(),
  ended_at            timestamptz
);

ALTER TABLE public.student_questions
ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL;

DO $$
BEGIN
  ALTER TABLE public.sessions
    ADD CONSTRAINT sessions_current_step_check CHECK (current_step BETWEEN 1 AND 4);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.sessions
    ADD CONSTRAINT sessions_consecutive_wrong_check CHECK (consecutive_wrong >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_lesson ON public.sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_session ON public.student_questions(session_id);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
