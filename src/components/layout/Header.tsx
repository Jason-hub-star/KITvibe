/**
 * @file components/layout/Header.tsx
 * @description 공통 헤더 — Stitch 에디토리얼 스타일
 *   - 로고 아이콘 + "풀다 AI" + 역할 배지
 *   - sticky, 직각 디자인
 * @domain shared
 * @access client
 */

'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useRole } from '@/components/layout/RoleProvider';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, userName, clearUser } = useRole();

  // 랜딩·학생채팅 페이지는 자체 헤더 사용
  if (pathname === '/' || pathname === '/student/ask') return null;

  function handleChangeRole() {
    clearUser();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-3">
          <BookOpen className="size-5 text-primary" strokeWidth={1.5} />
          <span className="text-lg font-bold tracking-widest text-foreground uppercase">
            풀다 AI
          </span>
        </Link>

        {role && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="rounded-none">
              {role === 'teacher' ? '교사' : '학생'}
            </Badge>
            <span className="text-sm text-muted-foreground">{userName}</span>
            <button
              onClick={handleChangeRole}
              className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase hover:text-foreground transition-colors"
            >
              역할 변경
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
