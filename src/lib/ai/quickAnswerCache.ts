/**
 * @file lib/ai/quickAnswerCache.ts
 * @description Quick-Me 빠른답변 캐시 조회/사용량 업데이트
 * @domain question
 * @access server-only
 */

import 'server-only';

import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { LessonQuickAnswer } from '@/types';
import { QUICK_MODE_TRIGGER_KEYWORDS } from '@/utils/quickMode';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !QUICK_MODE_TRIGGER_KEYWORDS.some((keyword) => token === normalize(keyword)));
}

function scoreQuickAnswer(question: string, row: LessonQuickAnswer): number {
  const normalizedQuestion = normalize(question);
  const normalizedPattern = normalize(row.question_pattern);
  let score = 0;

  if (normalizedQuestion.includes(normalize(row.trigger_phrase))) {
    score += 4;
  }

  if (normalizedQuestion.includes(normalizedPattern)) {
    score += 6;
  }

  const questionTokens = new Set(tokenize(question));
  const patternTokens = tokenize(row.question_pattern);

  for (const token of patternTokens) {
    if (questionTokens.has(token)) {
      score += 1;
    }
  }

  if (row.concept_name && normalizedQuestion.includes(normalize(row.concept_name))) {
    score += 2;
  }

  return score;
}

export async function getBestQuickAnswer(
  lessonId: string,
  question: string,
): Promise<LessonQuickAnswer | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('lesson_quick_answers')
    .select('id, lesson_id, trigger_phrase, question_pattern, answer_text, concept_name, usage_count, created_at')
    .eq('lesson_id', lessonId);

  if (error) {
    throw new Error(`빠른답변 캐시 조회 실패: ${error.message}`);
  }

  const candidates = ((data ?? []) as LessonQuickAnswer[])
    .map((row) => ({ row, score: scoreQuickAnswer(question, row) }))
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.row ?? null;
}

export async function incrementQuickAnswerUsage(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();

  const { data: existing, error: fetchError } = await supabase
    .from('lesson_quick_answers')
    .select('usage_count')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`빠른답변 usage 조회 실패: ${fetchError.message}`);
  }

  const nextUsageCount = (existing?.usage_count ?? 0) + 1;
  const { error } = await supabase
    .from('lesson_quick_answers')
    .update({ usage_count: nextUsageCount })
    .eq('id', id);

  if (error) {
    throw new Error(`빠른답변 usage 업데이트 실패: ${error.message}`);
  }
}
