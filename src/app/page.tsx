/**
 * @file app/page.tsx
 * @description P-001 랜딩 페이지 (임시 — 역할 선택)
 * @domain shared
 * @access client
 */

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 max-w-7xl mx-auto">
      <h1 className="text-5xl font-extrabold tracking-tight text-center">
        막힘을 질문으로 풀다.
      </h1>
      <p className="mt-6 text-muted-foreground text-lg text-center max-w-md">
        정답을 주지 않습니다. 스스로 찾도록 질문합니다.
      </p>
    </main>
  );
}
