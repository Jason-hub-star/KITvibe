/**
 * @file components/teacher/LessonMaterialsCard.tsx
 * @description 교사 대시보드 수업 자료 기록 카드
 *   - 파일명 + 업로드 시각 + 자료 수 표시
 * @domain lesson
 * @access client
 */

import type { DashboardMaterialReference } from '@/types';

interface Props {
  materials: DashboardMaterialReference[];
}

export function LessonMaterialsCard({ materials }: Props) {
  return (
    <section className="bg-card border border-border p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            수업 자료 기록
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
            사용 중인 자료 {materials.length}개
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {materials.map((material) => (
          <div key={`${material.file_name}-${material.created_at}`} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
            <p className="text-sm font-semibold text-foreground break-words">
              {material.file_name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              업로드: {new Date(material.created_at).toLocaleString('ko-KR')}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
