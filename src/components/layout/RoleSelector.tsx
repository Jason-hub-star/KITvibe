/**
 * @file components/layout/RoleSelector.tsx
 * @description 역할 선택 카드 — 교사/학생 선택 → 데모 유저 생성 → 라우팅
 * @domain shared
 * @access client
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { useRole } from '@/components/layout/RoleProvider';
import type { UserRole, ApiResponse, User } from '@/types';

const ROLES: { role: UserRole; label: string; description: string; icon: typeof BookOpen }[] = [
  {
    role: 'teacher',
    label: '교사',
    description: '수업 자료를 올리고 학생 오개념을 확인합니다.',
    icon: BookOpen,
  },
  {
    role: 'student',
    label: '학생',
    description: '수업 후 막히는 부분을 AI에게 질문합니다.',
    icon: GraduationCap,
  },
];

export function RoleSelector() {
  const router = useRouter();
  const { setUser } = useRole();
  const [loading, setLoading] = useState<UserRole | null>(null);

  async function handleSelect(role: UserRole) {
    setLoading(role);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const json = (await res.json()) as ApiResponse<User>;

      if (!json.success) {
        console.error('[RoleSelector]', json.error);
        toast.error('역할 선택에 실패했습니다. 다시 시도해 주세요.');
        return;
      }

      setUser(role, json.data.id, json.data.name);
      router.push(role === 'teacher' ? '/teacher/upload' : '/student/ask');
    } catch (err) {
      console.error('[RoleSelector]', err);
      toast.error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ROLES.map(({ role, label, description, icon: Icon }) => (
        <button key={role} onClick={() => handleSelect(role)} disabled={loading !== null}>
          <Card
            className={`cursor-pointer transition-colors hover:bg-surface-low ${
              loading === role ? 'opacity-60' : ''
            }`}
          >
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <Icon className="h-10 w-10 text-foreground" strokeWidth={1.5} />
              <span className="text-lg font-semibold">{label}</span>
              <span className="text-sm text-muted-foreground text-center">
                {description}
              </span>
              {loading === role && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  준비 중...
                </span>
              )}
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}
