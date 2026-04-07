/**
 * @file app/error.tsx
 * @description 글로벌 에러 바운더리 — 런타임 에러 시 사용자 친화적 화면
 * @domain shared
 * @access client
 */

'use client';

import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <BookOpen className="size-8 text-muted-foreground mb-4" strokeWidth={1.5} />
      <h2 className="text-2xl font-bold mb-2">문제가 발생했어요</h2>
      <p className="text-sm text-muted-foreground mb-8">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
      >
        다시 시도
      </button>
    </div>
  );
}
