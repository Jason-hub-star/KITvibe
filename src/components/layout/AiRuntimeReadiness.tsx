/**
 * @file components/layout/AiRuntimeReadiness.tsx
 * @description 랜딩용 AI 런타임 준비 상태 카드
 *   - 현재 튜터 엔진
 *   - 하이브리드 확장 구조
 *   - Gemma 4 연동 가치 요약
 * @domain shared
 * @access shared
 */

interface AiRuntimeCard {
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
}

interface AiRuntimeReadinessProps {
  cards: AiRuntimeCard[];
}

export function AiRuntimeReadiness(props: AiRuntimeReadinessProps) {
  const { cards } = props;

  return (
    <section className="px-8 md:px-24 pb-16 md:pb-20 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Runtime / Gemma Ready
        </span>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          공모전 데모는 안정적으로, 프로덕션 확장은 로컬 AI까지 이어질 수 있게 설계했어요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-border bg-border">
        {cards.map((card) => (
          <article key={card.eyebrow} className="bg-background p-8">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-4">
              {card.eyebrow}
            </p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-3">
              {card.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {card.description}
            </p>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {card.meta}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
