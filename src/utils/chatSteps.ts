/**
 * @file utils/chatSteps.ts
 * @description Grill-Me 4단계 진행 상수
 *   - 단계 라벨/설명
 *   - 다음 단계 및 보상 문구
 * @domain question
 * @access shared
 */

import type { ChatMode } from '@/types/question.types';

export interface ChatStepDefinition {
  step: number;
  label: string;
  description: string;
}

export const CHAT_STEPS: ChatStepDefinition[] = [
  { step: 1, label: '접근법', description: '어디서 시작할지 떠올리는 단계' },
  { step: 2, label: '핵심 개념', description: '필요한 개념과 공식을 연결하는 단계' },
  { step: 3, label: '유사 적용', description: '비슷한 문제에 같은 원리를 적용하는 단계' },
  { step: 4, label: '풀이 설명', description: '스스로 풀이를 설명해보는 단계' },
];

export function getChatStep(step: number): ChatStepDefinition {
  return CHAT_STEPS[Math.min(Math.max(step, 1), CHAT_STEPS.length) - 1];
}

export function getNextChatStep(step: number): ChatStepDefinition | null {
  if (step >= CHAT_STEPS.length) {
    return null;
  }

  return CHAT_STEPS[step];
}

export function getStepAdvanceHint(mode: ChatMode, currentStep: number): string {
  if (currentStep >= CHAT_STEPS.length) {
    return '4/4를 마치면 미니퀴즈가 열려요.';
  }

  if (mode === 'guide-me') {
    return '이해했다고 설명하면 다음 단계로 넘어가요.';
  }

  return '부분정답 이상이면 다음 단계로 넘어가요.';
}

export function getStepRewardCopy(currentStep: number): string {
  if (currentStep >= CHAT_STEPS.length) {
    return '미니퀴즈 통과 시 오개념 회복으로 표시돼요.';
  }

  return '4/4 완료 시 미니퀴즈가 열리고 세션 요약으로 이어져요.';
}
