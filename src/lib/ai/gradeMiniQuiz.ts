/**
 * @file lib/ai/gradeMiniQuiz.ts
 * @description 학생 미니퀴즈 답변 채점
 * @domain session
 * @access server-only
 */

import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { PROMPTS } from '@/lib/prompts';

const gradeSchema = z.object({
  passed: z.boolean(),
  feedback: z.string(),
});

export interface QuizGradeResult {
  passed: boolean;
  feedback: string;
}

export async function gradeMiniQuiz(params: {
  lessonTitle: string;
  retrievedChunks: string;
  quizQuestion: string;
  quizAnswer: string;
}): Promise<QuizGradeResult> {
  const system = PROMPTS.QUIZ_GRADER
    .replace('{lesson_title}', params.lessonTitle)
    .replace('{retrieved_chunks}', params.retrievedChunks || '(수업 자료 없음)')
    .replace('{quiz_question}', params.quizQuestion)
    .replace('{quiz_answer}', params.quizAnswer);

  const { output } = await generateText({
    model: openai('gpt-4o-mini'),
    system,
    messages: [{ role: 'user', content: '학생 답변을 채점해주세요.' }],
    output: Output.object({ schema: gradeSchema }),
  });

  return {
    passed: output?.passed ?? false,
    feedback: output?.feedback ?? '핵심 개념을 한 번 더 정리해보면 좋아요.',
  };
}
