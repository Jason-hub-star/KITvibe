/**
 * @file components/layout/Header.tsx
 * @description 공통 헤더 — 로고 + 역할 표시 + 역할 변경
 * @domain shared
 * @access client
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/components/layout/RoleProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const router = useRouter();
  const { role, userName, clearUser } = useRole();

  function handleChangeRole() {
    clearUser();
    router.push('/');
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">풀다 AI</span>
        </Link>

        {role && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {role === 'teacher' ? '교사' : '학생'}
            </Badge>
            <span className="text-sm text-muted-foreground">{userName}</span>
            <Button variant="ghost" size="sm" onClick={handleChangeRole}>
              역할 변경
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
