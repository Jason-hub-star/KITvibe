/**
 * @file types/session.types.ts
 * @description 세션(session) 도메인 타입 — DB 컬럼명 1:1 매핑
 * @domain session
 * @access shared
 */

import type { ChatMode } from '@/types/question.types';

export interface Session {
  id: string;
  lesson_id: string;
  student_id: string;
  current_mode: ChatMode;
  current_step: number;
  consecutive_wrong: number;
  quiz_question: string | null;
  quiz_answer: string | null;
  quiz_passed: boolean | null;
  summary_text: string | null;
  next_recommendation: string | null;
  summary_concepts: string[] | null;
  started_at: string;
  ended_at: string | null;
}

export interface CreateSessionRequestBody {
  lesson_id: string;
  student_id: string;
}

export interface UpdateSessionRequestBody {
  current_mode?: ChatMode;
  current_step?: number;
  consecutive_wrong?: number;
  quiz_question?: string | null;
  quiz_answer?: string | null;
  quiz_passed?: boolean | null;
  summary_text?: string | null;
  next_recommendation?: string | null;
  summary_concepts?: string[] | null;
  ended_at?: string | null;
}
