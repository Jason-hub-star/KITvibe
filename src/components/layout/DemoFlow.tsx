/**
 * @file components/layout/DemoFlow.tsx
 * @description 랜딩 데모 흐름 애니메이션 — 3단계 시뮬레이션
 *   - CSS 애니메이션으로 타이핑 효과 + 단계별 전환
 *   - 외부 라이브러리 없이 순수 CSS + React
 * @domain shared
 * @access client
 */

'use client';

import { useState, useEffect } from 'react';
import { Upload, MessageCircle, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    step: '01',
    title: '수업자료 업로드',
    desc: '선생님이 PDF를 올리면, AI가 핵심 개념을 자동으로 파악해요.',
    demo: {
      label: '이차방정식의 근의 공식.pdf',
      sub: '텍스트 추출 → 지식베이스 구축 완료',
    },
  },
  {
    icon: MessageCircle,
    step: '02',
    title: 'AI가 질문으로 가르쳐요',
    desc: '답을 알려주지 않아요. 학생이 스스로 깨달을 수 있도록 질문해요.',
    demo: {
      label: '"판별식이 음수면 어떻게 돼요?"',
      sub: '→ "실수 범위에서 해가 없다면, 그래프는 어떤 모양일까?"',
    },
  },
  {
    icon: BarChart3,
    step: '03',
    title: '오개념을 한눈에',
    desc: '어떤 학생이 어디서 막히는지, 선생님이 바로 확인할 수 있어요.',
    demo: {
      label: '부호 오류 38% · 판별식 혼동 25%',
      sub: '→ AI 추천: "판별식 부호 판단 보충 설명이 필요해요"',
    },
  },
];

export function DemoFlow() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
      {STEPS.map(({ icon: Icon, step, title, desc, demo }, i) => (
        <button
          key={step}
          type="button"
          onClick={() => setActiveStep(i)}
          className={`bg-background p-8 md:p-12 text-left transition-colors duration-500 ${
            activeStep === i ? 'bg-card' : 'hover:bg-card/50'
          }`}
         
        >
          {/* Step Number + Icon */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Step {step}
            </span>
            <Icon
              className={`size-5 transition-colors duration-500 ${
                activeStep === i ? 'text-primary' : 'text-muted-foreground/40'
              }`}
              strokeWidth={1.5}
            />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {desc}
          </p>

          {/* Demo Simulation */}
          {activeStep === i && (
            <div className="border-t border-border pt-6 animate-in fade-in duration-500">
              <p className="text-sm font-medium text-foreground">{demo.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{demo.sub}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6 h-[2px] bg-muted w-full">
            <div
              className={`h-full bg-primary transition-all duration-[4000ms] ease-linear ${
                activeStep === i ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
