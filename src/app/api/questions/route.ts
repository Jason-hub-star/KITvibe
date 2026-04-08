/**
 * @file app/api/questions/route.ts
 * @description POST /api/questions — 학생 질문 저장 + 의도 분류
 *   - student_questions INSERT
 *   - classifyIntent() → intent, confidence
 * @domain question
 * @access shared
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { classifyIntent } from '@/lib/ai/classifyIntent';
import type { ApiResponse, StudentQuestion, IntentType } from '@/types';

interface QuestionResponseData {
  question: StudentQuestion;
  intent: IntentType | null;
  confidence: number | null;
}

const QUESTION_SELECT =
  'id, lesson_id, student_id, session_id, question_text, image_url, intent_type, created_at';
const IMAGE_ONLY_PLACEHOLDER = '이미지 질문';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lesson_id, student_id, session_id, question_text, image_url } = body;
    const normalizedQuestionText =
      typeof question_text === 'string' ? question_text.trim() : '';

    // 검증
    if (!lesson_id || !student_id || !session_id || (!normalizedQuestionText && !image_url)) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '필수 필드 누락: lesson_id, student_id, session_id, question_text 또는 image_url',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 1. 의도 분류
    const intentResult = normalizedQuestionText
      ? await classifyIntent(normalizedQuestionText)
      : { intent: null, confidence: null };

    // 2. DB 저장
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_questions')
      .insert({
        lesson_id,
        student_id,
        session_id,
        question_text: normalizedQuestionText || IMAGE_ONLY_PLACEHOLDER,
        image_url: image_url || null,
        intent_type: intentResult.intent,
      })
      .select(QUESTION_SELECT)
      .single();

    if (error) {
      console.error('[POST /api/questions]', error.message);
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '질문 저장에 실패했습니다.',
        code: 'INTERNAL_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const successResponse: ApiResponse<QuestionResponseData> = {
      success: true,
      data: {
        question: data as StudentQuestion,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      },
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (err) {
    console.error('[POST /api/questions]', err);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: '서버 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
