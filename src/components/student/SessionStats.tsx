/**
 * @file components/student/SessionStats.tsx
 * @description 학습 진행 요약 — 간결한 인라인 표시
 * @domain question
 * @access client
 */

'use client';

interface SessionStatsProps {
  topic: string;
  currentStep: number;
}

export default function SessionStats({ topic, currentStep }: SessionStatsProps) {
  const messages = [
    '좋아요, 한 걸음 더 나아갔어요!',
    '거의 다 왔어요, 조금만 더!',
    '마지막 질문이에요, 화이팅!',
    '대단해요! 모든 단계를 완료했어요!',
  ];
  const msg = messages[Math.min(currentStep - 1, messages.length - 1)];

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-muted border border-border">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 w-8 transition-colors ${
              step <= currentStep ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {topic} · {msg}
      </span>
    </div>
  );
}
