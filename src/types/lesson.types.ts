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
