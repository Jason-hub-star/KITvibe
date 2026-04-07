/**
 * @file lib/ai/generateResponse.ts
 * @description AI 튜터링 스트리밍 응답 생성 — streamText + RAG context
 *   - 모드별 프롬프트 선택 (grill-me / guide-me / quick-me)
 *   - 수업 자료 Context Stuffing
 * @domain question
 * @access server-only
 */

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PROMPTS } from '@/lib/prompts';
import { retrieveContext } from '@/lib/rag/search';
import type { ChatMode } from '@/types';

interface TutoringParams {
  lessonId: string;
  mode: ChatMode;
  currentStep: number;
  consecutiveWrong: number;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * 모드별 시스템 프롬프트를 변수 치환하여 생성
 */
function buildSystemPrompt(
  mode: ChatMode,
  currentStep: number,
  consecutiveWrong: number,
  retrievedChunks: string,
  lessonTitle: string,
): string {
  const prompt = PROMPTS.GRILL_ME_TUTOR
    .replace('{lesson_title}', lessonTitle)
    .replace(/{mode}/g, mode)
    .replace(/{current_step}/g, String(currentStep))
    .replace('{consecutive_wrong}', String(consecutiveWrong))
    .replace('{retrieved_chunks}', retrievedChunks || '(수업 자료 없음)');

  return prompt;
}

/**
 * 튜터링 스트리밍 응답 생성
 * @returns streamText 결과 (toTextStreamResponse()로 변환 가능)
 */
export async function generateTutoringResponse(params: TutoringParams) {
  const { lessonId, mode, currentStep, consecutiveWrong, messages } = params;

  // 1. RAG: 수업 자료 검색
  const retrievedChunks = await retrieveContext(lessonId);

  // 2. 수업 제목 조회
  const supabase = (await import('@/lib/supabase/admin')).createSupabaseAdmin();
  const { data: lesson } = await supabase
    .from('lessons')
    .select('title')
    .eq('id', lessonId)
    .single();
  const lessonTitle = lesson?.title ?? '수업';

  // 3. 시스템 프롬프트 구성
  const system = buildSystemPrompt(mode, currentStep, consecutiveWrong, retrievedChunks, lessonTitle);

  // 3. streamText 호출
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return result;
}
