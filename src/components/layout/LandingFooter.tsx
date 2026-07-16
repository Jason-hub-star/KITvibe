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
        <span className="ui-kicker text-primary font-black">
          풀다 AI
        </span>
        <span className="ui-kicker text-muted-foreground">
          © 2026 풀다 AI
        </span>
      </div>
    </footer>
  );
}
