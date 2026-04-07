/**
 * @file components/teacher/DashboardStats.tsx
 * @description 대시보드 3열 통계 카드 — Stitch P004 스타일
 *   - 질문 합계, 활성 학생, 평균 회복률
 *   - text-6xl font-extrabold + 10px uppercase 라벨
 * @domain misconception
 * @access client
 */

import type { DashboardStats as DashboardStatsType } from '@/types';

interface Props {
  stats: DashboardStatsType;
}

export function DashboardStats({ stats }: Props) {
  const isEmpty = stats.totalQuestions === 0;

  const items = [
    { label: '질문 합계', value: stats.totalQuestions.toString() },
    { label: '활성 학생', value: stats.activeStudents.toString() },
    { label: '평균 회복률', value: isEmpty ? '—' : `${stats.recoveryRate}%` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-start gap-2">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {item.label}
          </span>
          <span className="text-6xl font-extrabold tracking-tighter text-foreground">
            {item.value}
          </span>
        </div>
      ))}
      {isEmpty && (
        <p className="col-span-full text-sm text-muted-foreground mt-2">
          아직 학생 질문이 없습니다. 학생이 질문을 시작하면 통계가 표시됩니다.
        </p>
      )}
    </div>
  );
}
