/**
 * @file lib/actions/lessons.ts
 * @description 수업 관련 Server Actions
 *   - 수업 생성, 파일 업로드+RAG 처리, 교사 수업 목록 조회
 * @domain lesson
 * @access server-only
 */

'use server';

import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { Lesson } from '@/types';

/**
 * 새 수업 생성
 */
export async function createLesson(formData: {
  title: string;
  subject?: string;
  topic?: string;
  teacher_id: string;
}): Promise<{ success: true; data: Lesson } | { success: false; error: string }> {
  try {
    const { title, subject = 'math', topic, teacher_id } = formData;

    if (!title.trim()) {
      return { success: false, error: '수업 제목을 입력해주세요.' };
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from('lessons')
      .insert({ title: title.trim(), subject, topic: topic?.trim() || null, teacher_id })
      .select()
      .single();

    if (error) {
      console.error('[createLesson]', error);
      return { success: false, error: '수업 생성에 실패했습니다.' };
    }

    return { success: true, data: data as Lesson };
  } catch (err) {
    console.error('[createLesson]', err);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

/**
 * 교사의 수업 목록 조회
 */
export async function getLessonsByTeacher(
  teacherId: string,
): Promise<{ success: true; data: Lesson[] } | { success: false; error: string }> {
  try {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getLessonsByTeacher]', error);
      return { success: false, error: '수업 목록 조회에 실패했습니다.' };
    }

    return { success: true, data: (data || []) as Lesson[] };
  } catch (err) {
    console.error('[getLessonsByTeacher]', err);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}
