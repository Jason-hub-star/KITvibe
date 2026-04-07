/**
 * @file components/teacher/MisconceptionHeatmap.tsx
 * @description 오개념 히트맵 — Stitch P004 수평 Progress 바 스타일
 *   - 각 행: 개념명(좌) + 퍼센티지(우) + 수평 바
 * @domain misconception
 * @access client
 */

import type { MisconceptionHeatmapItem } from '@/types';

interface Props {
  items: MisconceptionHeatmapItem[];
}

export function MisconceptionHeatmap({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-card border border-border p-6">
        <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-6">
          오개념 히트맵
        </h3>
        <p className="text-sm text-muted-foreground">아직 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6">
      <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-6">
        오개념 히트맵
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.conceptName} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                {item.conceptName}
              </span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {item.percentage}%
              </span>
            </div>
            <div className="h-4 w-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
