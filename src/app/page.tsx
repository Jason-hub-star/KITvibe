/**
 * @file app/page.tsx
 * @description P-001 랜딩 페이지 — Stitch 에디토리얼 + 토스 스타일 카피
 *   - Hero (명확한 가치 제안 + 한 줄 기능 요약)
 *   - 3-Step 데모 흐름 (애니메이션)
 *   - 역할 선택 카드 (교사/학생)
 *   - How it works 섹션
 *   - Footer
 * @domain shared
 * @access client
 */

import Link from 'next/link';
import { BookOpen, Upload, MessageCircle, BarChart3 } from 'lucide-react';
import { RoleSelector } from '@/components/layout/RoleSelector';
import { LandingFooter } from '@/components/layout/LandingFooter';

const HOW_STEPS = [
  {
    icon: Upload,
    step: '01',
    title: '수업자료 업로드',
    desc: '선생님이 PDF를 올리면, AI가 핵심 개념을 자동으로 파악해요.',
    example: '이차방정식의 근의 공식.pdf → 지식베이스 구축 완료',
  },
  {
    icon: MessageCircle,
    step: '02',
    title: 'AI가 질문으로 가르쳐요',
    desc: '답을 알려주지 않아요. 학생이 스스로 깨달을 수 있도록 질문해요.',
    example: '"판별식이 음수면?" → "그래프는 어떤 모양일까?"',
  },
  {
    icon: BarChart3,
    step: '03',
    title: '오개념을 한눈에',
    desc: '어떤 학생이 어디서 막히는지, 선생님이 바로 확인할 수 있어요.',
    example: '부호 오류 38% · 판별식 혼동 25% → AI 보충 추천',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Brand Header */}
      <header className="px-8 md:px-24 pt-8 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <BookOpen className="size-5 text-primary" strokeWidth={1.5} />
          <span className="text-lg font-bold tracking-widest text-foreground uppercase">
            풀다 AI
          </span>
        </Link>
      </header>

      {/* Hero Section — 토스 스타일: 명확한 가치 제안 */}
      <section className="px-8 md:px-24 py-20 md:py-32 flex flex-col items-start max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            AI 수업 보조 코치
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
          막힘을 질문으로 풀다.
        </h1>
        <p className="text-lg md:text-xl font-medium text-muted-foreground max-w-2xl leading-relaxed mb-4">
          선생님은 수업자료만 올리세요.
          <br />
          AI가 학생에게 <strong className="text-foreground">답 대신 질문</strong>을 던져
          스스로 깨닫게 도와줘요.
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-xl">
          어떤 학생이 어디서 막히는지, 오개념 대시보드에서 바로 확인하세요.
        </p>

      </section>

      {/* Role Cards Section — 먼저 시작하게 */}
      <section className="bg-muted py-24 px-8 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Get Started / 시작하기
            </span>
            <p className="mt-2 text-muted-foreground text-sm">
              역할을 선택하면 바로 시작할 수 있어요. 가입 없이, 30초면 충분해요.
            </p>
          </div>
          <RoleSelector />
        </div>
      </section>

      {/* How it works — 3단계 + 핵심 특징 통합 */}
      <section className="px-8 md:px-24 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              How it works / 이렇게 동작해요
            </span>
          </div>

          {/* 3단계 흐름 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border mb-16">
            {HOW_STEPS.map(({ icon: Icon, step, title, desc, example }) => (
              <div key={step} className="bg-background p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Step {step}
                  </span>
                  <Icon className="size-5 text-muted-foreground/40" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{desc}</p>
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">{example}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
