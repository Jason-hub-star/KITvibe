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
  intent: IntentType;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lesson_id, student_id, question_text, image_url } = body;

    // 검증
    if (!lesson_id || !student_id || !question_text) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '필수 필드 누락: lesson_id, student_id, question_text',
        code: 'VALIDATION_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 1. 의도 분류
    const { intent, confidence } = await classifyIntent(question_text);

    // 2. DB 저장
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('student_questions')
      .insert({
        lesson_id,
        student_id,
        question_text,
        image_url: image_url || null,
        intent_type: intent,
      })
      .select()
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
        intent,
        confidence,
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
