/**
 * @file app/page.tsx
 * @description P-001 랜딩 페이지 — Stitch 에디토리얼 디자인
 *   - Hero (헤드라인 + 서브 + 피처 배지)
 *   - 역할 선택 카드 (교사/학생)
 *   - Stats 벤토 그리드 (3열)
 *   - Methodology 섹션
 *   - Footer
 * @domain shared
 * @access client
 */

import { RoleSelector } from '@/components/layout/RoleSelector';
import { LandingFooter } from '@/components/layout/LandingFooter';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="px-8 md:px-24 py-32 md:py-48 flex flex-col items-start max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Introduction / 개요
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
          막힘을 질문으로 풀다.
        </h1>
        <p className="text-lg md:text-xl font-medium text-muted-foreground max-w-2xl leading-relaxed">
          정답을 주지 않습니다. 스스로 찾도록 질문합니다.
          <br />
          수학적 사고의 본질은 답을 맞히는 것이 아니라,
          <br className="hidden md:block" />
          논리적인 질문을 던지는 과정에 있습니다.
        </p>
        {/* Feature Badges */}
        <div className="mt-16 flex flex-wrap gap-4">
          {['데이터 로컬 처리', 'Grill-Me 질문법', '오개념 대시보드'].map((label) => (
            <div
              key={label}
              className="px-4 py-2 border border-border bg-muted flex items-center gap-2"
              style={{ borderRadius: 0 }}
            >
              <span className="text-[10px] font-bold tracking-widest text-foreground uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="bg-muted py-32 px-8 md:px-24">
        <div className="max-w-7xl mx-auto">
          <RoleSelector />
        </div>
      </section>

      {/* Stats Bento Section */}
      <section className="px-8 md:px-24 py-32 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            {
              label: 'Concept Mastery / 개념 완성도',
              value: '94%',
              desc: '기존 방식 대비 개념 오답률 감소 수치',
            },
            {
              label: 'Active Thinking / 능동 사고 시간',
              value: '+24m',
              desc: '학습 세션당 평균 몰입 시간 증가',
            },
            {
              label: 'Data Privacy / 데이터 보안',
              value: 'AES',
              desc: '로컬 엔진 기반 철저한 개인정보 보호',
            },
          ].map(({ label, value, desc }) => (
            <div key={label} className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-8">
                {label}
              </span>
              <span className="text-7xl font-extrabold text-primary mb-4 tracking-tighter">
                {value}
              </span>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology Section */}
      <section className="px-8 md:px-24 py-32 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-24 items-start">
          <div className="w-full md:w-1/2">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-12 block">
              Visual Archive / 이미지 아카이브
            </span>
            <div
              className="aspect-square bg-muted border border-border overflow-hidden flex items-center justify-center"
              style={{ borderRadius: 0 }}
            >
              <span className="text-6xl text-muted-foreground/30 font-extrabold">
                풀다
              </span>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center h-full pt-12 md:pt-32">
            <h3 className="text-4xl font-bold mb-8 leading-tight">
              편집적 정확성,
              <br />
              수학적 미학.
            </h3>
            <p className="text-muted-foreground leading-loose mb-12">
              우리는 단순한 학습 도구를 넘어, 하나의 지적 도서관을 지향합니다.
              풀다 AI의 인터페이스는 모든 선과 면이 수학적인 질서 위에 세워져
              있으며, 사용자가 오직 사고의 흐름에만 집중할 수 있도록 불필요한
              장식을 배제했습니다.
            </p>
            <button
              className="self-start px-12 py-4 bg-primary text-primary-foreground font-bold hover:bg-background hover:text-primary border border-primary transition-all duration-300"
              style={{ borderRadius: 0 }}
            >
              METHODOLOGY DETAIL
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
