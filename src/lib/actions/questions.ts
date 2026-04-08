/**
 * @file lib/actions/questions.ts
 * @description 학생 질문 관련 Server Actions
 *   - AI 응답 저장
 *   - 수업별 질문 목록 조회
 * @domain question
 * @access server-only
 */

'use server';

import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { AiResponse, ResponseType, StudentQuestion } from '@/types';

const AI_RESPONSE_SELECT =
  'id, question_id, response_type, response_text, grounded_flag, misconception_type, created_at';

const QUESTION_SELECT =
  'id, lesson_id, student_id, session_id, question_text, image_url, intent_type, created_at';

/** ai_responses 테이블에 저장 */
export async function saveAiResponse(data: {
  question_id: string;
  response_type: ResponseType;
  response_text: string;
  grounded_flag: boolean;
}): Promise<AiResponse> {
  const supabase = createSupabaseAdmin();

  const { data: inserted, error } = await supabase
    .from('ai_responses')
    .insert(data)
    .select(AI_RESPONSE_SELECT)
    .single();

  if (error) {
    throw new Error(`AI 응답 저장 실패: ${error.message}`);
  }

  return inserted as AiResponse;
}

/** 수업별 질문 목록 조회 */
export async function getQuestionsByLesson(
  lessonId: string,
): Promise<StudentQuestion[]> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from('student_questions')
    .select(QUESTION_SELECT)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`질문 조회 실패: ${error.message}`);
  }

  return (data ?? []) as StudentQuestion[];
}
