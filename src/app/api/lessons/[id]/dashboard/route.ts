/**
 * @file app/api/lessons/[id]/dashboard/route.ts
 * @description GET /api/lessons/[id]/dashboard — 교사 대시보드 데이터
 *   - 통계, 오개념 히트맵, TOP 5, 질문 로그 집계
 * @domain misconception
 * @access server-only
 */

import { NextRequest } from 'next/server';
import { getDashboardData } from '@/lib/actions/dashboard';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: lessonId } = await params;

  if (!lessonId) {
    return Response.json(
      { success: false, error: '수업 ID가 필요합니다.', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  try {
    const data = await getDashboardData(lessonId);
    return Response.json({ success: true, data });
  } catch (err) {
    console.error('[GET /api/lessons/[id]/dashboard]', err);
    const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    const status = message.includes('NOT_FOUND') ? 404 : 500;
    const code = status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR';
    return Response.json(
      { success: false, error: message, code },
      { status },
    );
  }
}
