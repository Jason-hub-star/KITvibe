/**
 * @file app/teacher/dashboard/page.tsx
 * @description P-004 교사 대시보드 페이지 — Stitch 에디토리얼 스타일
 *   - searchParams.lesson이 있으면 대시보드, 없으면 수업 선택
 *   - Server Component: 데이터 페칭 후 props 전달
 * @domain misconception
 * @access shared
 */

import { getDashboardData } from '@/lib/actions/dashboard';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { DashboardStats } from '@/components/teacher/DashboardStats';
import { MisconceptionHeatmap } from '@/components/teacher/MisconceptionHeatmap';
import { TopQuestionsCard } from '@/components/teacher/TopQuestionsCard';
import { QuestionLogTable } from '@/components/teacher/QuestionLogTable';
import { LessonSelector } from '@/components/teacher/LessonSelector';
import { DashboardMisconceptionLoader } from '@/components/teacher/DashboardMisconceptionLoader';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { Lesson, DashboardData } from '@/types';

interface PageProps {
  searchParams: Promise<{ lesson?: string }>;
}

/** 안전하게 대시보드 데이터 로드 (에러 시 null) */
async function loadDashboardData(lessonId: string): Promise<DashboardData | null> {
  try {
    return await getDashboardData(lessonId);
  } catch (err) {
    console.error('[TeacherDashboardPage]', err);
    return null;
  }
}

export default async function TeacherDashboardPage({ searchParams }: PageProps) {
  const { lesson: lessonId } = await searchParams;

  // 수업 미선택 → 수업 목록 표시
  if (!lessonId) {
    return <LessonSelectView />;
  }

  const data = await loadDashboardData(lessonId);

  // 데이터 로드 실패
  if (!data) {
    return (
      <>
        <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
          <h1 className="text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground mb-8">
            대시보드
          </h1>
          <p className="text-sm text-muted-foreground">
            데이터를 불러올 수 없습니다. 수업 ID를 확인해 주세요.
          </p>
        </main>
        <LandingFooter />
      </>
    );
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-24">
        {/* 수업 메타 */}
        <div className="mb-12">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {data.lesson.topic ?? '수업 대시보드'}
          </span>
          <h1 className="text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground mt-2">
            {data.lesson.title}
          </h1>
          <span className="text-xs text-muted-foreground mt-2 block">
            {new Date(data.lesson.created_at).toLocaleDateString('ko-KR')}
          </span>
        </div>

        {/* 3열 통계 */}
        <section className="mb-16">
          <DashboardStats stats={data.stats} />
        </section>

        {/* 12열 그리드: 좌 히트맵+TOP5, 우 질문로그 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          <div className="lg:col-span-4 space-y-6">
            <MisconceptionHeatmap items={data.heatmap} />
            <TopQuestionsCard questions={data.topQuestions} />
          </div>
          <div className="lg:col-span-8">
            <QuestionLogTable logs={data.questionLog} />
          </div>
        </section>

        {/* AI Spotlight + Curriculum — misconception 자동 생성 포함 */}
        <DashboardMisconceptionLoader
          lessonId={lessonId}
          hasSummaries={data.misconceptionSummaries.length > 0}
          initialSummaries={data.misconceptionSummaries}
          totalQuestions={data.stats.totalQuestions}
        />
      </main>
      <LandingFooter />
    </>
  );
}

/** 수업 선택 뷰 (수업 목록 표시) */
async function LessonSelectView() {
  const supabase = createSupabaseAdmin();

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        <h1 className="text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground mb-4">
          교사 대시보드
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          대시보드를 볼 수업을 선택해 주세요.
        </p>
        <LessonSelector lessons={(lessons ?? []) as Lesson[]} />
      </main>
      <LandingFooter />
    </>
  );
}
