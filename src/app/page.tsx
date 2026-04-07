/**
 * @file app/page.tsx
 * @description P-001 랜딩 페이지 — 역할 선택 (교사/학생)
 * @domain shared
 * @access client
 */

import { RoleSelector } from "@/components/layout/RoleSelector";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            막힘을 질문으로 풀다.
          </h1>
          <p className="text-muted-foreground text-lg">
            정답을 주지 않습니다. 스스로 찾도록 질문합니다.
          </p>
        </div>

        <RoleSelector />

        <p className="text-xs text-muted-foreground">
          풀다 AI — 수업 후 보충 AI 코치
        </p>
      </div>
    </main>
  );
}
