/**
 * @file lib/ai/generateSessionSummary.ts
 * @description 학생 세션 요약 생성
 * @domain session
 * @access server-only
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { PROMPTS } from '@/lib/prompts';
import { getAiModel } from '@/lib/ai/provider';

const sessionSummarySchema = z.object({
  summary_text: z.string(),
  next_recommendation: z.string(),
  concepts: z.array(z.string()).min(1).max(3),
});

export interface SessionSummaryResult {
  summary_text: string;
  next_recommendation: string;
  concepts: string[];
}

export async function generateSessionSummary(params: {
  lessonTitle: string;
  sessionLog: string;
}): Promise<SessionSummaryResult> {
  const system = PROMPTS.SESSION_SUMMARY
    .replace('{lesson_title}', params.lessonTitle)
    .replace('{session_log}', params.sessionLog || '(세션 로그 없음)');

  const { output } = await generateText({
    model: getAiModel('session-summary'),
    system,
    messages: [{ role: 'user', content: '세션 요약을 생성해주세요.' }],
    output: Output.object({ schema: sessionSummarySchema }),
  });

  return {
    summary_text: output?.summary_text ?? '이번 세션에서 핵심 개념을 다시 점검했어요.',
    next_recommendation: output?.next_recommendation ?? '같은 개념으로 짧은 복습 질문을 하나 더 해보세요.',
    concepts: output?.concepts ?? ['핵심 개념'],
  };
}
