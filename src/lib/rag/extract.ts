/**
 * @file lib/rag/extract.ts
 * @description 업로드 파일에서 텍스트 추출 (PDF, Markdown)
 *   - PDF: pdf-parse 사용
 *   - Markdown: gray-matter로 frontmatter 분리 + 본문 추출
 *   - 이미지: 텍스트 추출 불가 → null 반환
 * @domain lesson
 * @access server-only
 */

import pdfParse from 'pdf-parse';
import matter from 'gray-matter';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

/**
 * PDF 버퍼에서 텍스트 추출
 */
export async function extractFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text.trim();
}

/**
 * Markdown 문자열에서 frontmatter 분리 + 본문 추출
 */
export function extractFromMarkdown(content: string): {
  frontmatter: Record<string, unknown>;
  text: string;
} {
  const { data, content: body } = matter(content);
  return {
    frontmatter: data as Record<string, unknown>,
    text: body.trim(),
  };
}

/**
 * 파일명 확장자 기반 텍스트 추출 분기
 * @returns 추출된 텍스트 또는 null (이미지 등 추출 불가)
 */
export async function extractText(
  fileName: string,
  buffer: Buffer,
): Promise<string | null> {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

  if (ext === '.pdf') {
    return extractFromPdf(buffer);
  }

  if (ext === '.md' || ext === '.markdown') {
    const content = buffer.toString('utf-8');
    const { text } = extractFromMarkdown(content);
    return text;
  }

  if (IMAGE_EXTENSIONS.includes(ext)) {
    // 이미지는 텍스트 추출 불가 — file_url만 저장
    return null;
  }

  // 지원하지 않는 형식
  return null;
}
