/**
 * @file app/api/materials/upload/route.ts
 * @description 수업 자료 업로드 + RAG 처리 API
 *   - FormData (file + lesson_id) 수신
 *   - 파일 검증 → Storage 업로드 → 텍스트 추출 → 청킹 → DB 저장
 * @domain lesson
 * @access server-only
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { extractText } from '@/lib/rag/extract';
import { chunkText } from '@/lib/rag/chunk';
import type { ApiResponse, LessonMaterial } from '@/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.md', '.markdown', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

function getFileExtension(fileName: string): string {
  return fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const lessonId = formData.get('lesson_id') as string | null;

    // 입력 검증
    if (!file || !lessonId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '파일과 수업 ID는 필수입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '파일 크기는 10MB 이하여야 합니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    // 파일 형식 검증
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `지원하지 않는 파일 형식입니다: ${ext}`, code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    // 1. Supabase Storage 업로드
    // 파일명 sanitize: 한글/특수문자를 안전한 형태로 변환
    const safeName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    const storagePath = `${lessonId}/${Date.now()}_${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('lesson-files')
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

    // file_url 생성 (signed URL은 필요 시 별도 생성)
    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/lesson-files/${storagePath}`;

    // 2. 텍스트 추출
    const extractedText = await extractText(file.name, buffer);

    // 3. 청킹 + DB 저장
    const materials: LessonMaterial[] = [];

    if (extractedText) {
      // 텍스트가 있으면 청킹 후 각 청크를 별도 행으로 저장
      const chunks = chunkText(file.name, extractedText);

      const rows = chunks.map((chunk, index) => ({
        lesson_id: lessonId,
        file_name: file.name,
        file_url: fileUrl,
        extracted_text: extractedText, // 전체 텍스트 (Context Stuffing용)
        chunk_text: chunk,
        chunk_index: index,
      }));

      const { data, error: insertError } = await supabase
        .from('lesson_materials')
        .insert(rows)
        .select();

      if (insertError) {
        console.error('[POST /api/materials/upload] DB insert failed', insertError);
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: '자료 저장에 실패했습니다.', code: 'INTERNAL_ERROR' },
          { status: 500 },
        );
      }

      materials.push(...(data as LessonMaterial[]));
    } else {
      // 이미지 등 텍스트 추출 불가 → file_url만 저장
      const { data, error: insertError } = await supabase
        .from('lesson_materials')
        .insert({
          lesson_id: lessonId,
          file_name: file.name,
          file_url: fileUrl,
          extracted_text: null,
          chunk_text: null,
          chunk_index: 0,
        })
        .select();

      if (insertError) {
        console.error('[POST /api/materials/upload] DB insert failed', insertError);
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: '자료 저장에 실패했습니다.', code: 'INTERNAL_ERROR' },
          { status: 500 },
        );
      }

      materials.push(...(data as LessonMaterial[]));
    }

    return NextResponse.json<ApiResponse<LessonMaterial[]>>(
      { success: true, data: materials, message: extractedText ? '텍스트 추출 완료' : '이미지 파일 저장 완료 (텍스트 추출 불가)' },
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
