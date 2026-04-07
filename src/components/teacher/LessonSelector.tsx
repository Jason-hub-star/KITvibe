/**
 * @file components/teacher/LessonSelector.tsx
 * @description 수업 선택 UI — 대시보드 진입 전 수업 목록
 *   - 수업 카드 클릭 → ?lesson=uuid 쿼리스트링 이동
 * @domain lesson
 * @access client
 */

'use client';

import { useRouter } from 'next/navigation';
import type { Lesson } from '@/types';

interface Props {
  lessons: Lesson[];
}

export function LessonSelector({ lessons }: Props) {
  const router = useRouter();

  if (lessons.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">
          등록된 수업이 없습니다. 먼저 수업 자료를 업로드해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <button
          key={lesson.id}
          onClick={() => router.push(`/teacher/dashboard?lesson=${lesson.id}`)}
          className="w-full text-left border border-border bg-card p-4 hover:bg-muted transition-colors flex justify-between items-center gap-4"
        >
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-foreground">{lesson.title}</span>
            {lesson.topic && (
              <span className="text-xs text-muted-foreground">{lesson.topic}</span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase shrink-0">
            {new Date(lesson.created_at).toLocaleDateString('ko-KR')}
          </span>
        </button>
      ))}
    </div>
  );
}
