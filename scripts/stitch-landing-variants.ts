/**
 * @file scripts/stitch-landing-variants.ts
 * @description 랜딩 페이지 5가지 디자인 버전을 Stitch로 생성
 * @domain design
 * @access server-only
 *
 * 사용법: npx tsx scripts/stitch-landing-variants.ts
 */

import { stitch } from "@google/stitch-sdk";

const BASE_PROMPT = `Dark mode educational SaaS landing page for "풀다 AI".
Two role selection cards: Teacher (교사로 시작하기) and Student (학생으로 시작하기).
Tagline: "정답을 주지 않습니다. 스스로 찾도록 질문합니다."
Three feature badges at bottom.
Korean text. Clean, modern, trustworthy.`;

const VARIANTS = [
  {
    name: "A-minimal",
    prompt: `${BASE_PROMPT}
    Style: Ultra minimal. White space dominant. Just two cards centered on a dark zinc-950 background.
    Cards are simple with just an icon and text, no gradients. Indigo accent on hover.
    Very clean typography, Geist-like sans-serif. No illustrations.`
  },
  {
    name: "B-gradient",
    prompt: `${BASE_PROMPT}
    Style: Subtle gradient background from zinc-950 to indigo-950/20.
    Cards have glass-morphism effect with backdrop blur and subtle border glow.
    Feature badges have soft indigo glow. Modern, premium feel.
    Rounded-2xl cards with padding-8.`
  },
  {
    name: "C-split-screen",
    prompt: `${BASE_PROMPT}
    Style: Split screen layout. Left half for Teacher (indigo tint), right half for Student (violet tint).
    Each half is a full-height clickable area with icon, title, description.
    Center divider with the logo. Bottom bar with feature badges.
    Bold, distinctive, app-like feel.`
  },
  {
    name: "D-hero-illustration",
    prompt: `${BASE_PROMPT}
    Style: Top section has a hero area with abstract math-themed illustration (geometric shapes, equations floating).
    Below: two cards in a row with teacher/student icons.
    Bottom: testimonial-style feature badges.
    More visual, engaging, slightly playful but still professional.`
  },
  {
    name: "E-dashboard-preview",
    prompt: `${BASE_PROMPT}
    Style: Shows a blurred preview of the dashboard and chat interface behind the role selection.
    Two cards overlay on top of the preview with frosted glass effect.
    Gives users a preview of what they'll see after selecting a role.
    Sophisticated, product-led approach.`
  }
];

async function main() {
  console.log("🎨 랜딩 페이지 5가지 버전 생성 시작...\n");

  const project = await stitch.createProject("풀다 AI - Landing Variants");
  console.log(`📁 프로젝트: ${project.projectId}\n`);

  for (const variant of VARIANTS) {
    console.log(`⏳ ${variant.name} 생성 중...`);
    try {
      const screen = await project.generate(variant.prompt);
      const imageUrl = await screen.getImage();
      const htmlUrl = await screen.getHtml();
      console.log(`  ✅ Image: ${imageUrl}`);
      console.log(`  ✅ HTML:  ${htmlUrl}`);
    } catch (error) {
      console.error(`  ❌ 실패: ${error}`);
    }
    console.log();
  }

  console.log("🎉 5가지 버전 생성 완료!");
  console.log("🌐 stitch.withgoogle.com 에서 확인하세요.");
}

main().catch(console.error);
