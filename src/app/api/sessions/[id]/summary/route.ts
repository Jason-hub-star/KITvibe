/**
 * @file app/api/sessions/[id]/summary/route.ts
 * @description GET /api/sessions/[id]/summary — 세션 요약 조회/생성
 * @domain session
 * @access server-only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { generateSessionSummary } from '@/lib/ai/generateSessionSummary';
import { getSessionById, getSessionTranscript, getLatestQuestionBySession, updateSession } from '@/lib/actions/sessions';
import type { ApiResponse } from '@/types';

function buildSessionLog(
  transcript: Awaited<ReturnType<typeof getSessionTranscript>>,
): string {
  return transcript
    .map((row, index) => {
      const parts = [
        `턴 ${index + 1}`,
        `학생 질문: ${row.question_text}`,
      ];

      if (row.response_text) {
        parts.push(`AI 응답(${row.response_type ?? 'unknown'}): ${row.response_text}`);
      }

      return parts.join('\n');
    })
    .join('\n\n');
}

interface SessionSummaryData {
  session_id: string;
  lesson_id: string;
  lesson_title: string;
  question_count: number;
  current_step: number;
  summary_text: string;
  next_recommendation: string;
  concepts: string[];
  quiz_passed: boolean | null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await getSessionById(id);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '세션을 찾을 수 없습니다.', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const supabase = createSupabaseAdmin();
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('title')
      .eq('id', session.lesson_id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '수업 정보를 찾을 수 없습니다.', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    const transcript = await getSessionTranscript(id);
    const questionCount = new Set(transcript.map((row) => row.question_id)).size;
    const hasCachedSummary =
      Boolean(session.summary_text) &&
      Boolean(session.next_recommendation) &&
      Array.isArray(session.summary_concepts) &&
      session.summary_concepts.length > 0;

    let summaryText = session.summary_text ?? '';
    let nextRecommendation = session.next_recommendation ?? '';
    let concepts = session.summary_concepts ?? [];

    if (!hasCachedSummary) {
      const sessionLog = buildSessionLog(transcript);
      const generatedSummary = await generateSessionSummary({
        lessonTitle: lesson.title,
        sessionLog,
      });

      summaryText = generatedSummary.summary_text;
      nextRecommendation = generatedSummary.next_recommendation;
      concepts = generatedSummary.concepts;

      await updateSession(id, {
        summary_text: summaryText,
        next_recommendation: nextRecommendation,
        summary_concepts: concepts,
      });

      const latestQuestion = await getLatestQuestionBySession(id);
      if (latestQuestion) {
        await supabase.from('ai_responses').insert({
          question_id: latestQuestion.id,
          response_type: 'summary',
          response_text: summaryText,
          grounded_flag: true,
          misconception_type: null,
        });
      }
    }

    return NextResponse.json<ApiResponse<SessionSummaryData>>(
      {
        success: true,
        data: {
          session_id: id,
          lesson_id: session.lesson_id,
          lesson_title: lesson.title,
          question_count: questionCount,
          current_step: session.current_step,
          summary_text: summaryText,
          next_recommendation: nextRecommendation,
          concepts,
          quiz_passed: session.quiz_passed,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[GET /api/sessions/[id]/summary]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '세션 요약 조회 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
