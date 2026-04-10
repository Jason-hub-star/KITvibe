/**
 * @file scripts/demo-data/resetAndSeed.mjs
 * @description 데모 데이터 전체 리셋 + 실제형 데이터 재시드
 *   - lesson-files / question-images Storage 정리
 *   - app 테이블 전부 삭제 후 재삽입
 * @domain demo-data
 * @access server-only
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { DEMO_LESSONS, DEMO_STUDENTS, DEMO_TEACHERS } from './demoSeedData.mjs';

const RESET_TABLES = [
  'ai_responses',
  'misconception_summaries',
  'student_questions',
  'sessions',
  'lesson_context_caches',
  'lesson_quick_answers',
  'lesson_materials',
  'lessons',
  'users',
] ;

const RESET_BUCKETS = ['lesson-files', 'question-images'];
const IMAGE_ONLY_PLACEHOLDER = '이미지 질문';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  const env = fs.readFileSync(envPath, 'utf8');

  for (const line of env.split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    process.env[key] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
}

function deterministicUuid(input) {
  const hex = createHash('sha1').update(`pulda-demo:${input}`).digest('hex').slice(0, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
}

function getExtension(fileName) {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.slice(dotIndex).toLowerCase();
}

function buildStorageSafeName(key, fileName) {
  const hash = createHash('sha1').update(`${key}:${fileName}`).digest('hex').slice(0, 12);
  return `${key}-${hash}${getExtension(fileName)}`;
}

function buildMaterialPath(lessonId, fileName) {
  return `${lessonId}/${buildStorageSafeName('material', sanitizeFileName(fileName))}`;
}

function buildQuestionImagePath(questionId) {
  return `${questionId}/${buildStorageSafeName('question-image', 'notebook-question.png')}`;
}

function buildFileUrl(supabaseUrl, bucket, objectPath) {
  return `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`;
}

function createMinimalPdfBuffer(label) {
  const safeLabel = label.replace(/[^\x20-\x7E]/g, 'Lesson Material');
  const stream = `BT /F1 18 Tf 72 720 Td (${safeLabel}) Tj ET`;
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(stream, 'utf8')} >> stream\n${stream}\nendstream endobj`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

function createTinyPngBuffer() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==',
    'base64',
  );
}

function toIso(value) {
  return new Date(value).toISOString();
}

async function deleteAllObjects(supabase, bucket, dryRun) {
  const paths = await listAllObjectPaths(supabase, bucket);
  if (dryRun || paths.length === 0) {
    return { bucket, deletedCount: paths.length };
  }

  const batchSize = 100;
  for (let index = 0; index < paths.length; index += batchSize) {
    const batch = paths.slice(index, index + batchSize);
    const { error: removeError } = await supabase.storage.from(bucket).remove(batch);
    if (removeError) {
      throw new Error(`[storage:${bucket}] object 삭제 실패: ${removeError.message}`);
    }
  }

  return { bucket, deletedCount: paths.length };
}

async function listAllObjectPaths(supabase, bucket, prefix = '') {
  const paths = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      throw new Error(`[storage:${bucket}] object 목록 조회 실패: ${error.message}`);
    }

    const items = data ?? [];
    for (const item of items) {
      const nextPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (!item.id) {
        paths.push(...await listAllObjectPaths(supabase, bucket, nextPath));
      } else {
        paths.push(nextPath);
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function deleteAllRows(supabase, table, dryRun) {
  const { count, error: countError } = await supabase.from(table).select('id', { count: 'exact', head: true });
  if (countError) throw new Error(`[${table}] count 실패: ${countError.message}`);

  if (!dryRun && (count ?? 0) > 0) {
    const { error: deleteError } = await supabase.from(table).delete().not('id', 'is', null);
    if (deleteError) throw new Error(`[${table}] delete 실패: ${deleteError.message}`);
  }

  return { table, deletedCount: count ?? 0 };
}

function buildUsers() {
  return [
    ...DEMO_TEACHERS.map((teacher, index) => ({
      id: deterministicUuid(teacher.key),
      role: 'teacher',
      name: teacher.name,
      created_at: toIso(`2026-04-10T08:${10 + index}:00+09:00`),
    })),
    ...DEMO_STUDENTS.map((student, index) => ({
      id: deterministicUuid(student.key),
      role: 'student',
      name: student.name,
      created_at: toIso(`2026-04-10T08:${20 + index}:00+09:00`),
    })),
  ];
}

async function uploadMaterial(supabase, supabaseUrl, lesson, material) {
  const lessonId = deterministicUuid(lesson.key);
  const objectPath = buildMaterialPath(lessonId, material.fileName);
  const fileBody = material.kind === 'markdown'
    ? Buffer.from(material.extractedText, 'utf8')
    : createMinimalPdfBuffer(material.fileName);
  const contentType = material.kind === 'markdown' ? 'text/markdown' : 'application/pdf';

  const { error: uploadError } = await supabase.storage
    .from('lesson-files')
    .upload(objectPath, fileBody, { contentType, upsert: true });
  if (uploadError) throw new Error(`[lesson-files] 업로드 실패: ${uploadError.message}`);

  return {
    id: deterministicUuid(`${lesson.key}:${material.fileName}`),
    lesson_id: lessonId,
    file_name: material.fileName,
    file_url: buildFileUrl(supabaseUrl, 'lesson-files', objectPath),
    extracted_text: material.extractedText,
    chunk_text: material.extractedText,
    chunk_index: 0,
    created_at: toIso(lesson.createdAt),
  };
}

async function uploadQuestionImage(supabase, supabaseUrl, questionId) {
  const objectPath = buildQuestionImagePath(questionId);
  const { error: uploadError } = await supabase.storage
    .from('question-images')
    .upload(objectPath, createTinyPngBuffer(), { contentType: 'image/png', upsert: true });
  if (uploadError) throw new Error(`[question-images] 업로드 실패: ${uploadError.message}`);
  return buildFileUrl(supabaseUrl, 'question-images', objectPath);
}

async function seedDemoData(supabase) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL 누락');

  const users = buildUsers();
  const lessons = [];
  const materials = [];
  const contextCaches = [];
  const sessions = [];
  const questions = [];
  const responses = [];
  const summaries = [];
  const quickAnswers = [];

  for (const lesson of DEMO_LESSONS) {
    const lessonId = deterministicUuid(lesson.key);
    lessons.push({
      id: lessonId,
      teacher_id: deterministicUuid(lesson.teacherKey),
      title: lesson.title,
      subject: lesson.subject,
      topic: lesson.topic,
      created_at: toIso(lesson.createdAt),
    });

    if (lesson.contextCache) {
      contextCaches.push({
        id: deterministicUuid(`${lesson.key}:context-cache`),
        lesson_id: lessonId,
        summary_text: lesson.contextCache.summaryText,
        key_concepts: lesson.contextCache.keyConcepts,
        common_mistakes: lesson.contextCache.commonMistakes,
        solution_template: lesson.contextCache.solutionTemplate,
        created_at: toIso(lesson.createdAt),
        updated_at: toIso(lesson.createdAt),
      });
    }

    for (const material of lesson.materials) {
      materials.push(await uploadMaterial(supabase, supabaseUrl, lesson, material));
    }

    for (const quickAnswer of lesson.quickAnswers ?? []) {
      quickAnswers.push({
        id: deterministicUuid(`${lesson.key}:${quickAnswer.questionPattern}`),
        lesson_id: lessonId,
        trigger_phrase: quickAnswer.triggerPhrase,
        question_pattern: quickAnswer.questionPattern,
        answer_text: quickAnswer.answerText,
        concept_name: quickAnswer.conceptName,
        usage_count: 0,
        created_at: toIso(lesson.createdAt),
      });
    }

    for (const summary of lesson.summaries) {
      summaries.push({
        id: deterministicUuid(`${lesson.key}:${summary.concept_name}`),
        lesson_id: lessonId,
        concept_name: summary.concept_name,
        frequency: summary.frequency,
        summary_text: summary.summary_text,
        created_at: toIso(lesson.createdAt),
      });
    }

    for (const session of lesson.sessions) {
      const sessionId = deterministicUuid(session.key);
      sessions.push({
        id: sessionId,
        lesson_id: lessonId,
        student_id: deterministicUuid(session.studentKey),
        current_mode: session.currentMode,
        current_step: session.currentStep,
        consecutive_wrong: session.consecutiveWrong,
        quiz_question: session.quizQuestion,
        quiz_answer: session.quizAnswer,
        quiz_passed: session.quizPassed,
        summary_text: session.summaryText,
        next_recommendation: session.nextRecommendation,
        summary_concepts: session.summaryConcepts,
        started_at: toIso(session.startedAt),
        ended_at: session.endedAt ? toIso(session.endedAt) : null,
      });

      for (let index = 0; index < session.interactions.length; index += 1) {
        const interaction = session.interactions[index];
        const questionId = deterministicUuid(`${session.key}:question:${index}`);
        const responseId = deterministicUuid(`${session.key}:response:${index}`);
        const imageUrl = interaction.imageAsset
          ? await uploadQuestionImage(supabase, supabaseUrl, questionId)
          : null;

        questions.push({
          id: questionId,
          lesson_id: lessonId,
          student_id: deterministicUuid(session.studentKey),
          session_id: sessionId,
          question_text: interaction.questionText || IMAGE_ONLY_PLACEHOLDER,
          image_url: imageUrl,
          intent_type: interaction.intentType,
          created_at: toIso(interaction.askedAt),
        });

        responses.push({
          id: responseId,
          question_id: questionId,
          response_type: interaction.responseType,
          response_text: interaction.responseText,
          grounded_flag: interaction.groundedFlag,
          misconception_type: interaction.misconceptionType,
          created_at: toIso(new Date(new Date(interaction.askedAt).getTime() + 90 * 1000).toISOString()),
        });
      }
    }
  }

  const inserts = [
    ['users', users],
    ['lessons', lessons],
    ['lesson_materials', materials],
    ['lesson_context_caches', contextCaches],
    ['lesson_quick_answers', quickAnswers],
    ['sessions', sessions],
    ['student_questions', questions],
    ['ai_responses', responses],
    ['misconception_summaries', summaries],
  ];

  for (const [table, rows] of inserts) {
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`[${table}] insert 실패: ${error.message}`);
  }

  return {
    users: users.length,
    lessons: lessons.length,
    lesson_materials: materials.length,
    lesson_context_caches: contextCaches.length,
    lesson_quick_answers: quickAnswers.length,
    sessions: sessions.length,
    student_questions: questions.length,
    ai_responses: responses.length,
    misconception_summaries: summaries.length,
  };
}

async function snapshotCounts(supabase) {
  const result = {};
  for (const table of RESET_TABLES.slice().reverse()) {
    const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
    if (error) throw new Error(`[${table}] snapshot 실패: ${error.message}`);
    result[table] = count ?? 0;
  }
  for (const bucket of RESET_BUCKETS) {
    result[`storage:${bucket}`] = (await listAllObjectPaths(supabase, bucket)).length;
  }
  return result;
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes('--dry-run');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const before = await snapshotCounts(supabase);
  const storageResults = [];
  const tableResults = [];

  for (const bucket of RESET_BUCKETS) {
    storageResults.push(await deleteAllObjects(supabase, bucket, dryRun));
  }

  for (const table of RESET_TABLES) {
    tableResults.push(await deleteAllRows(supabase, table, dryRun));
  }

  let seeded = null;
  if (!dryRun) {
    seeded = await seedDemoData(supabase);
  }

  const after = dryRun ? null : await snapshotCounts(supabase);
  console.log(JSON.stringify({ dryRun, before, storageResults, tableResults, seeded, after }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
