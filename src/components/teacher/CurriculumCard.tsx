/**
 * @file components/teacher/CurriculumCard.tsx
 * @description AI 커리큘럼 추천 카드 — Stitch P004 스타일
 *   - bg-muted p-8 + 4칸 segment 진행도 바
 * @domain misconception
 * @access client
 */

import type { MisconceptionSummary } from '@/types';

interface Props {
  summaries: MisconceptionSummary[];
}

export function CurriculumCard({ summaries }: Props) {
  const completedSteps = Math.min(summaries.length, 4);
  const topConcept = summaries[0];

  return (
    <div className="bg-muted p-8 flex flex-col gap-4">
      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        AI 커리큘럼 추천
      </span>
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
        {topConcept ? `${topConcept.concept_name} 심화 과정` : '커리큘럼 준비 중'}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
        {topConcept
          ? topConcept.summary_text
          : '학생 질문 데이터가 쌓이면 맞춤 커리큘럼을 추천해 드립니다.'}
      </p>

      {/* 4칸 세그먼트 진행도 바 */}
      <div className="flex gap-1 mt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 ${
              i < completedSteps ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold tracking-widest text-muted-foreground tabular-nums">
        {completedSteps}/4 분석 완료
      </span>
    </div>
  );
}
