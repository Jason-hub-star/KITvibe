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
  quickModeCount: number;
  quickModeRate: number;
}

export function AISpotlightCard({ summaries, totalQuestions, quickModeCount, quickModeRate }: Props) {
  const topConcept = summaries[0];
  const description = topConcept
    ? `최근 ${totalQuestions}개 질문 중 "${topConcept.concept_name}" 관련 오개념이 ${topConcept.frequency}회 이상 감지되었습니다.`
    : '아직 분석할 데이터가 충분하지 않습니다.';

  return (
    <div className="bg-surface-high border border-border text-foreground p-6 sm:p-8 flex justify-between items-start gap-6 sm:gap-8 overflow-hidden relative">
      <div className="flex flex-col gap-4 z-10">
        <span className="ui-kicker text-muted-foreground">
          AI 보충 분석
        </span>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight break-words">
          집중 관리가 필요한 학생
        </h3>
        <p className="ui-support text-muted-foreground max-w-md">
          {description}
        </p>
        <p className="ui-micro text-muted-foreground">
          빠른 풀이 사용 {quickModeCount}건 · 전체 질문 대비 {quickModeRate}%
        </p>
        <a
          href="#lesson-report"
          className="ui-micro-strong border border-border bg-background px-6 py-2 w-fit transition-colors hover:bg-card"
        >
          리포트 확인
        </a>
      </div>
      <span className="text-[84px] sm:text-[120px] font-black leading-none text-foreground/10 select-none absolute right-4 sm:right-8 top-1/2 -translate-y-1/2">
        AI
      </span>
    </div>
  );
}
