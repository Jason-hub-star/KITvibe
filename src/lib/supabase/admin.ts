/**
 * @file lib/supabase/admin.ts
 * @description 관리자용 Supabase 클라이언트 (Service Role, RLS bypass)
 * @domain infra
 * @access server-only
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing — server-only 환경에서만 사용 가능합니다.');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
