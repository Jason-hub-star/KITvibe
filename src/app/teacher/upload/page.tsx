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
        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground mb-16">
          수업 자료 등록
        </h1>
        <TeacherUploadGuard />
      </main>
      <LandingFooter />
    </>
  );
}
