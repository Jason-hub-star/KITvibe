/**
 * @file lib/rag/embed.ts
 * @description 텍스트 임베딩 생성 (v2 준비용, MVP에서 미호출)
 *   - text-embedding-3-small (1536 차원)
 *   - MVP: Context Stuffing 전략 → 이 모듈 호출 안 함
 *   - v2: USE_VECTOR_SEARCH = true 전환 시 활성화
 * @domain lesson
 * @access server-only
 */

/**
 * 단일 텍스트 임베딩 생성
 * MVP에서는 호출하지 않음 — v2 벡터 검색 전환 시 사용
 */
export async function embedText(_text: string): Promise<number[]> {
  // v2: AI Gateway를 통한 임베딩 호출
  // const response = await embed({
  //   model: 'openai/text-embedding-3-small',
  //   value: text,
  // });
  // return response.embedding;
  throw new Error('embedText는 v2에서 활성화됩니다. MVP는 Context Stuffing 전략을 사용합니다.');
}

/**
 * 배치 임베딩 생성
 * MVP에서는 호출하지 않음
 */
export async function embedChunks(_chunks: string[]): Promise<number[][]> {
  // v2: 배치 임베딩
  // const response = await embedMany({
  //   model: 'openai/text-embedding-3-small',
  //   values: chunks,
  // });
  // return response.embeddings;
  throw new Error('embedChunks는 v2에서 활성화됩니다. MVP는 Context Stuffing 전략을 사용합니다.');
}
