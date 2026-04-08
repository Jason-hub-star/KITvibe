# Milestone Plan (D-7)

> 2026-04-06 (일) ~ 2026-04-13 (월) 마감

## 일별 계획

| 날짜 | Day | 목표 | 상태 | 산출물 |
|------|-----|------|------|--------|
| 04/06 (일) | D-7 | 기획 완료 + 프로젝트 셋업 | ✅ 완료 | 문서 23개 + git init + Stitch 시안 5P + 디자인 토큰 + Next.js 초기화 |
| 04/06 (일) | D-6 | DB + 데모 역할 세션 + 레이아웃 | ✅ 완료 | Supabase 6테이블 + RLS + 역할 선택 UI + 공통 레이아웃 |
| 04/07 (월) | D-5 | 교사 업로드 + RAG | ✅ 완료 | Storage 버킷, RAG 4파일, API 2개, UI 3개 컴포넌트 |
| 04/07 (월) | D-4 | 학생 질문 + AI 응답 | ✅ 완료 | 프롬프트 4역할, AI 3유틸, API 2개, 훅 1개, UI 5개, Stitch 시안 반영 |
| 04/09 (수) | D-3 | 교사 대시보드 | ✅ 완료 | DB 마이그레이션, 대시보드 집계 API 2개, AI 오개념 요약, UI 8개, 페이지 1개 |
| 04/10 (목) | D-2 | 통합 + 시연 흐름 | ✅ 완료 | end-to-end 데모 흐름, 세션/요약 복구, 태그 계약 하드닝, 실사용 완주 PASS |
| 04/11 (금) | D-1 | 배포 + 제출 준비 | 🟡 진행중 | Vercel Preview/Production 배포 완료, AI 리포트/PPT/README 잔여 |
| 04/12 (토) | D-0.5 | 최종 검증 | ⬜ 대기 | 배포 URL 접속 + 데모 정상 동작 |
| 04/13 (일) | D-0 | 최종 제출 | ⬜ 대기 | GitHub public + 라이브 URL + AI 리포트 + 동의서 |

## 각 날의 검증 기준

- **D-7:** 프로젝트 구조 + 문서 완비
- **D-6:** `npm run build` 성공, Supabase 연결 확인, 역할 선택 동작 ✅
- **D-5:** PDF/MD 업로드 → 텍스트 추출 → 청킹 → DB 저장 확인 ✅
- **D-4:** 질문 입력 → AI Grill-Me 질문 + 추천 보기 스트리밍 확인 ✅
- **D-3:** 대시보드에 히트맵 데이터 렌더링 확인 ✅
- **D-2:** 데모 시나리오 전체 흐름 3분 내 완주 ✅
- **D-1:** 배포 URL 접속 + 데모 정상 동작
- **D-0:** 제출물 4개 체크리스트 전부 ✅

## 현재 남은 일

1. Production URL 기준 실기기 완주 테스트 1회
2. PPT / AI 리포트 / README 정리
3. 제출 체크리스트 최종 닫기
4. GitHub public 저장소 / 제출 서류 최종 점검

## D-4 셀프 리뷰 발견/수정

| 이슈 | 심각도 | 수정 |
|------|--------|------|
| parseAiTags를 lib/(서버전용)에서 클라이언트 훅이 import | 🔴 | utils/로 이동, lib/에서 re-export |
| 두 개 setState 경쟁 조건 (user+assistant 메시지) | 🔴 | 한 번의 setState로 합침 |
| 스트리밍 중 [RECOMMENDATION] 등 태그 사용자에게 노출 | 🟡 | 실시간 태그 필터 + 프롬프트에 태그 맨끝 지시 |
| respond API mode/step 기본값 누락 | 🟡 | destructuring default 추가 |
| P-001 랜딩 Stitch 30% 미반영 | 🔴 | 5섹션 풀 리빌드 (Hero+카드+Stats+Methodology+Footer) |
| P-002 입력/라벨/파일리스트 Stitch 미반영 | 🔴 | underline 입력, 10px라벨, flat 리스트로 전환 |
| 공통 Footer 누락 | 🟡 | LandingFooter 컴포넌트 생성, P-001/P-002에 추가 |
| Header가 랜딩에서도 표시 | 🟡 | pathname 기반 조건부 숨김 |

## D-3 셀프 리뷰 발견/수정

| 이슈 | 심각도 | 수정 |
|------|--------|------|
| useEffect deps에 isGenerating → 무한루프 | 🔴 | useRef(hasTriggered) + cleanup 패턴 |
| DB 컬럼 `name`인데 `display_name`으로 JOIN | 🔴 | `name` 필드로 수정 |
| Output.object에 배열 스키마 직접 전달 | 🟡 | z.object({ items: z.array(...) }) wrapper |
| FK 힌트 모호성 (users 관계 2개) | 🟡 | 정확한 constraint 이름 명시 |
| 학생 입력이 system 프롬프트에 삽입 (주입 위험) | 🟡 | user message로 분리 |

## D-5 셀프 리뷰 발견/수정

| 이슈 | 심각도 | 수정 |
|------|--------|------|
| getFullText 중복 텍스트 결합 (청크 N개 × 같은 전체 텍스트) | 🔴 | chunk_index=0 필터 추가 |
| processUpload 자기 서버 fetch anti-pattern | 🔴 | 함수 삭제 (dead code) |
| Storage RLS 정책이 다른 버킷 INSERT 허용 | 🟡 | 정책 삭제 (기본 거부) |
| chunk.ts 무한 루프 가능성 | 🟡 | 최소 1글자 전진 보장 |
| clipboard catch 없음 | 🟢 | .catch() 추가 |
| storagePath 특수문자 | 🟢 | safeName sanitize 추가 |
