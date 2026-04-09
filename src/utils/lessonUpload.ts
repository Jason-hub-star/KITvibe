/**
 * @file utils/lessonUpload.ts
 * @description 교사 수업 자료 업로드 공통 규칙
 *   - 파일 크기/형식 제한
 *   - Storage 경로/URL 생성
 * @domain lesson
 * @access shared
 */

export const LESSON_MATERIALS_BUCKET = 'lesson-files';
export const LESSON_MATERIAL_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const LESSON_MATERIAL_ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'text/markdown': ['.md', '.markdown'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

export const LESSON_MATERIAL_ALLOWED_EXTENSIONS = Object.values(
  LESSON_MATERIAL_ACCEPTED_TYPES,
).flat();

export function getLessonMaterialExtension(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf('.');
  return extensionIndex === -1 ? '' : fileName.slice(extensionIndex).toLowerCase();
}

export function sanitizeLessonMaterialFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
}

export function isAllowedLessonMaterialExtension(fileName: string): boolean {
  return LESSON_MATERIAL_ALLOWED_EXTENSIONS.includes(getLessonMaterialExtension(fileName));
}

export function buildLessonMaterialStoragePath(
  lessonId: string,
  fileName: string,
  timestamp: number = Date.now(),
): string {
  return `${lessonId}/${timestamp}_${sanitizeLessonMaterialFileName(fileName)}`;
}

export function buildLessonMaterialFileUrl(
  supabaseUrl: string,
  storagePath: string,
): string {
  return `${supabaseUrl}/storage/v1/object/${LESSON_MATERIALS_BUCKET}/${storagePath}`;
}
