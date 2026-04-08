/**
 * @file utils/parseAiTags.ts
 * @description AI 응답 텍스트에서 메타 태그를 파싱하여 구조화된 데이터로 변환
 *   - [RECOMMENDATION], [ANSWER_CHECK], [MODE_SWITCH], [MISCONCEPTION_TYPE], [GROUNDED]
 *   - 순수 함수 — 서버/클라이언트 양쪽에서 사용 가능
 * @domain question
 * @access shared
 */

import type { ParsedAiResponse, ChatMode, AnswerCheck } from '@/types';

const VALID_MODES: ChatMode[] = ['grill-me', 'guide-me', 'quick-me'];
const VALID_ANSWER_CHECKS: AnswerCheck[] = ['correct', 'partial', 'wrong'];

/**
 * AI 응답 텍스트에서 태그를 추출하고 본문을 정리
 */
export function parseAiResponse(text: string): ParsedAiResponse {
  let content = text;
  let recommendation: string | undefined;
  let modeSwitch: ChatMode | undefined;
  let answerCheck: AnswerCheck | undefined;
  let misconceptionType: number | undefined;
  let grounded = false;

  // [RECOMMENDATION] 추천: "..."
  const recMatch = content.match(/\[RECOMMENDATION\]\s*추천:\s*"([^"]+)"/);
  if (recMatch) {
    recommendation = recMatch[1];
    content = content.replace(recMatch[0], '');
  }

  // [ANSWER_CHECK: correct|partial|wrong]
  const answerCheckMatch = content.match(/\[ANSWER_CHECK:\s*(correct|partial|wrong)\]/);
  if (answerCheckMatch) {
    const parsed = answerCheckMatch[1] as AnswerCheck;
    if (VALID_ANSWER_CHECKS.includes(parsed)) {
      answerCheck = parsed;
    }
    content = content.replace(answerCheckMatch[0], '');
  }

  // [MODE_SWITCH: guide-me]
  const modeMatch = content.match(/\[MODE_SWITCH:\s*([\w-]+)\]/);
  if (modeMatch) {
    const mode = modeMatch[1] as ChatMode;
    if (VALID_MODES.includes(mode)) {
      modeSwitch = mode;
    }
    content = content.replace(modeMatch[0], '');
  }

  // [MISCONCEPTION_TYPE: N]
  const miscMatch = content.match(/\[MISCONCEPTION_TYPE:\s*(\d+)\]/);
  if (miscMatch) {
    const num = parseInt(miscMatch[1], 10);
    if (num >= 1 && num <= 5) {
      misconceptionType = num;
    }
    content = content.replace(miscMatch[0], '');
  }

  // [GROUNDED: true/false]
  const groundedMatch = content.match(/\[GROUNDED:\s*(true|false)\]/);
  if (groundedMatch) {
    grounded = groundedMatch[1] === 'true';
    content = content.replace(groundedMatch[0], '');
  }

  // 남은 빈 줄 정리
  content = content.replace(/\n{3,}/g, '\n\n').trim();

  return {
    content,
    recommendation,
    modeSwitch,
    answerCheck,
    misconceptionType,
    grounded,
  };
}
