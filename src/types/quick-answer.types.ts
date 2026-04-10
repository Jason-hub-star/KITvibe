/**
 * @file types/quick-answer.types.ts
 * @description Quick-Me 빠른답변 캐시 타입
 * @domain question
 * @access shared
 */

export interface LessonQuickAnswer {
  id: string;
  lesson_id: string;
  trigger_phrase: string;
  question_pattern: string;
  answer_text: string;
  concept_name: string | null;
  usage_count: number;
  created_at: string;
}
