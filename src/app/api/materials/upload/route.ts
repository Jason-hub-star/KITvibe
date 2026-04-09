/**
 * @file app/api/materials/upload/route.ts
 * @description 수업 자료 후처리 API
 *   - direct upload 완료 후 Storage 파일 후처리
 *   - 호환성을 위해 기존 multipart 업로드도 유지
 * @domain lesson
 * @access server-only
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { processLessonMaterial } from '@/lib/rag/lessonMaterials';
import type { ApiResponse, LessonMaterial, ProcessLessonMaterialRequest } from '@/types';
import {
  LESSON_MATERIALS_BUCKET,
  LESSON_MATERIAL_MAX_FILE_SIZE,
  buildLessonMaterialStoragePath,
  getLessonMaterialExtension,
  isAllowedLessonMaterialExtension,
} from '@/utils/lessonUpload';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = (await request.json()) as Partial<ProcessLessonMaterialRequest>;
      const lessonId = body.lesson_id?.trim();
      const fileName = body.file_name?.trim();
      const storagePath = body.storage_path?.trim();
      const fileSize = body.file_size;

      if (!lessonId || !fileName || !storagePath || typeof fileSize !== 'number') {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: '수업 ID, 파일명, 저장 경로, 파일 크기는 필수입니다.', code: 'VALIDATION_ERROR' },
          { status: 400 },
        );
      }

      if (fileSize > LESSON_MATERIAL_MAX_FILE_SIZE) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: '파일 크기는 10MB 이하여야 합니다.', code: 'VALIDATION_ERROR' },
          { status: 400 },
        );
      }

      if (!isAllowedLessonMaterialExtension(fileName)) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: `지원하지 않는 파일 형식입니다: ${getLessonMaterialExtension(fileName)}`, code: 'VALIDATION_ERROR' },
          { status: 400 },
        );
      }

      if (!storagePath.startsWith(`${lessonId}/`)) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: '수업 자료 경로가 올바르지 않습니다.', code: 'VALIDATION_ERROR' },
          { status: 400 },
        );
      }

      const result = await processLessonMaterial({
        lessonId,
        fileName,
        storagePath,
      });

      return NextResponse.json<ApiResponse<LessonMaterial[]>>(
        { success: true, data: result.materials, message: result.message },
        { status: 201 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const lessonId = formData.get('lesson_id') as string | null;

    if (!file || !lessonId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '파일과 수업 ID는 필수입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    if (file.size > LESSON_MATERIAL_MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '파일 크기는 10MB 이하여야 합니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const ext = getLessonMaterialExtension(file.name);
    if (!isAllowedLessonMaterialExtension(file.name)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `지원하지 않는 파일 형식입니다: ${ext}`, code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();
    const storagePath = buildLessonMaterialStoragePath(lessonId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(LESSON_MATERIALS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[POST /api/materials/upload] Storage upload failed', uploadError);
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '파일 업로드에 실패했습니다.', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const result = await processLessonMaterial({
      lessonId,
      fileName: file.name,
      storagePath,
    });

    return NextResponse.json<ApiResponse<LessonMaterial[]>>(
      { success: true, data: result.materials, message: result.message },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/materials/upload]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
