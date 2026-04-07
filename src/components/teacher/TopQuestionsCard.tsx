/**
 * @file components/teacher/TopQuestionsCard.tsx
 * @description TOP 5 질문 카드 — Stitch P004 스타일
 *   - font-black text-xl 번호 (01~05) + 질문 원문
 * @domain misconception
 * @access client
 */

import type { TopQuestion } from '@/types';

interface Props {
  questions: TopQuestion[];
}

export function TopQuestionsCard({ questions }: Props) {
  if (questions.length === 0) {
    return (
      <div className="bg-card border border-border p-6">
        <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-6">
          질문 TOP 5
        </h3>
        <p className="text-sm text-muted-foreground">아직 질문이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6">
      <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-6">
        질문 TOP 5
      </h3>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="flex gap-4 items-start">
            <span className="text-xl font-black text-foreground tabular-nums shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {q.questionText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
