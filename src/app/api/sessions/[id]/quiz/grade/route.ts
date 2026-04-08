/**
 * @file app/api/sessions/[id]/quiz/grade/route.ts
 * @description POST /api/sessions/[id]/quiz/grade — 미니퀴즈 채점
 * @domain session
 * @access server-only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { gradeMiniQuiz } from '@/lib/ai/gradeMiniQuiz';
import { retrieveContext } from '@/lib/rag/search';
import { getLatestQuestionBySession, getSessionById, updateSession } from '@/lib/actions/sessions';
import type { ApiResponse } from '@/types';

interface GradeQuizRequestBody {
  answer?: string;
}

interface GradeQuizResponseData {
  passed: boolean;
  feedback: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as GradeQuizRequestBody;
    const answer = body.answer?.trim();

    if (!answer) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '퀴즈 답변은 필수입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const session = await getSessionById(id);
    if (!session || !session.quiz_question) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '퀴즈가 아직 생성되지 않았습니다.', code: 'NOT_FOUND' },
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

    const grade = await gradeMiniQuiz({
      lessonTitle: lesson.title,
      retrievedChunks: await retrieveContext(session.lesson_id),
      quizQuestion: session.quiz_question,
      quizAnswer: answer,
    });

    await updateSession(id, {
      quiz_answer: answer,
      quiz_passed: grade.passed,
    });

    const latestQuestion = await getLatestQuestionBySession(id);
    if (latestQuestion) {
      await supabase.from('ai_responses').insert({
        question_id: latestQuestion.id,
        response_type: 'feedback',
        response_text: grade.feedback,
        grounded_flag: true,
        misconception_type: null,
      });
    }

    return NextResponse.json<ApiResponse<GradeQuizResponseData>>(
      { success: true, data: grade },
      { status: 200 },
    );
  } catch (err) {
    console.error('[POST /api/sessions/[id]/quiz/grade]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '미니퀴즈 채점 중 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
