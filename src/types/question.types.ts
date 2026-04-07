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

// --- D-4 추가 타입 ---

export type ChatMode = 'grill-me' | 'guide-me' | 'quick-me';

/** AI 응답 태그 파싱 결과 */
export interface ParsedAiResponse {
  content: string;
  recommendation?: string;
  modeSwitch?: ChatMode;
  misconceptionType?: number;
  grounded: boolean;
}

/** 채팅 메시지 (클라이언트 상태용) */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendation?: string;
  grounded?: boolean;
  step?: number;
  mode?: ChatMode;
  misconceptionType?: number;
  createdAt: Date;
}

/** 채팅 전체 상태 */
export interface ChatState {
  messages: ChatMessage[];
  mode: ChatMode;
  currentStep: number;
  consecutiveWrong: number;
  isStreaming: boolean;
  lessonTitle: string;
  lessonId: string;
  studentId: string;
}

/** API /api/questions/[id]/respond 요청 body */
export interface RespondRequestBody {
  lesson_id: string;
  mode: ChatMode;
  current_step: number;
  consecutive_wrong: number;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}
