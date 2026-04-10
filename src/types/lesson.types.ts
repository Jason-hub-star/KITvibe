/**
 * @file types/lesson.types.ts
 * @description 수업(lesson) 도메인 타입 — DB 컬럼명 1:1 매핑
 * @domain lesson
 * @access shared
 */

export interface Lesson {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  topic: string | null;
  created_at: string;
}

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  extracted_text: string | null;
  chunk_text: string | null;
  chunk_index: number;
  embedding: number[] | null;
  created_at: string;
}

export interface LessonContextCache {
  id: string;
  lesson_id: string;
  summary_text: string;
  key_concepts: string[];
  common_mistakes: string[];
  solution_template: string;
  created_at: string;
  updated_at: string;
}

export interface LessonMaterialUploadRequest {
  lesson_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface LessonMaterialUploadUrl {
  path: string;
  token: string;
  signed_url: string;
  file_url: string;
}

export interface ProcessLessonMaterialRequest extends LessonMaterialUploadRequest {
  storage_path: string;
}

/** 파일 업로드 진행 상태 */
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

/** 업로드 큐 내 개별 파일 */
export interface UploadFile {
  file: File;
  status: UploadStatus;
  error?: string;
  material?: LessonMaterial;
}
