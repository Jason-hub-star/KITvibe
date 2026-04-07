/**
 * @file app/api/lessons/[id]/misconceptions/route.ts
 * @description POST /api/lessons/[id]/misconceptions — AI 오개념 요약 생성
 *   - TEACHER_SUMMARY 프롬프트 → misconception_summaries UPSERT
 * @domain misconception
 * @access server-only
 */

import { NextRequest } from 'next/server';
import { generateMisconceptionSummary } from '@/lib/actions/dashboard';

export async function POST(
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
    const data = await generateMisconceptionSummary(lessonId);
    return Response.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/lessons/[id]/misconceptions]', err);
    return Response.json(
      { success: false, error: '오개념 요약 생성에 실패했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
