/**
 * @file 20260409030000_add_session_summary_concepts.sql
 * @description 세션 요약 캐시 확장 — summary_concepts 추가
 * @domain session
 */

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS summary_concepts text[];
