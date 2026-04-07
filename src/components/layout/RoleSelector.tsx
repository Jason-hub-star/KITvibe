/**
 * @file components/layout/RoleSelector.tsx
 * @description 역할 선택 카드 — Stitch 에디토리얼 스타일
 *   - gap-px 구분선, hover progress bar, "→" 화살표
 *   - 교사/학생 선택 → 데모 유저 생성 → 라우팅
 * @domain shared
 * @access client
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useRole } from '@/components/layout/RoleProvider';
import type { UserRole, ApiResponse, User } from '@/types';

const ROLES: {
  role: UserRole;
  label: string;
  sublabel: string;
  description: string;
  progressStart: string;
  progressHover: string;
}[] = [
  {
    role: 'teacher',
    label: '교사로 시작',
    sublabel: 'For Educators / 교사용',
    description:
      '실시간 오개념 분석 대시보드를 통해\n학생들의 사고 과정을 정밀하게 추적하고\n개별화된 피드백을 제공하세요.',
    progressStart: 'w-1/3',
    progressHover: 'group-hover:w-1/2',
  },
  {
    role: 'student',
    label: '학생으로 시작',
    sublabel: 'For Students / 학습자용',
    description:
      'AI 튜터와의 대화를 통해\n단순 암기가 아닌 원리를 탐구하고\n스스로 문제를 해결하는 힘을 기르세요.',
    progressStart: 'w-1/4',
    progressHover: 'group-hover:w-2/3',
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
    <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
      {ROLES.map(({ role, label, sublabel, description, progressStart, progressHover }, index) => (
        <button
          key={role}
          onClick={() => handleSelect(role)}
          disabled={loading !== null}
          className={`bg-background p-12 md:p-20 hover:bg-card transition-colors group cursor-pointer text-left ${
            loading === role ? 'opacity-60' : ''
          } ${index === 1 ? 'border-t md:border-t-0 md:border-l border-border' : ''}`}
         
        >
          <div className="mb-12">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              {sublabel}
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-6">{label} →</h2>
          <p className="text-muted-foreground leading-relaxed mb-12 whitespace-pre-line">
            {description}
          </p>
          {/* Progress Bar */}
          <div className="h-1 bg-muted w-full relative">
            <div
              className={`absolute left-0 top-0 h-full bg-primary ${progressStart} ${progressHover} transition-all duration-500`}
            />
          </div>
          {loading === role && (
            <span className="text-xs text-muted-foreground animate-pulse mt-4 block">
              준비 중...
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
