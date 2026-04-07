-- Storage 버킷: 교사 수업 자료 파일 저장
-- 서버(Service Role)만 업로드 — Service Role은 RLS bypass
-- 정책이 없으면 기본적으로 anon/authenticated는 모든 작업 거부됨

INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-files', 'lesson-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: 인증된 사용자 읽기만 허용 (다운로드)
CREATE POLICY "lesson_files_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'lesson-files');
