/**
 * @file app/api/materials/upload-url/route.ts
 * @description 교사 수업 자료 direct upload URL 발급 API
 *   - 파일 메타데이터 검증
 *   - Supabase Storage signed upload URL 생성
 * @domain lesson
 * @access server-only
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { ApiResponse, LessonMaterialUploadRequest, LessonMaterialUploadUrl } from '@/types';
import {
  LESSON_MATERIALS_BUCKET,
  LESSON_MATERIAL_MAX_FILE_SIZE,
  buildLessonMaterialFileUrl,
  buildLessonMaterialStoragePath,
  isAllowedLessonMaterialExtension,
} from '@/utils/lessonUpload';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<LessonMaterialUploadRequest>;
    const lessonId = body.lesson_id?.trim();
    const fileName = body.file_name?.trim();
    const fileSize = body.file_size;

    if (!lessonId || !fileName || typeof fileSize !== 'number') {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '수업 ID, 파일명, 파일 크기는 필수입니다.', code: 'VALIDATION_ERROR' },
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
        { success: false, error: '지원하지 않는 파일 형식입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
    }

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '수업을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const storagePath = buildLessonMaterialStoragePath(lessonId, fileName);
    const { data, error } = await supabase.storage
      .from(LESSON_MATERIALS_BUCKET)
      .createSignedUploadUrl(storagePath, { upsert: false });

    if (error || !data) {
      console.error('[POST /api/materials/upload-url]', error);
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '업로드 URL 생성에 실패했습니다.', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const responseData: LessonMaterialUploadUrl = {
      path: data.path,
      token: data.token,
      signed_url: data.signedUrl,
      file_url: buildLessonMaterialFileUrl(supabaseUrl, data.path),
    };

    return NextResponse.json<ApiResponse<LessonMaterialUploadUrl>>(
      { success: true, data: responseData },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/materials/upload-url]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
