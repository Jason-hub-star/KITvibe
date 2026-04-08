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

export interface SessionTranscriptRow {
  question_id: string;
  question_text: string;
  image_url: string | null;
  response_text: string | null;
  response_type: string | null;
  created_at: string;
}

const SESSION_SELECT =
  'id, lesson_id, student_id, current_mode, current_step, consecutive_wrong, quiz_question, quiz_answer, quiz_passed, summary_text, next_recommendation, summary_concepts, started_at, ended_at';

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

export async function getSessionTranscript(
  sessionId: string,
): Promise<SessionTranscriptRow[]> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from('student_questions')
    .select(
      'id, question_text, image_url, created_at, ai_responses(response_text, response_type, created_at)',
    )
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`세션 로그 조회 실패: ${error.message}`);
  }

  return (data ?? []).flatMap((row) => {
    const responses = Array.isArray(row.ai_responses)
      ? row.ai_responses
      : row.ai_responses
        ? [row.ai_responses]
        : [];

    if (responses.length === 0) {
      return [
        {
          question_id: row.id,
          question_text: row.question_text,
          image_url: row.image_url,
          response_text: null,
          response_type: null,
          created_at: row.created_at,
        },
      ];
    }

    return responses.map((response) => ({
      question_id: row.id,
      question_text: row.question_text,
      image_url: row.image_url,
      response_text: response.response_text,
      response_type: response.response_type,
      created_at: row.created_at,
    }));
  }) as SessionTranscriptRow[];
}

export async function getLatestQuestionBySession(
  sessionId: string,
): Promise<{ id: string } | null> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from('student_questions')
    .select('id')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`최신 질문 조회 실패: ${error.message}`);
  }

  return data ?? null;
}
