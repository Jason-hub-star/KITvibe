/**
 * @file app/teacher/upload/page.tsx
 * @description P-002 교사 수업 자료 업로드 페이지 — Stitch 스타일
 *   - 대형 헤드라인 (3.5rem)
 *   - 역할 검증 (교사만 접근)
 * @domain lesson
 * @access shared
 */

import TeacherUploadGuard from '@/components/teacher/TeacherUploadGuard';
import { LandingFooter } from '@/components/layout/LandingFooter';

export default function TeacherUploadPage() {
  return (
    <>
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        {/* Stitch 스타일 대형 헤드라인 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-foreground mb-16">
          수업 자료 등록
        </h1>
        <p className="ui-support mb-10 text-muted-foreground">
          교사용 작성 경로입니다. 운영 단계에서는 교사 인증 이후에만 수업 자료와 대시보드를 수정할 수 있습니다.
        </p>
        <TeacherUploadGuard />
      </main>
      <LandingFooter />
    </>
  );
}
