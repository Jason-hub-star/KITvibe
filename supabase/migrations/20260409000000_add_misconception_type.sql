-- ai_responses 테이블에 misconception_type 컬럼 추가
-- 1~5 오개념 유형 (NULL 허용: 모든 응답에 오개념이 있는 건 아님)
ALTER TABLE ai_responses ADD COLUMN misconception_type smallint;
