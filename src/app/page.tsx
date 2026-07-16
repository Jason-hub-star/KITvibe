/**
 * @file app/page.tsx
 * @description P-001 랜딩 페이지 — Stitch 에디토리얼 + 토스 스타일 카피
 *   - Hero (명확한 가치 제안 + 한 줄 기능 요약)
 *   - 역할 선택 카드 (교사/학생)
 *   - 3-Step 데모 흐름 시각화
 *   - Footer
 * @domain shared
 * @access shared
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
    example: '부호를 자주 헷갈리고 판별식에서 많이 막혀요 → 바로 보충 설명을 준비해드려요',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Brand Header */}
      <header className="px-6 md:px-24 pt-8 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <BookOpen className="size-5 text-primary" strokeWidth={1.5} />
          <span className="text-lg font-bold tracking-widest text-foreground uppercase">
            풀다 AI
          </span>
        </Link>
      </header>

      {/* Hero Section — 토스 스타일: 명확한 가치 제안 */}
      <section className="px-6 md:px-24 py-20 md:py-32 flex flex-col items-start max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <span className="ui-kicker text-muted-foreground">
            AI 수업 보조 코치
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
          막힘을 질문으로 풀다.
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground max-w-2xl leading-relaxed mb-4">
          선생님은 수업자료만 올리세요. AI가 학생에게 <strong className="text-foreground">답 대신 질문</strong>을 던져 스스로 깨닫게 도와줘요.
        </p>
        <p className="ui-support text-muted-foreground/70 max-w-xl">
          어떤 학생이 어디서 막히는지, 오개념 대시보드에서 바로 확인하세요.
        </p>
      </section>

      {/* Role Cards Section — 히어로 바로 아래에서 시작 */}
      <section className="bg-muted py-20 md:py-24 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="ui-kicker text-muted-foreground">
              시작하기
            </span>
            <p className="ui-support mt-2 text-muted-foreground">
              역할을 선택하면 바로 시작할 수 있어요. 가입 없이, 30초면 충분해요.
            </p>
          </div>
          <RoleSelector />
        </div>
      </section>

      {/* How it works — 세로 플로우 시각화 */}
      <section className="px-6 md:px-24 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,640px)] gap-8 lg:gap-10">
            <div className="lg:sticky lg:top-24 h-fit">
              <span className="ui-kicker text-muted-foreground">
                동작 방식
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                질문은 학생에게,
                <br />
                데이터는 교사에게
              </h2>
            </div>

            <div className="relative max-w-[640px] pl-5 sm:pl-7">
              <div className="absolute left-3 sm:left-5 top-0 h-full w-px bg-border" />
              <div className="space-y-4 sm:space-y-5">
                {HOW_STEPS.map(({ icon: Icon, step, title, desc, example }) => (
                  <article
                    key={step}
                    className="relative border border-border bg-background p-4 sm:p-5 text-center"
                  >
                    <div className="absolute -left-[1.05rem] sm:-left-[1.2rem] top-6 flex size-8 sm:size-9 items-center justify-center border border-border bg-background text-xs font-bold tracking-widest text-muted-foreground">
                      {step}
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <p className="ui-kicker text-muted-foreground">
                        Step {step}
                      </p>
                      <div className="flex size-7 shrink-0 items-center justify-center border border-border bg-muted">
                        <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight break-words mb-3">
                      {title}
                    </h3>

                    <p className="ui-support text-muted-foreground">
                      {desc}
                    </p>

                    <div className="mt-4 bg-muted px-4 py-3">
                      <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                        {example}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
