/**
 * @file types/user.types.ts
 * @description 사용자(user) 도메인 타입 — DB 컬럼명 1:1 매핑
 * @domain user
 * @access shared
 */

import type { UserRole } from '@/types/common.types';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  created_at: string;
}
