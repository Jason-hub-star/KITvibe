/**
 * @file app/api/users/route.ts
 * @description 데모 유저 생성 API — POST { role } → User
 * @domain user
 * @access server-only
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import type { UserRole, ApiResponse, User } from '@/types';

const DEMO_NAMES: Record<UserRole, string[]> = {
  teacher: ['김민수 선생님', '이지은 선생님', '박현우 선생님'],
  student: ['정하늘', '최서연', '한지우', '오민재', '윤채원'],
};

function getRandomName(role: UserRole): string {
  const names = DEMO_NAMES[role];
  return names[Math.floor(Math.random() * names.length)];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { role?: string };
    const role = body.role;

    if (role !== 'teacher' && role !== 'student') {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '유효하지 않은 역할입니다.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();
    const name = getRandomName(role);

    const { data, error } = await supabase
      .from('users')
      .insert({ role, name })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/users]', error);
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: '유저 생성에 실패했습니다.', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    return NextResponse.json<ApiResponse<User>>(
      { success: true, data: data as User },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/users]', err);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: '서버 오류가 발생했습니다.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
