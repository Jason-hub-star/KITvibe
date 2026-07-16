# Typography Token Lock — 2026-04-10

> 목적: 모바일과 데스크톱에서 작은 텍스트의 가독성을 올리되, `text-[10px]` 하드코딩을 화면마다 따로 키우지 않고 전역 semantic token으로 묶는다.

## 왜 잠그는가

- 현재 작은 텍스트가 `text-[10px]`, `text-xs`, `text-sm`로 섞여 있어 화면마다 리듬이 다르다.
- 페이지별로 임시 확대를 하면 카드 높이, 표 헤더, 버튼 폭이 제각각 바뀌어 회귀가 생기기 쉽다.
- 특히 교사 대시보드 버튼/표 헤더, 학생 채팅 상단 상태, 랜딩 step marker처럼 폭이 작은 영역은 보수적으로 다뤄야 한다.

## 이번 패치에서 잠그는 원칙

### 1. 작은 텍스트는 semantic utility로 통일한다

- `ui-kicker`: 섹션 라벨, 카드 eyebrow, 필터 버튼 같은 강조 라벨
- `ui-micro`: 날짜, 보조 상태, 캡션 같은 작은 메타
- `ui-support`: 작은 설명 문장, 안내 카피

### 2. 크기 조정은 전역 변수로 잠근다

- `ui-kicker`는 12px 기준을 유지한다.
- `ui-micro`는 모바일 11px, `sm` 이상 12px로 올린다.
- `ui-support`는 모바일 15px, `sm` 이상 16px로 올린다.

### 3. 모든 `10px` 텍스트를 한 번에 키우지 않는다

- 고정 폭이 작은 step marker, 표 헤더, nowrap 상태 텍스트는 1차에서 보수적으로 유지하거나 개별 확인 후 치환한다.
- 1차 치환 범위는 랜딩, 역할 선택, 수업 선택, 학생 채팅/요약, 교사 대시보드 핵심 카드다.

### 4. 문서 SSOT도 raw class보다 semantic 규칙으로 바꾼다

- `text-[10px]` 자체를 기준으로 쓰지 않고 `ui-kicker`, `ui-micro`, `ui-support`를 우선 표기한다.
- 필요 시 예시 클래스를 병기하되, 구현은 utility 중심으로 맞춘다.

## 위험 구간 메모

- `src/app/teacher/dashboard/page.tsx`: 빠른 이동 버튼은 폭이 좁아 `ui-kicker` 적용 시 패딩과 함께 봐야 한다.
- `src/components/teacher/QuestionLogTable.tsx`: 4열 헤더라 확대 시 컬럼 밀도가 높아질 수 있다.
- `src/components/student/QuestionChat.tsx`: 상단 단계 텍스트는 `whitespace-nowrap`라 과도한 확대를 피한다.
- `src/app/page.tsx`: step marker 내부 숫자는 고정 박스라 개별 크기 유지가 더 안전하다.

## 1차 적용 대상

1. `src/app/page.tsx`
2. `src/components/layout/RoleSelector.tsx`
3. `src/components/lesson/LessonSearchList.tsx`
4. `src/components/student/QuestionChat.tsx`
5. `src/components/student/SessionSummaryView.tsx`
6. `src/app/teacher/dashboard/page.tsx`
7. `src/components/teacher/DashboardStats.tsx`
8. `src/components/teacher/AISpotlightCard.tsx`
9. `src/components/teacher/QuestionLogTable.tsx`
10. `src/components/teacher/UploadForm.tsx`

## 2차 자기리뷰 보강

- `SessionStats`, `MessageBubble`, `TopQuestionsCard`, `MisconceptionHeatmap`, `LandingFooter`, `student/ask` 수업 선택 라벨까지 같은 utility로 확장한다.
- step marker, mode selector, shadcn primitive는 블라스트 반경이 커서 이번 단계에서는 유지한다.
