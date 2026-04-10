/**
 * @file lib/rag/lessonContextCache.ts
 * @description lesson 컨텍스트 캐시 조회/포맷팅
 *   - 요약, 핵심 개념, 자주 틀리는 포인트, 대표 풀이 템플릿 제공
 * @domain lesson
 * @access server-only
 */

import 'server-only';

import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { LessonContextCache } from '@/types';

function formatList(title: string, values: string[]): string {
  if (values.length === 0) {
    return '';
  }

  return `${title}\n${values.map((value) => `- ${value}`).join('\n')}`;
}

export async function getLessonContextCache(
  lessonId: string,
): Promise<LessonContextCache | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('lesson_context_caches')
    .select('id, lesson_id, summary_text, key_concepts, common_mistakes, solution_template, created_at, updated_at')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) {
    throw new Error(`lesson context cache 조회 실패: ${error.message}`);
  }

  return (data as LessonContextCache | null) ?? null;
}

export function formatLessonContextCache(cache: LessonContextCache): string {
  const sections = [
    '[수업 핵심 요약]',
    cache.summary_text,
    formatList('[핵심 개념]', cache.key_concepts),
    formatList('[자주 틀리는 포인트]', cache.common_mistakes),
    '[대표 풀이 템플릿]',
    cache.solution_template,
  ].filter(Boolean);

  return sections.join('\n');
}
