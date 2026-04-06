# RAG Pipeline — MathTutor AI

> 원본: overview.md §F

## 처리 흐름

```
[교사 업로드 — PDF]
  PDF → Supabase Storage → pdf-parse 텍스트 추출
    → Recursive 청킹 (512 tokens, 15% overlap)
    → text-embedding-3-small 임베딩
    → pgvector 저장

[교사 업로드 — Obsidian .md]
  .md → gray-matter (YAML frontmatter 추출)
    → remark (헤딩 기준 자연 청킹)
    → [[위키링크]] 파싱 → 개념 관계 메타데이터
    → text-embedding-3-small 임베딩
    → pgvector 저장

[학생 질문]
  질문 텍스트 → 임베딩
    → pgvector 유사도 검색 (cosine, top 3)
    → 상위 chunk 반환
    → Grill-Me 질문 프롬프트 + chunk + 질문 → AI → 스트리밍 응답
```

## 지원 파일 형식

| 형식 | 파서 | 청킹 방식 | 메타데이터 |
|------|------|----------|-----------|
| **PDF** | `pdf-parse` | Recursive 512t/15% | file_name, chunk_index |
| **Obsidian .md** | `gray-matter` + `remark` | **헤딩(#/##) 기준 자연 청킹** | YAML frontmatter + `[[위키링크]]` |

## Chunking 전략

| 전략 | 파라미터 | 적용 상황 |
|------|----------|----------|
| Recursive Character Splitting | 512 tokens, 15% overlap | PDF 기본값 |
| **헤딩 기준 자연 분할** | #/## 경계에서 분할 | Obsidian .md |
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

## 임베딩 모델

| 모델 | 비용 | 차원 | 선택 이유 |
|------|------|------|----------|
| **`openai/text-embedding-3-small`** | $0.02/1M | 1536d | pgvector 사례 풍부, 10배 저렴 (vs Gemini Embedding 2) |

## 제외

- 전 인터넷 검색, 자동 웹 브라우징, 유튜브 크롤링, 외부 논문 검색
