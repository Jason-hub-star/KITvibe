# Submission Checklist

> 마감: 2026-04-13 (월)

## 현재 상태

- 제품 핵심 플로우: 완료
- 실사용 완주 QA: 완료
- Vercel 배포: 완료 (`https://vibecoding-two-jade.vercel.app`)
- 현재 남은 큰 항목: `PPT/AI 리포트`, 제출 서류

## 제출물

- [ ] **GitHub public 저장소** — API Key 노출 금지, .env.example 포함
- [x] **배포된 라이브 URL** — `https://vibecoding-two-jade.vercel.app`
- [ ] **AI 빌딩 리포트** — docx 양식 → PDF 변환 후 첨부
- [ ] **개인정보 동의서** — 서명 완료 PDF
- [ ] **참가 각서** — 서명 완료 PDF

## AI 리포트 체크

- [ ] 사용자/문제점 정의 작성
- [ ] 핵심 기능 설명
- [ ] 기대 효과 서술
- [ ] AI 도구별 활용 전략 (Claude Code, AI Gateway 등)
- [ ] 토큰 효율화 전략

## 주의사항

- [ ] 04/13 이후 Commit 없음 확인
- [ ] API Key가 코드에 노출되지 않음 확인
- [ ] .env*.local이 .gitignore에 포함됨 확인
- [ ] AI 기획문서/지침서가 프로젝트 내부에 포함됨 확인
- [ ] 라이브 URL에서 `교사 업로드 → 학생 질문 → 요약 → 대시보드` 스모크 테스트 완료

## 배포 후 최종 확인

- [x] Vercel Preview 정상
- [x] Vercel Production 정상
- [ ] 모바일 390px 실기기 스모크 정상
- [ ] 발표 자료 안의 URL / 스크린샷 / 제품 설명이 실제 배포본과 일치

## 배포 메모

- Preview URL: `https://vibecoding-6jue3n13r-kimjuyoung1127s-projects.vercel.app`
- Preview는 Vercel 팀 보호로 외부 `401`이 정상
- Production Alias: `https://vibecoding-two-jade.vercel.app`
- 공개 라우트 응답 확인: `/`, `/teacher/upload`, `/student/ask`, `/teacher/dashboard`

## 제출 방법

본 메일로 회신 (dla0625@koreaedugroup.com)
