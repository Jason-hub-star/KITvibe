/**
 * @file utils/parseAiTags.ts
 * @description AI 응답 텍스트에서 메타 태그를 파싱하여 구조화된 데이터로 변환
 *   - [RECOMMENDATION], [ANSWER_CHECK], [MODE_SWITCH], [MISCONCEPTION_TYPE], [GROUNDED]
 *   - 순수 함수 — 서버/클라이언트 양쪽에서 사용 가능
 * @domain question
 * @access shared
 */

import type {
  ParsedAiResponse,
  ChatMode,
  AnswerCheck,
  RequiredAiTag,
  AnswerCheckSource,
} from '@/types';

const VALID_MODES: ChatMode[] = ['grill-me', 'guide-me', 'quick-me'];
const VALID_ANSWER_CHECKS: AnswerCheck[] = ['correct', 'partial', 'wrong'];
const STRIP_TAG_PATTERN =
  /\[(?:RECOMMENDATION|ANSWER_CHECK|MODE_SWITCH|MISCONCEPTION_TYPE|GROUNDED)[^\]]*\](?:\s*추천:\s*"[^"]*")?/g;
const ANSWER_CHECK_FALLBACK_PATTERNS: Record<AnswerCheck, RegExp[]> = {
  wrong: [/틀렸/, /아니에요/, /다시 생각/, /조금 달라요/, /아직 아니/, /놓쳤어요/, /잘못된 것 같/],
  partial: [/거의 맞/, /부분적으로/, /방향은 맞/, /조금만 더/, /한 번 더/, /작은 실수/],
  correct: [/^맞아요!?/, /^좋아요!?/, /^정확히/, /^잘 하셨/, /^정확히 이해하셨/],
};

function inferAnswerCheck(content: string): AnswerCheck | undefined {
  const normalizedContent = content.replace(/\s+/g, ' ').trim();

  for (const answerCheck of VALID_ANSWER_CHECKS) {
    const patterns = ANSWER_CHECK_FALLBACK_PATTERNS[answerCheck];
    if (patterns.some((pattern) => pattern.test(normalizedContent))) {
      return answerCheck;
    }
  }

  return undefined;
}

function collectMissingRequiredTags(params: {
  recommendation?: string;
  answerCheck?: AnswerCheck;
  hasExplicitAnswerCheck: boolean;
  hasExplicitGrounded: boolean;
}): RequiredAiTag[] {
  const missingTags: RequiredAiTag[] = [];

  if (!params.recommendation) {
    missingTags.push('recommendation');
  }

  if (!params.hasExplicitAnswerCheck || !params.answerCheck) {
    missingTags.push('answerCheck');
  }

  if (!params.hasExplicitGrounded) {
    missingTags.push('grounded');
  }

  return missingTags;
}

export function stripAiMetadataTags(text: string): string {
  return text.replace(STRIP_TAG_PATTERN, '').replace(/\n{3,}/g, '\n\n').trim();
}

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
  let hasExplicitAnswerCheck = false;
  let hasExplicitGrounded = false;
  let answerCheckSource: AnswerCheckSource = 'missing';

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
      hasExplicitAnswerCheck = true;
      answerCheckSource = 'explicit';
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
    hasExplicitGrounded = true;
    content = content.replace(groundedMatch[0], '');
  }

  content = stripAiMetadataTags(content);

  if (!answerCheck) {
    answerCheck = inferAnswerCheck(content);
    if (answerCheck) {
      answerCheckSource = 'inferred';
    }
  }

  const missingRequiredTags = collectMissingRequiredTags({
    recommendation,
    answerCheck,
    hasExplicitAnswerCheck,
    hasExplicitGrounded,
  });

  return {
    content,
    recommendation,
    modeSwitch,
    answerCheck,
    answerCheckSource,
    hasExplicitAnswerCheck,
    misconceptionType,
    grounded,
    hasExplicitGrounded,
    missingRequiredTags,
  };
}
