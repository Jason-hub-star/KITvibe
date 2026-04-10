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
import { getBestQuickAnswer, incrementQuickAnswerUsage } from '@/lib/ai/quickAnswerCache';
import { parseAiResponse, stripAiMetadataTags } from '@/lib/ai/parseAiTags';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { RespondRequestBody } from '@/types';
import { hasQuickModeTrigger } from '@/utils/quickMode';

async function saveAiResponse(params: {
  questionId: string;
  responseMode: RespondRequestBody['mode'];
  fullText: string;
}) {
  const { questionId, responseMode, fullText } = params;
  const parsed = parseAiResponse(fullText);

  if (parsed.missingRequiredTags.length > 0) {
    console.warn('[POST /api/questions/[id]/respond] 태그 누락', {
      questionId,
      missingRequiredTags: parsed.missingRequiredTags,
    });
  }

  const supabase = createSupabaseAdmin();
  await supabase.from('ai_responses').insert({
    question_id: questionId,
    response_type: responseMode === 'quick-me' ? 'explanation' : 'hint',
    response_text: stripAiMetadataTags(fullText),
    grounded_flag: parsed.grounded,
    misconception_type: parsed.misconceptionType ?? null,
  });
}

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
    const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    const effectiveMode = mode === 'quick-me' || hasQuickModeTrigger(latestUserMessage?.content ?? '')
      ? 'quick-me'
      : mode;

    // 검증
    if (!lesson_id || !messages || messages.length === 0) {
      return Response.json(
        { success: false, error: '필수 필드 누락', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    if (effectiveMode === 'quick-me' && latestUserMessage?.content) {
      let cachedQuickAnswer = null;
      try {
        cachedQuickAnswer = await getBestQuickAnswer(lesson_id, latestUserMessage.content);
      } catch (cacheError) {
        console.warn('[POST /api/questions/[id]/respond] quick answer cache 조회 실패, 모델 응답으로 fallback', cacheError);
      }

      if (cachedQuickAnswer) {
        const cachedText = [
          cachedQuickAnswer.answer_text,
          '[RECOMMENDATION] 추천: "비슷한 유형을 다시 확인하거나 질문으로 개념 점검을 이어가 보세요."',
          '[ANSWER_CHECK: correct]',
          '[GROUNDED: true]',
        ].join('\n');

        after(async () => {
          try {
            await saveAiResponse({
              questionId,
              responseMode: 'quick-me',
              fullText: cachedText,
            });
            try {
              await incrementQuickAnswerUsage(cachedQuickAnswer.id);
            } catch (usageError) {
              console.warn('[POST /api/questions/[id]/respond] quick answer usage 업데이트 실패', usageError);
            }
          } catch (err) {
            console.error('[POST /api/questions/[id]/respond] cached response 저장 실패', err);
          }
        });

        return new Response(cachedText, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    // streamText 호출
    const result = await generateTutoringResponse({
      lessonId: lesson_id,
      mode: effectiveMode,
      currentStep: current_step,
      consecutiveWrong: consecutive_wrong,
      messages,
    });

    // 백그라운드: 스트리밍 완료 후 DB 저장
    after(async () => {
      try {
        const fullText = await result.text;
        await saveAiResponse({
          questionId,
          responseMode: effectiveMode,
          fullText,
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
