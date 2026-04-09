/**
 * @file lib/rag/lessonMaterials.ts
 * @description 교사 수업 자료 Storage 후처리
 *   - Storage 파일 다운로드
 *   - 텍스트 추출/청킹
 *   - lesson_materials 저장
 * @domain lesson
 * @access server-only
 */

import 'server-only';

import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { chunkText } from '@/lib/rag/chunk';
import { extractText } from '@/lib/rag/extract';
import type { LessonMaterial } from '@/types';
import {
  LESSON_MATERIALS_BUCKET,
  buildLessonMaterialFileUrl,
} from '@/utils/lessonUpload';

const LESSON_MATERIAL_SELECT =
  'id, lesson_id, file_name, file_url, extracted_text, chunk_text, chunk_index, embedding, created_at';

interface ProcessLessonMaterialParams {
  lessonId: string;
  fileName: string;
  storagePath: string;
}

interface ProcessLessonMaterialResult {
  materials: LessonMaterial[];
  message: string;
}

export async function processLessonMaterial({
  lessonId,
  fileName,
  storagePath,
}: ProcessLessonMaterialParams): Promise<ProcessLessonMaterialResult> {
  const supabase = createSupabaseAdmin();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  const fileUrl = buildLessonMaterialFileUrl(supabaseUrl, storagePath);

  const { data: existingMaterials, error: existingError } = await supabase
    .from('lesson_materials')
    .select(LESSON_MATERIAL_SELECT)
    .eq('lesson_id', lessonId)
    .eq('file_url', fileUrl)
    .order('chunk_index', { ascending: true });

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingMaterials && existingMaterials.length > 0) {
    return {
      materials: existingMaterials as LessonMaterial[],
      message: '이미 처리된 자료입니다.',
    };
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(LESSON_MATERIALS_BUCKET)
    .download(storagePath);

  if (downloadError || !fileBlob) {
    throw new Error(downloadError?.message || 'Storage download failed.');
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer());
  const extractedText = await extractText(fileName, buffer);

  if (extractedText) {
    const chunks = chunkText(fileName, extractedText);
    const rows = chunks.map((chunk, index) => ({
      lesson_id: lessonId,
      file_name: fileName,
      file_url: fileUrl,
      extracted_text: extractedText,
      chunk_text: chunk,
      chunk_index: index,
    }));

    const { data, error } = await supabase
      .from('lesson_materials')
      .insert(rows)
      .select(LESSON_MATERIAL_SELECT);

    if (error) {
      throw new Error(error.message);
    }

    return {
      materials: (data || []) as LessonMaterial[],
      message: '텍스트 추출 완료',
    };
  }

  const { data, error } = await supabase
    .from('lesson_materials')
    .insert({
      lesson_id: lessonId,
      file_name: fileName,
      file_url: fileUrl,
      extracted_text: null,
      chunk_text: null,
      chunk_index: 0,
    })
    .select(LESSON_MATERIAL_SELECT);

  if (error) {
    throw new Error(error.message);
  }

  return {
    materials: (data || []) as LessonMaterial[],
    message: '이미지 파일 저장 완료 (텍스트 추출 불가)',
  };
}
