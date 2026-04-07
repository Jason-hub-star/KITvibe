/**
 * @file app/not-found.tsx
 * @description 404 페이지 — 존재하지 않는 경로 접근 시
 * @domain shared
 * @access shared
 */

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <BookOpen className="size-8 text-muted-foreground mb-4" strokeWidth={1.5} />
      <h2 className="text-2xl font-bold mb-2">페이지를 찾을 수 없어요</h2>
      <p className="text-sm text-muted-foreground mb-8">
        주소가 맞는지 확인해주세요.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
