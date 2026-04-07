/**
 * @file lib/rag/chunk.ts
 * @description 텍스트 청킹 전략
 *   - PDF: Recursive Character Splitting (maxTokens=512, overlap=15%)
 *   - Markdown: 헤딩(# / ##) 기반 자연 청킹
 * @domain lesson
 * @access server-only
 */

/**
 * PDF용 Recursive Character Splitting
 * @param text 전체 텍스트
 * @param maxTokens 청크당 최대 토큰 (기본 512)
 * @param overlap 오버랩 비율 (기본 0.15)
 */
export function chunkByRecursive(
  text: string,
  maxTokens = 512,
  overlap = 0.15,
): string[] {
  if (!text.trim()) return [];

  const maxChars = Math.floor(maxTokens / 0.6); // 근사 역변환
  const overlapChars = Math.floor(maxChars * overlap);
  const separators = ['\n\n', '\n', '. ', ' '];
  const chunks: string[] = [];

  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);

    // 마지막 청크면 그대로
    if (end >= text.length) {
      const chunk = text.slice(start).trim();
      if (chunk) chunks.push(chunk);
      break;
    }

    // 구분자 기반으로 자연스러운 끊기 지점 찾기
    let breakPoint = -1;
    for (const sep of separators) {
      const lastSep = text.lastIndexOf(sep, end);
      if (lastSep > start) {
        breakPoint = lastSep + sep.length;
        break;
      }
    }

    if (breakPoint > start) {
      end = breakPoint;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    // 오버랩 적용하되, 최소 1글자는 전진 보장 (무한 루프 방지)
    start = Math.max(end - overlapChars, start + 1);
  }

  return chunks;
}

/**
 * Markdown용 헤딩 기반 자연 청킹
 * # 또는 ## 기준으로 섹션 분리
 */
export function chunkByHeading(markdown: string): string[] {
  if (!markdown.trim()) return [];

  const lines = markdown.split('\n');
  const chunks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^#{1,2}\s/.test(line) && current.length > 0) {
      const chunk = current.join('\n').trim();
      if (chunk) chunks.push(chunk);
      current = [line];
    } else {
      current.push(line);
    }
  }

  // 마지막 섹션
  const last = current.join('\n').trim();
  if (last) chunks.push(last);

  // 헤딩이 없으면 전체를 하나의 청크로
  if (chunks.length === 0 && markdown.trim()) {
    return [markdown.trim()];
  }

  return chunks;
}

/**
 * 파일 확장자 기반 청킹 전략 분기
 */
export function chunkText(fileName: string, text: string): string[] {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

  if (ext === '.md' || ext === '.markdown') {
    return chunkByHeading(text);
  }

  // PDF 및 기타: recursive splitting
  return chunkByRecursive(text);
}
