/**
 * @file 20260407000001_review_fixes.sql
 * @description 셀프 리뷰 수정 — IVFFlat→HNSW, RLS 강화, unique constraint, RPC 권한
 * @domain all
 */

-- ============================================================
-- C-2: IVFFlat 빈 테이블 → HNSW로 교체 (데이터 양 무관하게 정확)
-- ============================================================
DROP INDEX IF EXISTS idx_materials_embedding;
CREATE INDEX idx_materials_embedding ON lesson_materials
  USING hnsw (embedding extensions.vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- C-3: 불필요한 anon INSERT 정책 제거 (서버 Service Role로만 쓰기)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_users" ON users;
DROP POLICY IF EXISTS "anon_insert_questions" ON student_questions;

-- ============================================================
-- W-8: match_chunks RPC — anon 직접 호출 차단 (서버에서만 호출)
-- ============================================================
REVOKE EXECUTE ON FUNCTION match_chunks FROM anon;
REVOKE EXECUTE ON FUNCTION match_chunks FROM authenticated;

-- ============================================================
-- N-5: misconception_summaries unique constraint
-- ============================================================
ALTER TABLE misconception_summaries
  ADD CONSTRAINT uq_misconception_lesson_concept UNIQUE (lesson_id, concept_name);
