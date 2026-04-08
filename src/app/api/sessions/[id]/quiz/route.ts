/**
 * @file app/api/sessions/[id]/quiz/route.ts
 * @description POST /api/sessions/[id]/quiz — 세션 미니퀴즈 생성
 * @domain session
 * @access server-only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { generateMiniQuiz } from '@/lib/ai/generateMiniQuiz';
import { retrieveContext } from '@/lib/rag/search';
import {
  getLatestQuestionBySession,
  getSessionById,
  getSessionTranscript,
  updateSession,
} from '@/lib/actions/sessions';
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

      if (row.image_url) {
        parts.push('학생 이미지 질문 포함');
      }

      if (row.response_text) {
        parts.push(`AI 응답(${row.response_type ?? 'unknown'}): ${row.response_text}`);
      }

      return parts.join('\n');
    })
    .join('\n\n');
}

interface QuizResponseData {
  quiz_question: string;
}

export async function POST(
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

    if (session.quiz_question) {
      return NextResponse.json<ApiResponse<QuizResponseData>>(
        { success: true, data: { quiz_question: session.quiz_question } },
        { status: 200 },
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
    const sessionLog = buildSessionLog(transcript);
    const retrievedChunks = await retrieveContext(session.lesson_id);
    const quiz = await generateMiniQuiz({
      lessonTitle: lesson.title,
      retrievedChunks,
      sessionLog,
    });

    await updateSession(id, {
      quiz_question: quiz.question,
      quiz_answer: null,
      quiz_passed: null,
    });

    const latestQuestion = await getLatestQuestionBySession(id);
    if (latestQuestion) {
      await supabase.from('ai_responses').insert({
        question_id: latestQuestion.id,
        response_type: 'quiz',
        response_text: quiz.question,
        grounded_flag: true,
        misconception_type: null,
      });
    }

    return NextResponse.json<ApiResponse<QuizResponseData>>(
      { success: true, data: { quiz_question: quiz.question } },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/sessions/[id]/quiz]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '미니퀴즈 생성 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
