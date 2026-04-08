/**
 * @file components/student/SessionSummaryView.tsx
 * @description 학생 세션 요약 화면 렌더링
 *   - 요약 API 조회
 *   - 세션 회고 카드 표시
 * @domain session
 * @access client
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';

interface SessionSummaryViewProps {
  sessionId: string | null;
}

interface SessionSummaryData {
  session_id: string;
  lesson_id: string;
  lesson_title: string;
  question_count: number;
  current_step: number;
  summary_text: string;
  next_recommendation: string;
  concepts: string[];
  quiz_passed: boolean | null;
}

export default function SessionSummaryView({ sessionId }: SessionSummaryViewProps) {
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!sessionId) {
        setError('세션 ID가 없어서 요약을 불러올 수 없어요.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/sessions/${sessionId}/summary`);
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || '세션 요약 조회 실패');
        }

        if (!cancelled) {
          setSummary(data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '세션 요약 조회 실패');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <p className="text-sm text-muted-foreground">세션 요약을 불러오는 중이에요...</p>
      </main>
    );
  }

  if (error || !summary || !sessionId) {
    return (
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-3xl font-bold tracking-tight">요약을 불러올 수 없어요</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error ?? '세션 정보가 없습니다.'}</p>
        <Link
          href="/student/ask"
          className="mt-6 inline-flex items-center gap-2 text-primary underline"
        >
          <ArrowLeft className="size-4" />
          질문 화면으로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 pt-16 pb-24 space-y-8">
      <header className="space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Session Summary
        </span>
        <h1 className="text-4xl md:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground">
          {summary.lesson_title}
        </h1>
        <p className="text-sm text-muted-foreground">
          이번 세션에서 어디까지 이해했는지 한 번에 정리했어요.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="border border-border bg-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            질문 수
          </p>
          <p className="mt-3 text-3xl font-bold">{summary.question_count}</p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            도달 단계
          </p>
          <p className="mt-3 text-3xl font-bold">{summary.current_step}/4</p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            미니퀴즈
          </p>
          <p className="mt-3 text-lg font-bold">
            {summary.quiz_passed ? '오개념 회복' : summary.quiz_passed === false ? '한 번 더 복습' : '미실시'}
          </p>
        </div>
      </section>

      <section className="border border-border bg-card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-primary" />
          <h2 className="text-xl font-bold">이번 세션 요약</h2>
        </div>
        <p className="text-base leading-relaxed text-foreground">{summary.summary_text}</p>
      </section>

      <section className="border border-border bg-card p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold">다룬 핵심 개념</h2>
        <div className="flex flex-wrap gap-2">
          {summary.concepts.map((concept) => (
            <span
              key={concept}
              className="border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {concept}
            </span>
          ))}
        </div>
      </section>

      <section className="border border-border bg-card p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold">다음 추천 행동</h2>
        <p className="text-base leading-relaxed text-foreground">{summary.next_recommendation}</p>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/student/ask?lesson=${summary.lesson_id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-sm font-medium"
        >
          <RotateCcw className="size-4" />
          같은 수업 이어서 질문하기
        </Link>
        <Link
          href="/student/ask"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          다른 수업으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
