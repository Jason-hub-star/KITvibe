# RAG Pipeline — MathTutor AI

> 원본: overview.md §F

## 처리 흐름

```
[교사 업로드]
  PDF/이미지 → Supabase Storage
    → 텍스트 추출 (PDF파싱 / OCR)
    → 청킹 (Recursive, 512 tokens, 15% overlap)
    → 임베딩 (AI Gateway)
    → pgvector 저장 (lesson_materials.embedding)

[학생 질문]
  질문 텍스트 → 임베딩
    → pgvector 유사도 검색 (cosine, top 3)
    → 상위 chunk 반환
    → 시스템 프롬프트 + chunk + 질문 → AI Gateway → 스트리밍 응답
```

## Chunking 전략

| 전략 | 파라미터 | 적용 상황 |
|------|----------|----------|
| Recursive Character Splitting | 512 tokens, 15% overlap | 기본값 |
| 수식 블록 단위 | 문제-풀이-해설 동일 chunk | 수학 특화 |

## 메타데이터

각 chunk에 포함:
- `lesson_id` — 수업 연결
- `topic` — 주제/단원
- `source_file` — 원본 파일명
- `chunk_index` — 순서

## 응답 원칙

| 상황 | 응답 | grounded_flag |
|------|------|--------------|
| 자료 근거 있음 | 근거 기반 응답 + "📚 수업자료 근거" | true |
| 자료 근거 부족 | "수업 자료에서는 확인되지 않습니다" | false |

## 제외

- 전 인터넷 검색, 자동 웹 브라우징, 유튜브 크롤링, 외부 논문 검색
