/**
 * @file app/api/lessons/route.ts
 * @description 수업 생성 API — POST { title, subject?, topic?, teacher_id }
 * @domain lesson
 * @access server-only
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { ApiResponse, Lesson } from '@/types';

interface CreateLessonBody {
  title?: string;
  subject?: string;
  topic?: string;
  teacher_id?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateLessonBody;
    const { title, subject = 'math', topic, teacher_id } = body;

    if (!title || !teacher_id) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '수업 제목과 교사 ID는 필수입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from('lessons')
      .insert({ title, subject, topic: topic || null, teacher_id })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/lessons]', error);
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '수업 생성에 실패했습니다.', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<Lesson>>(
      { success: true, data: data as Lesson },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/lessons]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
