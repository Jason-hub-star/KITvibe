/**
 * @file lib/actions/sessions.ts
 * @description 세션 관련 Server Actions
 *   - 세션 생성
 *   - 세션 조회/업데이트
 * @domain session
 * @access server-only
 */

'use server';

import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  CreateSessionRequestBody,
  Session,
  UpdateSessionRequestBody,
} from '@/types/session.types';

const SESSION_SELECT =
  'id, lesson_id, student_id, current_mode, current_step, consecutive_wrong, quiz_question, quiz_answer, quiz_passed, summary_text, next_recommendation, started_at, ended_at';

export async function createSession(
  payload: CreateSessionRequestBody,
): Promise<Session> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from('sessions')
    .insert(payload)
    .select(SESSION_SELECT)
    .single();

  if (error) {
    throw new Error(`세션 생성 실패: ${error.message}`);
  }

  return data as Session;
}

export async function getSessionById(id: string): Promise<Session | null> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`세션 조회 실패: ${error.message}`);
  }

  return (data as Session | null) ?? null;
}

export async function updateSession(
  id: string,
  payload: UpdateSessionRequestBody,
): Promise<Session> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from('sessions')
    .update(payload)
    .eq('id', id)
    .select(SESSION_SELECT)
    .single();

  if (error) {
    throw new Error(`세션 수정 실패: ${error.message}`);
  }

  return data as Session;
}
