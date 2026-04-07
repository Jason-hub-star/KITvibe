/**
 * @file components/teacher/AISpotlightCard.tsx
 * @description AI 보충 추천 카드 — Stitch P004 스타일
 *   - bg-primary text-primary-foreground p-8
 *   - "집중 관리가 필요한 학생" 헤드라인 + 우측 "AI" decorative
 * @domain misconception
 * @access client
 */

import type { MisconceptionSummary } from '@/types';

interface Props {
  summaries: MisconceptionSummary[];
  totalQuestions: number;
}

export function AISpotlightCard({ summaries, totalQuestions }: Props) {
  const topConcept = summaries[0];
  const description = topConcept
    ? `최근 ${totalQuestions}개 질문 중 "${topConcept.concept_name}" 관련 오개념이 ${topConcept.frequency}회 이상 감지되었습니다.`
    : '아직 분석할 데이터가 충분하지 않습니다.';

  return (
    <div className="bg-primary text-primary-foreground p-8 flex justify-between items-start gap-8 overflow-hidden relative">
      <div className="flex flex-col gap-4 z-10">
        <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
          AI 보충 분석
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
          집중 관리가 필요한 학생
        </h3>
        <p className="text-sm opacity-80 max-w-md leading-relaxed">
          {description}
        </p>
        <button className="bg-background text-foreground px-6 py-2 text-xs font-bold tracking-widest uppercase w-fit hover:bg-background/90 transition-colors">
          리포트 확인
        </button>
      </div>
      <span className="text-[120px] font-black leading-none opacity-10 select-none absolute right-8 top-1/2 -translate-y-1/2">
        AI
      </span>
    </div>
  );
}
