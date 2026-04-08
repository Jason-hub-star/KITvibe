-- Storage 버킷: 학생 질문 이미지 저장
-- 서버(Service Role)만 업로드하며, AI 입력은 클라이언트 data URL을 사용

INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', false)
ON CONFLICT (id) DO NOTHING;
