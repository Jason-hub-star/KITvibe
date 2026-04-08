/**
 * @file app/api/sessions/route.ts
 * @description POST /api/sessions — 학생 학습 세션 생성
 * @domain session
 * @access server-only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/actions/sessions';
import type { ApiResponse, Session, CreateSessionRequestBody } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CreateSessionRequestBody>;
    const { lesson_id, student_id } = body;

    if (!lesson_id || !student_id) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '필수 필드 누락: lesson_id, student_id', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const session = await createSession({ lesson_id, student_id });

    return NextResponse.json<ApiResponse<{ session: Session }>>(
      { success: true, data: { session } },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/sessions]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '세션 생성 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
