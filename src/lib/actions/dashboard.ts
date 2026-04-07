/**
 * @file lib/actions/dashboard.ts
 * @description 교사 대시보드 Server Actions — 집계 쿼리 + AI 오개념 요약
 * @domain misconception
 * @access server-only
 */

'use server';

import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { generateTeacherSummary } from '@/lib/ai/generateSummary';
import type {
  DashboardData,
  MisconceptionSummary,
  MisconceptionHeatmapItem,
  TopQuestion,
  QuestionLogRow,
} from '@/types';

/** 오개념 유형 번호 → 한국어 이름 */
const MISCONCEPTION_LABELS: Record<number, string> = {
  1: '왜곡된 정리/정의 적용',
  2: '기술적 오류',
  3: '풀이 과정 생략',
  4: '개념 이미지 오류',
  5: '직관적 오류',
};

/**
 * 대시보드 전체 데이터 조회 (집계 쿼리)
 */
export async function getDashboardData(lessonId: string): Promise<DashboardData> {
  const supabase = createSupabaseAdmin();

  // 1. 수업 정보
  const { data: lesson, error: lessonErr } = await supabase
    .from('lessons')
    .select('id, title, topic, created_at')
    .eq('id', lessonId)
    .single();

  if (lessonErr || !lesson) {
    throw new Error(`수업 조회 실패: ${lessonErr?.message ?? 'NOT_FOUND'}`);
  }

  // 2. 질문 목록 (학생명 포함)
  const { data: questions, error: qErr } = await supabase
    .from('student_questions')
    .select('id, student_id, question_text, intent_type, created_at, users!student_questions_student_id_fkey(name)')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false });

  if (qErr) {
    throw new Error(`질문 조회 실패: ${qErr.message}`);
  }

  const questionList = questions ?? [];

  // 3. AI 응답 목록
  const questionIds = questionList.map((q) => q.id);
  let responses: Array<{ grounded_flag: boolean; misconception_type: number | null }> = [];

  if (questionIds.length > 0) {
    const { data: resData } = await supabase
      .from('ai_responses')
      .select('grounded_flag, misconception_type')
      .in('question_id', questionIds);

    responses = (resData ?? []) as typeof responses;
  }

  // 4. 통계 계산
  const totalQuestions = questionList.length;
  const uniqueStudents = new Set(questionList.map((q) => q.student_id));
  const activeStudents = uniqueStudents.size;

  const groundedCount = responses.filter((r) => r.grounded_flag).length;
  const recoveryRate = responses.length > 0
    ? Math.round((groundedCount / responses.length) * 100)
    : 0;

  // 5. 오개념 히트맵: misconception_type별 카운트
  const misconceptionCounts: Record<number, number> = {};
  for (const r of responses) {
    if (r.misconception_type != null) {
      misconceptionCounts[r.misconception_type] = (misconceptionCounts[r.misconception_type] ?? 0) + 1;
    }
  }

  const totalMisconceptions = Object.values(misconceptionCounts).reduce((a, b) => a + b, 0);
  const heatmap: MisconceptionHeatmapItem[] = Object.entries(misconceptionCounts)
    .map(([type, count]) => ({
      conceptName: MISCONCEPTION_LABELS[Number(type)] ?? `유형 ${type}`,
      percentage: totalMisconceptions > 0 ? Math.round((count / totalMisconceptions) * 100) : 0,
      count,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // 6. TOP 5 질문 (빈도순)
  const questionFreq: Record<string, number> = {};
  for (const q of questionList) {
    const text = q.question_text.slice(0, 100);
    questionFreq[text] = (questionFreq[text] ?? 0) + 1;
  }

  const topQuestions: TopQuestion[] = Object.entries(questionFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([questionText, count]) => ({ questionText, count }));

  // 7. 질문 로그 (최근 20개)
  const questionLog: QuestionLogRow[] = questionList.slice(0, 20).map((q) => {
    const userData = q.users as unknown as { name: string } | null;
    return {
      studentName: userData?.name ?? '익명',
      questionText: q.question_text.length > 50
        ? q.question_text.slice(0, 50) + '…'
        : q.question_text,
      intentType: q.intent_type ?? 'concept',
      createdAt: q.created_at,
    };
  });

  // 8. 기존 오개념 요약
  const { data: summaries } = await supabase
    .from('misconception_summaries')
    .select()
    .eq('lesson_id', lessonId)
    .order('frequency', { ascending: false });

  return {
    lesson: lesson as DashboardData['lesson'],
    stats: { totalQuestions, activeStudents, recoveryRate },
    heatmap,
    topQuestions,
    questionLog,
    misconceptionSummaries: (summaries ?? []) as MisconceptionSummary[],
  };
}

/**
 * AI 오개념 요약 생성 → misconception_summaries UPSERT
 */
export async function generateMisconceptionSummary(
  lessonId: string,
): Promise<MisconceptionSummary[]> {
  const supabase = createSupabaseAdmin();

  // 질문 텍스트 전부 조회
  const { data: questions, error } = await supabase
    .from('student_questions')
    .select('question_text, intent_type, created_at')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`질문 조회 실패: ${error.message}`);
  }

  if (!questions || questions.length === 0) {
    return [];
  }

  // 질문 로그 텍스트 구성
  const questionLogs = questions
    .map((q, i) => `${i + 1}. [${q.intent_type ?? 'unknown'}] ${q.question_text}`)
    .join('\n');

  // AI 생성
  const summaryResults = await generateTeacherSummary(questionLogs);

  // UPSERT
  const upsertData = summaryResults.map((item) => ({
    lesson_id: lessonId,
    concept_name: item.concept_name,
    frequency: item.frequency,
    summary_text: item.summary_text,
  }));

  if (upsertData.length > 0) {
    const { error: upsertErr } = await supabase
      .from('misconception_summaries')
      .upsert(upsertData, { onConflict: 'lesson_id,concept_name' });

    if (upsertErr) {
      console.error('[generateMisconceptionSummary] UPSERT 실패', upsertErr);
    }
  }

  // 최신 데이터 반환
  const { data: updated } = await supabase
    .from('misconception_summaries')
    .select()
    .eq('lesson_id', lessonId)
    .order('frequency', { ascending: false });

  return (updated ?? []) as MisconceptionSummary[];
}
