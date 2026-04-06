/**
 * @file scripts/generate-mockups.ts
 * @description Stitch SDK로 5페이지 UI 시안 자동 생성
 * @domain design
 * @access server-only
 *
 * 사용법:
 *   export STITCH_API_KEY="your-api-key"
 *   npx tsx scripts/generate-mockups.ts
 */

import { stitch } from "@google/stitch-sdk";

const PAGES = [
  {
    name: "P-001-landing",
    prompt: `Dark mode educational SaaS landing page.
    - Header: "풀다 AI" logo, subtitle "수업 후 막힘 해소 AI 코치"
    - Two large selection cards side by side:
      Left card: Teacher icon, "교사로 시작하기", subtitle "수업 자료 등록하고 학생 분석"
      Right card: Student icon, "학생으로 시작하기", subtitle "질문하고 힌트 받기"
    - Cards have hover effect with indigo border
    - Bottom tagline: "정답을 주지 않습니다. 스스로 찾도록 질문합니다."
    - Three small badges: "🔒 데이터 로컬 처리", "🧠 소크라틱 질문법", "📊 오개념 대시보드"
    - Clean, minimal, zinc-950 background, indigo accent
    - Korean text, Geist Sans font style
    - No login, no navigation bar`
  },
  {
    name: "P-002-teacher-upload",
    prompt: `Dark mode file upload page for teachers.
    - Top: back arrow + "교사 자료 등록" header
    - Card 1 "수업 정보": two input fields - "수업 제목" and "핵심 주제"
    - Card 2 "수업 자료 업로드":
      Large dashed border dropzone area with "PDF 또는 .md 파일 드래그하거나 클릭" text
      Below: uploaded file list with filename + green "처리 완료" badge
    - Large indigo "지식베이스 생성하기" button, full width
    - Success alert: green "✅ 지식베이스 생성 완료! 학생이 질문할 수 있습니다."
    - max-w-2xl centered, zinc-950 background
    - Korean text`
  },
  {
    name: "P-003-student-chat",
    prompt: `Dark mode AI tutoring chat interface.
    - Top: back arrow + lesson name "이차방정식" + progress bar "질문 2/4"
    - Chat messages:
      AI message (left): "이 이차방정식을 보면, 어떤 방법을 사용하면 풀 수 있을 것 같아?"
        with indigo "질문 1/4" badge and "📚 수업자료 근거" small badge
        with collapsible "▶ 추천 보기" section that reveals hint text
      Student message (right): "인수분해요?" with subtle primary tint background
      AI response: "맞아! 그러면 x²+5x+6에서 합이 5이고 곱이 6인 두 수를 찾아볼래?"
    - Bottom: sticky input bar with text field + camera icon + send button
    - Below input: three mode toggle buttons "Grill-Me" (active, indigo) | "Guide-Me" | "Quick-Me 🚨"
    - math formulas rendered inline
    - zinc-950 background, indigo accent
    - Korean text`
  },
  {
    name: "P-004-teacher-dashboard",
    prompt: `Dark mode teacher analytics dashboard.
    - Top: back arrow + "교사 대시보드" + lesson info "이차방정식 | 2026-04-06"
    - Three stat cards in a row: "23 총 질문" / "5 학생 수" / "64% 회복률"
    - Large card "오개념 히트맵" with horizontal progress bars:
      "인수분해" 80% (red bar)
      "판별식" 50% (amber bar)
      "근의 공식" 30% (blue bar)
      "완전제곱식" 20% (green bar)
    - Two cards side by side:
      Left: "자주 나온 질문 TOP 5" numbered list
      Right: "보충 설명 추천" with AI-generated text and "보충 자료 생성" button
    - Bottom: table showing recent questions with columns: student, question, intent badge, time
    - max-w-4xl, zinc-950 background, clean data visualization
    - Korean text`
  },
  {
    name: "P-005-student-summary",
    prompt: `Dark mode student learning summary page.
    - Top: back arrow + "학습 요약"
    - Title: "오늘의 학습 요약" + "이차방정식 | 2026-04-06"
    - Three stat cards: "✅ 2 해결한 막힘" / "📝 5 질문 횟수" / "💡 8 받은 힌트"
    - Card "다룬 개념":
      "✅ 인수분해 기초 → 이해 완료" with green badge
      separator
      "🔄 근의 공식 → 추가 연습" with amber badge
    - Two buttons: "다시 질문하기" (indigo, primary) + "처음으로" (outline)
    - max-w-lg centered, zinc-950 background
    - Korean text`
  }
];

async function main() {
  console.log("🎨 풀다 AI UI 시안 생성 시작...\n");

  const project = await stitch.createProject("풀다 AI");
  console.log(`📁 프로젝트 생성: ${project.projectId}\n`);

  for (const page of PAGES) {
    console.log(`⏳ ${page.name} 생성 중...`);

    const screen = await project.generate(page.prompt);
    const htmlUrl = await screen.getHtml();
    const imageUrl = await screen.getImage();

    console.log(`  ✅ HTML:  ${htmlUrl}`);
    console.log(`  ✅ Image: ${imageUrl}`);
    console.log();
  }

  console.log("🎉 5페이지 시안 생성 완료!");
  console.log(`📋 프로젝트 ID: ${project.projectId}`);
  console.log("🌐 https://stitch.withgoogle.com 에서 확인 및 편집 가능");
}

main().catch(console.error);
