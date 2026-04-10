/**
 * @file utils/quickMode.ts
 * @description Quick-Me 자동 전환 키워드와 탐지 유틸
 * @domain question
 * @access shared
 */

import type { ChatMode } from '@/types/question.types';

export const QUICK_MODE_TRIGGER_KEYWORDS = [
  '답만',
  '빨리',
  '시간 없어',
  '바로 풀어줘',
] as const;

const QUICK_MODE_TRIGGER_PATTERN = /(답만|빨리|시간\s*없어|바로\s*풀어줘)/i;

export function hasQuickModeTrigger(text: string): boolean {
  return QUICK_MODE_TRIGGER_PATTERN.test(text.trim());
}

export function resolveRequestedMode(currentMode: ChatMode, text: string): ChatMode {
  if (hasQuickModeTrigger(text)) {
    return 'quick-me';
  }

  return currentMode;
}
