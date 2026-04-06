/**
 * @file scripts/download-stitch-html.ts
 * @description 기존 Stitch 프로젝트에서 HTML 파일 다운로드
 * @domain design
 * @access server-only
 *
 * 사용법: npx tsx scripts/download-stitch-html.ts
 */

import { stitch } from "@google/stitch-sdk";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = join(import.meta.dirname, "../docs/design/stitch-outputs");

async function main() {
  console.log("📋 Stitch 프로젝트 목록 조회 중...\n");

  const projects = await stitch.projects();

  for (const project of projects) {
    console.log(`📁 프로젝트: ${project.projectId} — ${(project as any).title || "(제목 없음)"}`);
  }

  if (projects.length === 0) {
    console.log("❌ 프로젝트가 없어요.");
    return;
  }

  // 가장 최근 풀다 AI 프로젝트 찾기
  const targetProject = projects.find(
    (p) => (p as any).title?.includes("풀다")
  ) || projects[0];

  console.log(`\n🎯 대상 프로젝트: ${targetProject.projectId}`);

  const screens = await targetProject.screens();
  console.log(`📄 스크린 ${screens.length}개 발견\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    console.log(`⏳ [${i + 1}/${screens.length}] 스크린 ${screen.screenId} HTML 다운로드 중...`);

    try {
      const htmlUrl = await screen.getHtml();
      if (!htmlUrl) {
        console.log(`  ⚠️ HTML URL 없음, 스킵`);
        continue;
      }

      console.log(`  🔗 URL: ${htmlUrl}`);

      const response = await fetch(htmlUrl);
      if (!response.ok) {
        console.log(`  ❌ HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const filename = `screen-${i + 1}-${screen.screenId.slice(0, 8)}.html`;
      const filepath = join(OUTPUT_DIR, filename);

      writeFileSync(filepath, html, "utf-8");
      console.log(`  ✅ 저장: ${filename} (${(html.length / 1024).toFixed(1)}KB)`);
    } catch (error) {
      console.error(`  ❌ 실패:`, error);
    }
    console.log();
  }

  console.log("🎉 완료!");
}

main().catch(console.error);
