/**
 * @file types/question.types.ts
 * @description 질문(question) 도메인 타입 — DB 컬럼명 1:1 매핑
 * @domain question
 * @access shared
 */

export type IntentType = 'concept' | 'hint' | 'review' | 'similar';

export type ResponseType = 'hint' | 'explanation' | 'feedback' | 'similar' | 'quiz' | 'summary';

export interface StudentQuestion {
  id: string;
  lesson_id: string;
  student_id: string;
  question_text: string;
  image_url: string | null;
  intent_type: IntentType | null;
  created_at: string;
}

export interface AiResponse {
  id: string;
  question_id: string;
  response_type: ResponseType;
  response_text: string;
  grounded_flag: boolean;
  created_at: string;
}

export interface MisconceptionSummary {
  id: string;
  lesson_id: string;
  concept_name: string;
  frequency: number;
  summary_text: string;
  created_at: string;
}
