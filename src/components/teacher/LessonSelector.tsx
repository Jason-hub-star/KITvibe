/**
 * @file components/teacher/LessonSelector.tsx
 * @description 수업 선택 UI — 대시보드 진입 전 수업 검색 목록
 *   - 제목/주제/과목 검색
 *   - 수업 카드 클릭 → ?lesson=uuid 쿼리스트링 이동
 * @domain lesson
 * @access client
 */

'use client';

import { LessonSearchList } from '@/components/lesson/LessonSearchList';
import type { Lesson } from '@/types';

interface Props {
  lessons: Lesson[];
}

export function LessonSelector({ lessons }: Props) {
  return (
    <LessonSearchList
      lessons={lessons}
      routeBase="/teacher/dashboard"
      searchPlaceholder="수업 제목이나 주제로 검색"
      emptyTitle="등록된 수업이 없습니다."
      emptyDescription="먼저 수업 자료를 업로드해 주세요."
      emptySearchMessage="검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요."
    />
  );
}
