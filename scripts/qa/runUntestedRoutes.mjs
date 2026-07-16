/**
 * @file scripts/qa/runUntestedRoutes.mjs
 * @description 미실주행 API 라우트 스모크 테스트
 *   - 유저/수업/세션 bootstrap 후 주요 API 라우트 순차 실호출
 *   - 상태코드 + 통일 응답 포맷(success) + 핵심 필드 검증
 * @domain qa
 * @access server-only
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.ROUTE_SMOKE_BASE_URL ?? 'http://localhost:3000';
const MARKDOWN_FIXTURE_PATH = path.join(process.cwd(), 'test-data', 'quadratic-e2e.md');
const IMAGE_FIXTURE_PATH = path.join(process.cwd(), 'test-data', 'tc05-screenshot.png');

/**
 * @typedef {{
 *   name: string;
 *   ok: boolean;
 *   status?: number;
 *   detail: string;
 *   durationMs: number;
 * }} StepResult
 */

/** @type {StepResult[]} */
const results = [];

function now() {
  return Date.now();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function toSnippet(value, max = 220) {
  if (!value) return '';
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max)}...`;
}

function pushResult(result) {
  results.push(result);
  const marker = result.ok ? 'PASS' : 'FAIL';
  const statusText = result.status ? ` [${result.status}]` : '';
  console.log(`${marker}${statusText} ${result.name} (${result.durationMs}ms)`);
  if (result.detail) {
    console.log(`  - ${result.detail}`);
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? '';
  const rawText = await response.text();

  let json = null;
  if (contentType.includes('application/json')) {
    try {
      json = rawText ? JSON.parse(rawText) : null;
    } catch (_error) {
      json = null;
    }
  }

  return { contentType, rawText, json };
}

async function requestWithChecks(params) {
  const {
    name,
    method = 'GET',
    pathName,
    expectedStatuses,
    headers,
    body,
    expectJsonSuccess = true,
  } = params;

  const startedAt = now();

  try {
    const response = await fetch(`${BASE_URL}${pathName}`, {
      method,
      headers,
      body,
    });

    const parsed = await parseResponse(response);

    assert(
      expectedStatuses.includes(response.status),
      `${method} ${pathName} expected ${expectedStatuses.join('/')} but got ${response.status}. body=${toSnippet(parsed.rawText)}`,
    );

    if (expectJsonSuccess) {
      assert(parsed.json && typeof parsed.json === 'object', `JSON 응답이 아닙니다: ${toSnippet(parsed.rawText)}`);
      assert(parsed.json.success === true, `success=true가 아닙니다: ${toSnippet(parsed.rawText)}`);
    }

    pushResult({
      name,
      ok: true,
      status: response.status,
      detail: expectJsonSuccess ? 'success=true 확인' : toSnippet(parsed.rawText),
      durationMs: now() - startedAt,
    });

    return { response, ...parsed };
  } catch (error) {
    pushResult({
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      durationMs: now() - startedAt,
    });
    throw error;
  }
}

async function uploadToSignedUrl(signedUrl, fileBuffer, contentType) {
  const candidates = [
    { method: 'PUT', header: { 'Content-Type': contentType, 'x-upsert': 'false' } },
    { method: 'POST', header: { 'Content-Type': contentType, 'x-upsert': 'false' } },
  ];

  let lastError = null;

  for (const candidate of candidates) {
    const response = await fetch(signedUrl, {
      method: candidate.method,
      headers: candidate.header,
      body: fileBuffer,
    });

    if (response.ok) {
      return {
        method: candidate.method,
        status: response.status,
      };
    }

    const rawText = await response.text();
    lastError = `${candidate.method} ${response.status} ${toSnippet(rawText)}`;
  }

  throw new Error(`signed upload 실패: ${lastError ?? 'unknown'}`);
}

function printSummary() {
  const passed = results.filter((item) => item.ok).length;
  const failed = results.length - passed;
  console.log('\n=== Untested Route Smoke Summary ===');
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`Total: ${results.length}, Passed: ${passed}, Failed: ${failed}`);

  for (const item of results) {
    const marker = item.ok ? 'PASS' : 'FAIL';
    const statusText = item.status ? ` [${item.status}]` : '';
    console.log(`- ${marker}${statusText} ${item.name}: ${item.detail}`);
  }
}

async function main() {
  const markdownFixture = fs.readFileSync(MARKDOWN_FIXTURE_PATH);
  const imageFixture = fs.readFileSync(IMAGE_FIXTURE_PATH);
  const uniqueSuffix = `${Date.now()}`;
  const markdownFileName = `untested-route-${uniqueSuffix}.md`;
  const multipartFileName = `untested-route-multipart-${uniqueSuffix}.md`;
  const imageFileName = `untested-route-image-${uniqueSuffix}.png`;

  await requestWithChecks({
    name: 'Health check /',
    method: 'GET',
    pathName: '/',
    expectedStatuses: [200],
    expectJsonSuccess: false,
  });

  const teacherRes = await requestWithChecks({
    name: 'POST /api/users (teacher)',
    method: 'POST',
    pathName: '/api/users',
    expectedStatuses: [201],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'teacher' }),
  });
  const teacherId = teacherRes.json?.data?.id;
  assert(typeof teacherId === 'string' && teacherId.length > 0, 'teacher id 누락');

  const studentRes = await requestWithChecks({
    name: 'POST /api/users (student)',
    method: 'POST',
    pathName: '/api/users',
    expectedStatuses: [201],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'student' }),
  });
  const studentId = studentRes.json?.data?.id;
  assert(typeof studentId === 'string' && studentId.length > 0, 'student id 누락');

  const lessonRes = await requestWithChecks({
    name: 'POST /api/lessons',
    method: 'POST',
    pathName: '/api/lessons',
    expectedStatuses: [201],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `실주행 미테스트 라우트 점검 ${uniqueSuffix}`,
      subject: 'math',
      topic: '이차방정식',
      teacher_id: teacherId,
    }),
  });
  const lessonId = lessonRes.json?.data?.id;
  assert(typeof lessonId === 'string' && lessonId.length > 0, 'lesson id 누락');

  const uploadUrlRes = await requestWithChecks({
    name: 'POST /api/materials/upload-url',
    method: 'POST',
    pathName: '/api/materials/upload-url',
    expectedStatuses: [201],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lesson_id: lessonId,
      file_name: markdownFileName,
      file_size: markdownFixture.byteLength,
    }),
  });

  const signedUrl = uploadUrlRes.json?.data?.signed_url;
  const storagePath = uploadUrlRes.json?.data?.path;
  assert(typeof signedUrl === 'string' && signedUrl.length > 0, 'signed_url 누락');
  assert(typeof storagePath === 'string' && storagePath.length > 0, 'storage path 누락');

  {
    const startedAt = now();
    try {
      const uploaded = await uploadToSignedUrl(signedUrl, markdownFixture, 'text/markdown');
      pushResult({
        name: 'Supabase signed upload',
        ok: true,
        status: uploaded.status,
        detail: `${uploaded.method} 성공`,
        durationMs: now() - startedAt,
      });
    } catch (error) {
      pushResult({
        name: 'Supabase signed upload',
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
        durationMs: now() - startedAt,
      });
      throw error;
    }
  }

  await requestWithChecks({
    name: 'POST /api/materials/upload (json post-process)',
    method: 'POST',
    pathName: '/api/materials/upload',
    expectedStatuses: [201],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lesson_id: lessonId,
      file_name: markdownFileName,
      storage_path: storagePath,
      file_size: markdownFixture.byteLength,
    }),
  });

  {
    const formData = new FormData();
    formData.append(
      'file',
      new File([markdownFixture], multipartFileName, { type: 'text/markdown' }),
    );
    formData.append('lesson_id', lessonId);

    await requestWithChecks({
      name: 'POST /api/materials/upload (multipart compatibility)',
      method: 'POST',
      pathName: '/api/materials/upload',
      expectedStatuses: [201],
      body: formData,
    });
  }

  {
    const formData = new FormData();
    formData.append(
      'file',
      new File([imageFixture], imageFileName, { type: 'image/png' }),
    );

    await requestWithChecks({
      name: 'POST /api/questions/image',
      method: 'POST',
      pathName: '/api/questions/image',
      expectedStatuses: [201],
      body: formData,
    });
  }

  const sessionRes = await requestWithChecks({
    name: 'POST /api/sessions',
    method: 'POST',
    pathName: '/api/sessions',
    expectedStatuses: [201],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lesson_id: lessonId,
      student_id: studentId,
    }),
  });
  const sessionId = sessionRes.json?.data?.session?.id;
  assert(typeof sessionId === 'string' && sessionId.length > 0, 'session id 누락');

  await requestWithChecks({
    name: 'GET /api/sessions/[id]',
    method: 'GET',
    pathName: `/api/sessions/${sessionId}`,
    expectedStatuses: [200],
  });

  const questionRes = await requestWithChecks({
    name: 'POST /api/questions',
    method: 'POST',
    pathName: '/api/questions',
    expectedStatuses: [201],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lesson_id: lessonId,
      student_id: studentId,
      session_id: sessionId,
      question_text: '답만 빨리 알려줘. x^2 + x - 6 = 0',
    }),
  });
  const questionId = questionRes.json?.data?.question?.id;
  assert(typeof questionId === 'string' && questionId.length > 0, 'question id 누락');

  await requestWithChecks({
    name: 'POST /api/questions/[id]/respond',
    method: 'POST',
    pathName: `/api/questions/${questionId}/respond`,
    expectedStatuses: [200],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lesson_id: lessonId,
      mode: 'quick-me',
      current_step: 1,
      consecutive_wrong: 0,
      messages: [
        {
          role: 'user',
          content: '답만 빨리 알려줘. x^2 + x - 6 = 0',
        },
      ],
    }),
    expectJsonSuccess: false,
  });

  await requestWithChecks({
    name: 'PATCH /api/sessions/[id]',
    method: 'PATCH',
    pathName: `/api/sessions/${sessionId}`,
    expectedStatuses: [200],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_mode: 'quick-me',
      current_step: 2,
    }),
  });

  await requestWithChecks({
    name: 'POST /api/sessions/[id]/quiz',
    method: 'POST',
    pathName: `/api/sessions/${sessionId}/quiz`,
    expectedStatuses: [200, 201],
  });

  await requestWithChecks({
    name: 'POST /api/sessions/[id]/quiz/grade',
    method: 'POST',
    pathName: `/api/sessions/${sessionId}/quiz/grade`,
    expectedStatuses: [200],
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer: 'x = -3, 2' }),
  });

  await requestWithChecks({
    name: 'GET /api/sessions/[id]/summary',
    method: 'GET',
    pathName: `/api/sessions/${sessionId}/summary`,
    expectedStatuses: [200],
  });

  await requestWithChecks({
    name: 'GET /api/lessons/[id]/dashboard',
    method: 'GET',
    pathName: `/api/lessons/${lessonId}/dashboard`,
    expectedStatuses: [200],
  });

  await requestWithChecks({
    name: 'POST /api/lessons/[id]/misconceptions',
    method: 'POST',
    pathName: `/api/lessons/${lessonId}/misconceptions`,
    expectedStatuses: [201],
  });
}

main()
  .then(() => {
    printSummary();
    const hasFailure = results.some((result) => !result.ok);
    process.exit(hasFailure ? 1 : 0);
  })
  .catch((error) => {
    printSummary();
    console.error('\nSmoke test aborted:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
