/**
 * @file lib/ai/generateSummary.ts
 * @description TEACHER_SUMMARY 프롬프트로 오개념 요약 생성
 *   - generateText + Output.object() → MisconceptionSummary[]
 * @domain misconception
 * @access server-only
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { PROMPTS } from '@/lib/prompts';
import { getAiModel } from '@/lib/ai/provider';

const misconceptionItemSchema = z.object({
  concept_name: z.string(),
  frequency: z.number(),
  summary_text: z.string(),
});

const misconceptionSchema = z.object({
  items: z.array(misconceptionItemSchema),
});

export type TeacherSummaryResult = z.infer<typeof misconceptionItemSchema>[];

/**
 * 학생 질문 로그를 분석하여 TOP 5 오개념 요약 생성
 */
export async function generateTeacherSummary(
  questionLogs: string,
): Promise<TeacherSummaryResult> {
  const systemPrompt = PROMPTS.TEACHER_SUMMARY.replace('{question_logs}', '');

  const { output } = await generateText({
    model: getAiModel('teacher-summary'),
    system: systemPrompt,
    messages: [{ role: 'user', content: `[질문 로그]\n${questionLogs}` }],
    output: Output.object({ schema: misconceptionSchema }),
  });

  if (!output) {
    return [];
  }

  return output.items;
}
