/**
 * @file components/teacher/DashboardMisconceptionLoader.tsx
 * @description 대시보드 오개념 요약 자동 생성 트리거
 *   - misconception_summaries 비어있으면 POST 호출
 *   - 생성된 summaries로 AI Spotlight + Curriculum 카드 렌더링
 * @domain misconception
 * @access client
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { MisconceptionSummary } from '@/types';
import { AISpotlightCard } from '@/components/teacher/AISpotlightCard';
import { CurriculumCard } from '@/components/teacher/CurriculumCard';

interface Props {
  lessonId: string;
  hasSummaries: boolean;
  initialSummaries: MisconceptionSummary[];
  totalQuestions: number;
}

export function DashboardMisconceptionLoader({ lessonId, hasSummaries, initialSummaries, totalQuestions }: Props) {
  const [generatedSummaries, setGeneratedSummaries] = useState<MisconceptionSummary[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasSummaries || hasTriggered.current) return;
    hasTriggered.current = true;

    let cancelled = false;

    async function generate() {
      setIsGenerating(true);
      try {
        const res = await fetch(`/api/lessons/${lessonId}/misconceptions`, {
          method: 'POST',
        });
        if (res.ok && !cancelled) {
          const json = await res.json();
          if (json.success) {
            setGeneratedSummaries(json.data);
          }
        }
      } catch {
        // 실패해도 대시보드는 표시
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    }

    generate();

    return () => { cancelled = true; };
  }, [lessonId, hasSummaries]);

  if (isGenerating) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground animate-pulse">
          AI가 오개념을 분석하고 있습니다...
        </p>
      </div>
    );
  }

  const summaries = generatedSummaries ?? initialSummaries;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AISpotlightCard summaries={summaries} totalQuestions={totalQuestions} />
      <CurriculumCard summaries={summaries} />
    </section>
  );
}
