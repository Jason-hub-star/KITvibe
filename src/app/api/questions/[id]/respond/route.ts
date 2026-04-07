/**
 * @file app/api/questions/[id]/respond/route.ts
 * @description POST /api/questions/[id]/respond — AI 튜터링 스트리밍 응답
 *   - 모드별 프롬프트 → streamText → text/event-stream
 *   - 응답 완료 후 ai_responses INSERT (백그라운드)
 * @domain question
 * @access shared
 */

import { NextRequest } from 'next/server';
import { after } from 'next/server';
import { generateTutoringResponse } from '@/lib/ai/generateResponse';
import { parseAiResponse } from '@/lib/ai/parseAiTags';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { RespondRequestBody } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: questionId } = await params;

  try {
    const body: RespondRequestBody = await request.json();
    const {
      lesson_id,
      mode = 'grill-me',
      current_step = 1,
      consecutive_wrong = 0,
      messages,
    } = body;

    // 검증
    if (!lesson_id || !messages || messages.length === 0) {
      return Response.json(
        { success: false, error: '필수 필드 누락', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    // streamText 호출
    const result = await generateTutoringResponse({
      lessonId: lesson_id,
      mode,
      currentStep: current_step,
      consecutiveWrong: consecutive_wrong,
      messages,
    });

    // 백그라운드: 스트리밍 완료 후 DB 저장
    after(async () => {
      try {
        const fullText = await result.text;
        const parsed = parseAiResponse(fullText);

        const supabase = createSupabaseAdmin();
        await supabase.from('ai_responses').insert({
          question_id: questionId,
          response_type: mode === 'quick-me' ? 'explanation' : 'hint',
          response_text: fullText,
          grounded_flag: parsed.grounded,
        });
      } catch (err) {
        console.error('[POST /api/questions/[id]/respond] DB 저장 실패', err);
      }
    });

    // 스트리밍 응답 반환
    return result.toTextStreamResponse();
  } catch (err) {
    console.error('[POST /api/questions/[id]/respond]', err);
    return Response.json(
      { success: false, error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
