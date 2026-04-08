/**
 * @file app/api/questions/image/route.ts
 * @description POST /api/questions/image — 학생 질문 이미지 업로드
 * @domain question
 * @access server-only
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { ApiResponse } from '@/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

interface UploadQuestionImageData {
  image_url: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '이미지 파일은 필수입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '이미지 크기는 5MB 이하여야 합니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'PNG, JPG, WEBP, GIF 이미지만 업로드할 수 있습니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();
    const safeName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    const storagePath = `student/${Date.now()}_${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from('question-images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('[POST /api/questions/image]', error);
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '질문 이미지 업로드에 실패했습니다.', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/question-images/${storagePath}`;

    return NextResponse.json<ApiResponse<UploadQuestionImageData>>(
      { success: true, data: { image_url } },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/questions/image]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
