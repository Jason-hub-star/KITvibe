/**
 * @file components/layout/LandingFooter.tsx
 * @description 공통 Footer — Stitch 에디토리얼 스타일
 *   - 로고 + 저작권 + 네비게이션 링크 4개
 * @domain shared
 * @access client
 */

const FOOTER_LINKS = ['CURRICULUM', 'METHODOLOGY', 'ARCHIVE', 'CONTACT'];

export function LandingFooter() {
  return (
    <footer className="bg-muted border-t border-border w-full">
      <div className="max-w-7xl mx-auto px-8 md:px-24 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black tracking-widest text-primary uppercase">
            풀다 AI
          </span>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            © 2026 풀다 AI
          </span>
        </div>
        <div className="flex gap-8">
          {FOOTER_LINKS.map((link) => (
            <button
              key={link}
              type="button"
              className="text-[10px] font-bold tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4 transition-all duration-200 cursor-pointer uppercase"
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
