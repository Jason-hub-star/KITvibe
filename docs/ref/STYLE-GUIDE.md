# Style Guide — 풀다 AI

> Stitch 시안에서 확정된 디자인 방향. 상세 토큰은 `docs/design/DESIGN-TOKENS.md` 참조.

## 디자인 톤

- **에디토리얼 아카데믹** — 타이포그래피 중심, 장식 없음
- 신뢰감 + 절제 (AI 슬롭 금지: 보라 그라데이션, 글래스모피즘, 네온)
- "장난감"이 아닌 "연구 도구" 느낌
- 한국어 우선, 영문은 라벨/카테고리에서만

## 색상

- **배경:** 따뜻한 흰색 `#faf9f7` (라이트모드 기본)
- **Primary:** 블랙 `#000000` (텍스트 + CTA)
- **Secondary:** 뉴트럴 그레이 `#5f5e5e` (라벨, 부제목)
- **표면:** 5단계 warm gray 계층 (`#ffffff` → `#e4e2df`)
- **보더:** `#c6c6c6` (연한 그레이)
- **에러:** `#ba1a1a` (최소 사용)
- **성공/경고:** green / amber (히트맵, 상태 배지에서만)
- **Accent 컬러 없음** — 모노크로매틱 웜 팔레트

## 타이포그래피

| 용도 | 폰트 | 비고 |
|------|------|------|
| UI 텍스트 | Geist Sans | Stitch는 Manrope → 구현은 Geist |
| 코드/수식ID/타임스탬프 | Geist Mono | `tabular-nums` 숫자 |
| 수식 렌더링 | KaTeX | `serif italic` |
| 아이콘 | Lucide React | Stitch는 Material Symbols → 구현은 Lucide |

### 핵심 패턴

- **제목:** `font-extrabold tracking-tight` (자간 좁힘 + 극볼드)
- **라벨:** `text-[0.75rem] font-bold uppercase tracking-[0.05em]` (대문자 + 넓은 자간)
- **마이크로:** `text-[10px] uppercase tracking-widest` (10px 대문자)
- **수치:** `text-4xl~6xl font-extrabold tabular-nums` (큰 숫자 강조)

## 레이아웃

- **직각 미학:** `--radius: 0.125rem` (거의 0)
- **넉넉한 여백:** `space-y-16~24` 섹션 간, `p-8~12` 카드 내부
- **12컬럼 그리드:** 대시보드에서 `lg:grid-cols-12` 사용
- **반응형:** 모바일 1열 → 태블릿 2열 → 데스크톱 max-width

## 컴포넌트 기준

- shadcn/ui 우선 사용
- Card: 직각, 미니멀 보더 (`border-outline-variant/20`)
- Button: 블랙 배경 + 라이트 텍스트 (primary), 그레이 배경 (secondary)
- Progress: 얇은 바 (`h-[2px]~h-[6px]`)
- Input: 밑줄 스타일 (`border-b-2`, 테두리 없음)
- Badge: 작고 절제된 (`px-2 py-1 text-[10px]`)

## 게임화 UX

| 허용 | 금지 |
|------|------|
| 질문 사다리 프로그레스 (질문 2/4) | 리더보드 |
| 오개념 회복 배지 | 코인/포인트 |
| 오늘 해결한 막힘 수 | 캐릭터/아바타 |
| 교사용 회복률 카드 | 경쟁 랭킹 |

## 레퍼런스 파일

| 파일 | 내용 |
|------|------|
| `docs/design/DESIGN-TOKENS.md` | 전체 토큰 + HSL 값 + shadcn 매핑 |
| `docs/design/stitch-outputs/P00X-*.html` | Stitch 원본 HTML (레이아웃 레퍼런스) |
| `docs/design/stitch-outputs/P00X-*.png` | Stitch 시각 레퍼런스 |
