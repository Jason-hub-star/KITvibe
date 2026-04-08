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
  session_id: string | null;
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
  misconception_type: number | null;
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

// --- D-3 대시보드 타입 ---

/** 대시보드 통계 */
export interface DashboardStats {
  totalQuestions: number;
  activeStudents: number;
  recoveryRate: number;
}

/** 오개념 히트맵 항목 */
export interface MisconceptionHeatmapItem {
  conceptName: string;
  percentage: number;
  count: number;
}

/** TOP 5 질문 */
export interface TopQuestion {
  questionText: string;
  count: number;
}

/** 질문 로그 행 */
export interface QuestionLogRow {
  studentName: string;
  questionText: string;
  intentType: string;
  createdAt: string;
}

/** 대시보드 전체 데이터 */
export interface DashboardData {
  lesson: { id: string; title: string; topic: string | null; created_at: string };
  stats: DashboardStats;
  heatmap: MisconceptionHeatmapItem[];
  topQuestions: TopQuestion[];
  questionLog: QuestionLogRow[];
  misconceptionSummaries: MisconceptionSummary[];
}

// --- D-4 추가 타입 ---

export type ChatMode = 'grill-me' | 'guide-me' | 'quick-me';
export type AnswerCheck = 'correct' | 'partial' | 'wrong';
export type RequiredAiTag = 'recommendation' | 'answerCheck' | 'grounded';
export type AnswerCheckSource = 'explicit' | 'inferred' | 'missing';

/** AI 응답 태그 파싱 결과 */
export interface ParsedAiResponse {
  content: string;
  recommendation?: string;
  modeSwitch?: ChatMode;
  answerCheck?: AnswerCheck;
  answerCheckSource: AnswerCheckSource;
  hasExplicitAnswerCheck: boolean;
  misconceptionType?: number;
  grounded: boolean;
  hasExplicitGrounded: boolean;
  missingRequiredTags: RequiredAiTag[];
}

/** 채팅 메시지 (클라이언트 상태용) */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  recommendation?: string;
  grounded?: boolean;
  answerCheck?: AnswerCheck;
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
  sessionId: string | null;
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
  messages: Array<{ role: 'user' | 'assistant'; content: string; image_url?: string }>;
}
