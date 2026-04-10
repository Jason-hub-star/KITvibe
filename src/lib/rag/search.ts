/**
 * @file lib/rag/search.ts
 * @description RAG 검색 — MVP: Context Stuffing / v2: 벡터 검색
 *   - MVP: lesson_materials의 extracted_text 전체 결합
 *   - v2: match_chunks RPC로 유사도 검색
 * @domain lesson
 * @access server-only
 */

import { createSupabaseAdmin } from '@/lib/supabase/admin';

/** MVP/v2 전환 스위치 — v2에서 true로 변경 */
const USE_VECTOR_SEARCH = false;
const FALLBACK_MAX_MATERIALS = 2;

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
    .filter((token) => token.length >= 2);
}

/**
 * MVP: 수업의 모든 자료 텍스트를 전체 결합
 * Context Stuffing — 자료 < 128K이면 전체 주입이 더 정확
 */
export async function getFullText(lessonId: string): Promise<string> {
  const supabase = createSupabaseAdmin();

  // chunk_index=0인 행만 조회하여 extracted_text 중복 방지
  const { data, error } = await supabase
    .from('lesson_materials')
    .select('extracted_text, file_name')
    .eq('lesson_id', lessonId)
    .eq('chunk_index', 0)
    .not('extracted_text', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`자료 조회 실패: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return '';
  }

  // 파일별로 구분하여 결합 (chunk_index=0이므로 파일당 1행)
  return data
    .map((row) => `--- ${row.file_name} ---\n${row.extracted_text}`)
    .join('\n\n');
}

/**
 * MVP fallback: 질문과 겹치는 토큰이 많은 자료를 우선 반환
 * 약한 모델(Gemma 등)에서도 전체 자료 주입보다 집중도가 높다.
 */
export async function getFocusedText(
  lessonId: string,
  query: string,
  maxMaterials = FALLBACK_MAX_MATERIALS,
): Promise<string> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('lesson_materials')
    .select('extracted_text, file_name')
    .eq('lesson_id', lessonId)
    .eq('chunk_index', 0)
    .not('extracted_text', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`자료 조회 실패: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return '';
  }

  const queryTokens = new Set(tokenize(query));
  const scoredMaterials = data
    .map((row) => {
      const materialTokens = new Set(tokenize(`${row.file_name} ${row.extracted_text}`));
      let score = 0;

      for (const token of queryTokens) {
        if (materialTokens.has(token)) {
          score += 1;
        }
      }

      return { row, score };
    })
    .sort((a, b) => b.score - a.score);

  const topMaterials = scoredMaterials
    .slice(0, maxMaterials)
    .map(({ row }) => `--- ${row.file_name} ---\n${row.extracted_text}`)
    .join('\n\n');

  return topMaterials || getFullText(lessonId);
}

/**
 * v2: 벡터 유사도 검색 (match_chunks RPC)
 * MVP에서는 USE_VECTOR_SEARCH = false이므로 호출되지 않음
 */
export async function searchChunks(
  _query: string,
  lessonId: string,
  _topK = 3,
): Promise<string[]> {
  if (!USE_VECTOR_SEARCH) {
    // MVP fallback: 전체 텍스트 반환
    const fullText = await getFullText(lessonId);
    return fullText ? [fullText] : [];
  }

  // v2: 벡터 검색 구현
  // const queryEmbedding = await embedText(query);
  // const supabase = createSupabaseAdmin();
  // const { data, error } = await supabase.rpc('match_chunks', {
  //   query_embedding: queryEmbedding,
  //   filter_lesson_id: lessonId,
  //   match_count: topK,
  // });
  // return data?.map(r => r.chunk_text) ?? [];

  throw new Error('벡터 검색은 v2에서 활성화됩니다.');
}

/**
 * 수업 자료 검색 통합 인터페이스
 * MVP: getFullText, v2: searchChunks
 */
export async function retrieveContext(
  lessonId: string,
  query?: string,
): Promise<string> {
  if (USE_VECTOR_SEARCH && query) {
    const chunks = await searchChunks(query, lessonId);
    return chunks.join('\n\n');
  }

  if (query) {
    return getFocusedText(lessonId, query);
  }

  return getFullText(lessonId);
}
