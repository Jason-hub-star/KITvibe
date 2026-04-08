/**
 * @file app/student/summary/page.tsx
 * @description P-005 학생 세션 요약 페이지 진입점
 *   - 서버에서 session query를 읽고 client 뷰에 전달
 * @domain session
 * @access server-only
 */

import SessionSummaryView from '@/components/student/SessionSummaryView';

interface PageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function StudentSummaryPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return <SessionSummaryView sessionId={params.session ?? null} />;
}
