/**
 * @file app/teacher/dashboard/loading.tsx
 * @description 대시보드 로딩 스켈레톤 — Stitch 에디토리얼 스타일
 * @domain misconception
 * @access shared
 */

export default function DashboardLoading() {
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-24 animate-pulse">
      {/* 수업 메타 스켈레톤 */}
      <div className="mb-12">
        <div className="h-3 w-24 bg-muted mb-4" />
        <div className="h-12 w-64 bg-muted mb-2" />
        <div className="h-3 w-20 bg-muted" />
      </div>

      {/* 3열 통계 스켈레톤 */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-start gap-2">
            <div className="h-3 w-16 bg-muted" />
            <div className="h-16 w-24 bg-muted" />
          </div>
        ))}
      </section>

      {/* 그리드 스켈레톤 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="h-48 bg-muted border border-border" />
          <div className="h-32 bg-muted border border-border" />
        </div>
        <div className="lg:col-span-8">
          <div className="h-64 bg-muted border border-border" />
        </div>
      </section>
    </main>
  );
}
