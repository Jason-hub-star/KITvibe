/**
 * @file lib/ai/generateMiniQuiz.ts
 * @description 학생 세션 종료 직전 미니퀴즈 생성
 * @domain session
 * @access server-only
 */

import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { PROMPTS } from '@/lib/prompts';

const quizSchema = z.object({
  question: z.string(),
});

export interface MiniQuizResult {
  question: string;
}

export async function generateMiniQuiz(params: {
  lessonTitle: string;
  retrievedChunks: string;
  sessionLog: string;
}): Promise<MiniQuizResult> {
  const system = PROMPTS.MINI_QUIZ
    .replace('{lesson_title}', params.lessonTitle)
    .replace('{retrieved_chunks}', params.retrievedChunks || '(수업 자료 없음)')
    .replace('{session_log}', params.sessionLog || '(세션 로그 없음)');

  const { output } = await generateText({
    model: openai('gpt-4o-mini'),
    system,
    messages: [{ role: 'user', content: '미니퀴즈 1문항을 생성해주세요.' }],
    output: Output.object({ schema: quizSchema }),
  });

  return {
    question: output?.question ?? '이번에 배운 핵심 개념을 한 문장으로 설명해보세요.',
  };
}
