/**
 * @file components/teacher/TeacherUploadGuard.tsx
 * @description 교사 역할 검증 가드 + UploadForm 렌더링
 *   - 교사가 아니면 홈으로 리다이렉트
 * @domain lesson
 * @access client
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/components/layout/RoleProvider';
import UploadForm from '@/components/teacher/UploadForm';

export default function TeacherUploadGuard() {
  const { role, userId, isLoaded } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && role !== 'teacher') {
      router.replace('/');
    }
  }, [isLoaded, role, router]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12 text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (role !== 'teacher' || !userId) {
    return null;
  }

  return <UploadForm teacherId={userId} />;
}
