/**
 * @file lib/ai/classifyIntent.ts
 * @description 학생 질문 의도 분류 — AI SDK v6 generateText + Output.object()
 *   - concept / hint / review / similar 4가지 분류
 *   - ~50 토큰 JSON 응답
 * @domain question
 * @access server-only
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { PROMPTS } from '@/lib/prompts';
import { getAiModel } from '@/lib/ai/provider';
import type { IntentType } from '@/types';

const intentSchema = z.object({
  intent: z.enum(['concept', 'hint', 'review', 'similar']),
  confidence: z.number().min(0).max(1),
});

type IntentResult = z.infer<typeof intentSchema>;

/**
 * 학생 질문 텍스트를 4가지 의도로 분류
 */
export async function classifyIntent(
  questionText: string,
): Promise<{ intent: IntentType; confidence: number }> {
  const { output } = await generateText({
    model: getAiModel('intent'),
    system: PROMPTS.INTENT_CLASSIFIER,
    messages: [{ role: 'user', content: questionText }],
    output: Output.object({ schema: intentSchema }),
  });

  if (!output) {
    return { intent: 'concept', confidence: 0.5 };
  }

  return output as IntentResult;
}
