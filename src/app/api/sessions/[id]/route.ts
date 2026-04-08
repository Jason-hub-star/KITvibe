/**
 * @file app/api/sessions/[id]/route.ts
 * @description PATCH /api/sessions/[id] — 학습 세션 상태 업데이트
 * @domain session
 * @access server-only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, updateSession } from '@/lib/actions/sessions';
import type { ApiResponse, Session } from '@/types';
import type { UpdateSessionRequestBody } from '@/types/session.types';

function buildUpdatePayload(body: UpdateSessionRequestBody): UpdateSessionRequestBody {
  const payload: UpdateSessionRequestBody = {};

  if (body.current_mode !== undefined) payload.current_mode = body.current_mode;
  if (body.current_step !== undefined) payload.current_step = body.current_step;
  if (body.consecutive_wrong !== undefined) payload.consecutive_wrong = body.consecutive_wrong;
  if (body.quiz_question !== undefined) payload.quiz_question = body.quiz_question;
  if (body.quiz_answer !== undefined) payload.quiz_answer = body.quiz_answer;
  if (body.quiz_passed !== undefined) payload.quiz_passed = body.quiz_passed;
  if (body.summary_text !== undefined) payload.summary_text = body.summary_text;
  if (body.next_recommendation !== undefined) payload.next_recommendation = body.next_recommendation;
  if (body.summary_concepts !== undefined) payload.summary_concepts = body.summary_concepts;
  if (body.ended_at !== undefined) payload.ended_at = body.ended_at;

  return payload;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as UpdateSessionRequestBody;
    const payload = buildUpdatePayload(body);

    if (Object.keys(payload).length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '수정할 필드가 없습니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const existing = await getSessionById(id);
    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '세션을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const session = await updateSession(id, payload);

    return NextResponse.json<ApiResponse<{ session: Session }>>(
      { success: true, data: { session } },
      { status: 200 },
    );
  } catch (err) {
    console.error('[PATCH /api/sessions/[id]]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '세션 업데이트 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await getSessionById(id);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '세션을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<{ session: Session }>>(
      { success: true, data: { session } },
      { status: 200 },
    );
  } catch (err) {
    console.error('[GET /api/sessions/[id]]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '세션 조회 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
