# Harness Plan — MathTutor AI

> 원본: ~/jason/jasonob/harnesses/

## 선정 하네스

| 우선순위 | 하네스 | 적용 시점 | 상태 |
|---------|--------|----------|------|
| **P0** | project-setup | D-7 (오늘) | 🔄 진행중 |
| **P0** | design-to-code | D-7~D-6 | ⬜ 대기 |
| **P1** | socratic-review | 코딩 전 | ⬜ 대기 |
| **P2** | change-class-doc-sync | 개발 중 | ⬜ 대기 |
| **P2** | session-retro | 세션 종료 시 | ⬜ 대기 |

## project-setup 체크리스트

- [x] CLAUDE.md 존재 + Loading Order 명시
- [x] docs/status/PROJECT-STATUS.md 존재 + 검증 명령 기록
- [x] docs/ref/ARCHITECTURE.md 존재
- [ ] .gitignore 적용
- [ ] 첫 커밋 완료
- [ ] 검증 명령 1개 이상 실행 성공

## design-to-code 적용 계획

1. 화면 목록 + 유저 플로우 → ✅ (WIREFRAME.md)
2. 시안 생성 (Stitch 또는 v0) → ⬜
3. 디자인 결정 문서 → ⬜
4. 라우트맵 → ✅ (ROUTE-MAP.md)
5. 폴더 구조 생성 → ⬜ (Next.js init 시)

## socratic-review 적용 계획

- 대상: ARCHITECTURE.md + PROMPT-DESIGN.md
- Phase 1~4 (최소 Q1~Q9)
- 합의 도달 후 DECISION-LOG에 기록
