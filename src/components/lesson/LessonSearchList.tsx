/**
 * @file components/lesson/LessonSearchList.tsx
 * @description 학생/교사 공용 수업 검색 목록
 *   - 제목/주제/과목 클라이언트 필터링
 *   - routeBase 기준으로 수업 상세 이동
 * @domain lesson
 * @access client
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Lesson } from '@/types';

type LessonSearchItem = Pick<Lesson, 'id' | 'title' | 'topic' | 'subject' | 'created_at'>;

interface LessonSearchListProps {
  lessons: LessonSearchItem[];
  routeBase: '/student/ask' | '/teacher/dashboard';
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  emptySearchMessage: string;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function LessonSearchList({
  lessons,
  routeBase,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  emptySearchMessage,
}: LessonSearchListProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredLessons = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) {
      return lessons;
    }

    return lessons.filter((lesson) => {
      const searchable = [
        normalizeText(lesson.title),
        normalizeText(lesson.topic),
        normalizeText(lesson.subject),
      ];

      return searchable.some((value) => value.includes(normalizedQuery));
    });
  }, [lessons, query]);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-16 border border-border bg-card">
        <p className="text-base font-bold text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-12 border-border bg-card pl-10 pr-3 text-sm text-foreground"
          aria-label="수업 검색"
        />
      </div>

      {filteredLessons.length === 0 ? (
        <div className="border border-border bg-card px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">{emptySearchMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => router.push(`${routeBase}?lesson=${lesson.id}`)}
              className="w-full text-left border border-border bg-card p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-bold text-foreground break-words">{lesson.title}</p>
                  {lesson.topic && (
                    <p className="mt-1 text-sm text-muted-foreground break-words">{lesson.topic}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {lesson.subject || 'math'}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {new Date(lesson.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
