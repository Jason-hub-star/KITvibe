/**
 * @file components/student/SessionStats.tsx
 * @description 학습 진행 요약 — 간결한 인라인 표시
 * @domain question
 * @access client
 */

'use client';

import type { ChatMode } from '@/types/question.types';
import {
  getChatStep,
  getNextChatStep,
  getStepAdvanceHint,
  getStepRewardCopy,
} from '@/utils/chatSteps';

interface SessionStatsProps {
  topic: string;
  currentStep: number;
  mode: ChatMode;
}

export default function SessionStats({ topic, currentStep, mode }: SessionStatsProps) {
  const messages = [
    '좋아요, 한 걸음 더 나아갔어요!',
    '거의 다 왔어요, 조금만 더!',
    '마지막 질문이에요, 화이팅!',
    '대단해요! 모든 단계를 완료했어요!',
  ];
  const msg = messages[Math.min(currentStep - 1, messages.length - 1)];
  const currentStepInfo = getChatStep(currentStep);
  const nextStepInfo = getNextChatStep(currentStep);
  const advanceHint = getStepAdvanceHint(mode, currentStep);
  const rewardCopy = getStepRewardCopy(currentStep);

  return (
    <div className="space-y-4 border border-border bg-muted px-4 py-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <span className="text-xs text-muted-foreground">
          {topic} · {msg}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
          {currentStepInfo.label} {currentStep}/4
        </span>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 transition-colors ${
              step <= currentStep ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">다음 단계</p>
          <p className="mt-1 text-sm text-foreground">
            {nextStepInfo ? `${nextStepInfo.label} · ${nextStepInfo.description}` : '미니퀴즈 확인'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">이동 조건</p>
          <p className="mt-1 text-sm text-foreground">{advanceHint}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">보상</p>
          <p className="mt-1 text-sm text-foreground">{rewardCopy}</p>
        </div>
      </div>
    </div>
  );
}
