/**
 * @file components/teacher/DashboardMisconceptionLoader.tsx
 * @description 대시보드 오개념 요약 자동 생성 트리거
 *   - misconception_summaries 비어있으면 POST 호출
 *   - 생성된 summaries로 AI Spotlight + Curriculum 카드 렌더링
 * @domain misconception
 * @access client
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MisconceptionSummary } from '@/types';
import { AISpotlightCard } from '@/components/teacher/AISpotlightCard';
import { CurriculumCard } from '@/components/teacher/CurriculumCard';

const MISCONCEPTION_GENERATION_TIMEOUT_MS = 6000;

interface Props {
  lessonId: string;
  hasSummaries: boolean;
  initialSummaries: MisconceptionSummary[];
  totalQuestions: number;
}

export function DashboardMisconceptionLoader({ lessonId, hasSummaries, initialSummaries, totalQuestions }: Props) {
  const [generatedSummaries, setGeneratedSummaries] = useState<MisconceptionSummary[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'timeout' | 'error'>('idle');
  const hasTriggered = useRef(false);

  const generate = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MISCONCEPTION_GENERATION_TIMEOUT_MS);

    setStatus('loading');

    try {
      const res = await fetch(`/api/lessons/${lessonId}/misconceptions`, {
        method: 'POST',
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error('misconception generation failed');
      }

      const json = await res.json();
      if (json.success) {
        setGeneratedSummaries(json.data);
        setStatus('idle');
        return;
      }

      setStatus('error');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus('timeout');
        return;
      }

      setStatus('error');
    } finally {
      clearTimeout(timeoutId);
    }
  }, [lessonId]);

  useEffect(() => {
    if (hasSummaries || hasTriggered.current) return;
    hasTriggered.current = true;
    void generate();
  }, [generate, hasSummaries]);

  if (status === 'loading') {
    return (
      <div className="border border-border bg-surface-low px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          AI가 오개념을 분석하고 있습니다...
        </p>
      </div>
    );
  }

  const summaries = generatedSummaries ?? initialSummaries;

  if (summaries.length === 0) {
    return (
      <div className="border border-border bg-surface-low px-6 py-8">
        <p className="text-sm text-foreground">
          {status === 'timeout'
            ? '오개념 분석이 예상보다 오래 걸리고 있어요. 잠시 후 다시 시도해 주세요.'
            : '오개념 요약을 아직 만들지 못했어요. 다시 시도하면 최신 질문으로 분석합니다.'}
        </p>
        <button
          type="button"
          onClick={() => void generate()}
          className="mt-4 border border-border bg-background px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          다시 분석
        </button>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AISpotlightCard summaries={summaries} totalQuestions={totalQuestions} />
      <CurriculumCard summaries={summaries} />
    </section>
  );
}
