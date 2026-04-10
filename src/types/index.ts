/**
 * @file types/index.ts
 * @description 타입 barrel export
 * @domain shared
 * @access shared
 */

export type { UserRole } from '@/types/common.types';
export type { ApiSuccess, ApiError, ApiResponse } from '@/types/api.types';
export type { User } from '@/types/user.types';
export type {
  Lesson,
  LessonMaterial,
  LessonContextCache,
  LessonMaterialUploadRequest,
  LessonMaterialUploadUrl,
  ProcessLessonMaterialRequest,
  UploadStatus,
  UploadFile,
} from '@/types/lesson.types';
export type { Session, CreateSessionRequestBody, UpdateSessionRequestBody } from '@/types/session.types';
export type { LessonQuickAnswer } from '@/types/quick-answer.types';
export type {
  AnswerCheck,
  AnswerCheckSource,
  RequiredAiTag,
  IntentType,
  ResponseType,
  StudentQuestion,
  AiResponse,
  MisconceptionSummary,
  DashboardStats,
  DashboardMaterialReference,
  MisconceptionHeatmapItem,
  TopQuestion,
  QuestionLogRow,
  DashboardData,
  ChatMode,
  ParsedAiResponse,
  ChatMessage,
  ChatState,
  RespondRequestBody,
} from '@/types/question.types';
