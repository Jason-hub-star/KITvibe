/**
 * @file app/student/ask/page.tsx
 * @description P-003 학생 질문 페이지
 *   - ?lesson=uuid → 해당 수업 채팅
 *   - lesson 없으면 → 수업 선택 UI
 * @domain question
 * @access shared
 */

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import QuestionChat from '@/components/student/QuestionChat';
import { LessonSearchList } from '@/components/lesson/LessonSearchList';

interface PageProps {
  searchParams: Promise<{ lesson?: string }>;
}

export default async function StudentAskPage({ searchParams }: PageProps) {
  const { lesson: lessonId } = await searchParams;
  const supabase = createSupabaseAdmin();

  // lesson ID가 있으면 채팅 모드
  if (lessonId) {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('id, title, topic, subject')
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      return (
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
          <h1 className="text-2xl font-bold">수업을 찾을 수 없어요</h1>
          <p className="mt-2 text-muted-foreground">올바른 수업 링크인지 확인해주세요.</p>
          <Link
            href="/student/ask"
            className="mt-6 text-primary underline hover:text-primary/80"
          >
            수업 목록으로 돌아가기
          </Link>
        </main>
      );
    }

    return (
      <QuestionChat
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        topic={lesson.topic ?? lesson.title}
      />
    );
  }

  // lesson ID 없으면 수업 선택 UI
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, topic, subject, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background border-b border-border z-50">
        <div className="flex items-center w-full px-4 h-16 max-w-4xl mx-auto gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-muted transition-colors"
           
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-base font-bold tracking-tight">수업 선택</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-24 pb-12">
        {!lessons || lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <BookOpen className="size-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">아직 등록된 수업이 없어요</h2>
            <p className="mt-2 text-muted-foreground">
              선생님이 수업을 업로드하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              질문할 수업을 선택하세요
            </label>
            <LessonSearchList
              lessons={lessons}
              routeBase="/student/ask"
              searchPlaceholder="수업 제목이나 주제로 검색"
              emptyTitle="등록된 수업이 없습니다."
              emptyDescription="선생님이 수업을 업로드하면 여기에 표시됩니다."
              emptySearchMessage="검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요."
            />
          </div>
        )}
      </main>
    </div>
  );
}
