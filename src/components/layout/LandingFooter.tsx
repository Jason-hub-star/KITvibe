/**
 * @file components/layout/LandingFooter.tsx
 * @description 공통 Footer — 로고 + 저작권
 * @domain shared
 * @access client
 */

export function LandingFooter() {
  return (
    <footer className="bg-muted border-t border-border w-full">
      <div className="max-w-7xl mx-auto px-8 md:px-24 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <span className="text-xs font-black tracking-widest text-primary uppercase">
          풀다 AI
        </span>
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          © 2026 풀다 AI
        </span>
      </div>
    </footer>
  );
}
