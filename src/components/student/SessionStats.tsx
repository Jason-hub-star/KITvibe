/**
 * @file components/student/SessionStats.tsx
 * @description 학습 통계 Bento Grid — Stitch 간소화 버전
 *   - 학습 개념 + 진행 상태 2열
 * @domain question
 * @access client
 */

'use client';

import { GraduationCap, TrendingUp } from 'lucide-react';

interface SessionStatsProps {
  topic: string;
  currentStep: number;
}

export default function SessionStats({ topic, currentStep }: SessionStatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 학습 개념 */}
      <div
        className="bg-muted border border-border p-8 flex flex-col justify-between"
        style={{ borderRadius: 0 }}
      >
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            학습 개념
          </label>
          <h3 className="text-2xl font-bold mt-2 text-foreground">{topic}</h3>
        </div>
        <div className="mt-8">
          <GraduationCap className="size-10 text-primary" />
        </div>
      </div>

      {/* 진행 상태 */}
      <div
        className="bg-muted border border-border p-8 flex flex-col justify-between"
        style={{ borderRadius: 0 }}
      >
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            진행 상태
          </label>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-6xl font-extrabold tracking-tighter text-primary">
              {currentStep}
            </span>
            <span className="text-2xl font-bold text-primary">/ 4</span>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <TrendingUp className="size-10 text-primary" />
        </div>
      </div>
    </section>
  );
}
