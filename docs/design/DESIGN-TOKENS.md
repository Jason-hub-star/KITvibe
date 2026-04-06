# Design Tokens — Stitch HTML → shadcn/ui 매핑

> Stitch 시안 5개 HTML에서 추출한 디자인 토큰.
> shadcn/ui CSS 변수에 매핑하여 구현 시 참조.

## 1. 컬러 팔레트 (통합)

5개 페이지에서 공통으로 사용된 컬러를 통합. **Material Design 3 시맨틱 토큰** 기반.

### 핵심 컬러 (shadcn CSS 변수 매핑)

| 용도 | Stitch 토큰 | 헥스값 | shadcn 변수 |
|------|------------|--------|------------|
| 배경 | `background` | `#faf9f7` | `--background` |
| 전경 텍스트 | `on-surface` | `#1a1c1b` | `--foreground` |
| 카드 배경 | `surface-container-lowest` | `#ffffff` | `--card` |
| 카드 텍스트 | `on-surface` | `#1a1c1b` | `--card-foreground` |
| 팝오버 | `surface-container-lowest` | `#ffffff` | `--popover` |
| 주색 (Primary) | `primary` | `#000000` | `--primary` |
| 주색 위 텍스트 | `on-primary` | `#e5e2e1` | `--primary-foreground` |
| 보조색 | `secondary` | `#5f5e5e` | `--secondary` |
| 보조색 위 텍스트 | `on-secondary` | `#ffffff` | `--secondary-foreground` |
| 뮤트 배경 | `surface-container-low` | `#f4f3f1` | `--muted` |
| 뮤트 텍스트 | `on-surface-variant` | `#474747` | `--muted-foreground` |
| 악센트 | `surface-container` | `#efeeec` | `--accent` |
| 악센트 텍스트 | `on-surface` | `#1a1c1b` | `--accent-foreground` |
| 에러 | `error` | `#ba1a1a` | `--destructive` |
| 에러 텍스트 | `on-error` | `#ffffff` | `--destructive-foreground` |
| 보더 | `outline-variant` | `#c6c6c6` | `--border` |
| 인풋 보더 | `outline` | `#777777` | `--input` |
| 포커스 링 | `primary` | `#000000` | `--ring` |

### 표면 계층 (Surface hierarchy)

```
surface-container-lowest:  #ffffff     ← 카드, 팝오버
surface-container-low:     #f4f3f1     ← 약간 뮤트된 배경
surface-container:         #efeeec     ← 섹션 배경
surface-container-high:    #eae8e5     ← 프로그레스 바 트랙
surface-container-highest: #e4e2df     ← 강조 배경
surface-variant:           #e4e2df     ← 구분선 배경
surface-dim:               #dbdad7     ← 비활성 상태
```

### 텍스트 계층

```
on-surface:          #1a1c1b   ← 주 텍스트 (거의 블랙)
on-surface-variant:  #474747   ← 보조 텍스트 (회색)
outline:             #777777   ← 비활성 텍스트, 플레이스홀더
outline-variant:     #c6c6c6   ← 구분선, 비활성 보더
secondary:           #5f5e5e   ← 라벨, 부제목
```

## 2. 타이포그래피

### 폰트

| Stitch | 구현 (shadcn) |
|--------|--------------|
| Manrope | **Geist Sans** (CLAUDE.md 기술스택에 명시) |
| Manrope + Pretendard (P001) | Geist Sans (한국어 fallback: system-ui) |
| Material Symbols Outlined | **Lucide React** (shadcn 표준 아이콘) |

### 타이포 스케일 (Stitch에서 추출)

| 용도 | 클래스 | 설명 |
|------|--------|------|
| 페이지 제목 | `text-5xl font-extrabold tracking-tight` | 48px, 극볼드 |
| 섹션 제목 | `text-3xl font-bold tracking-tight` | 30px |
| 카드 제목 | `text-xl font-bold` | 20px |
| 본문 | `text-base leading-relaxed` | 16px |
| 라벨 | `text-[0.75rem] font-bold uppercase tracking-[0.05em]` | 12px, 대문자 |
| 마이크로 | `text-[10px] font-bold uppercase tracking-widest` | 10px, 추적 넓음 |
| 수치 (stats) | `text-4xl~6xl font-extrabold tabular-nums` | 큰 숫자 표시 |

### 핵심 패턴

- **tracking-tighter** → 제목에서 자간 좁힘 (볼드 타이포 특징)
- **uppercase tracking-widest** → 라벨/카테고리에서 대문자 + 넓은 자간
- **font-mono** → 숫자, 퍼센티지, 코드에서 사용

## 3. 보더 반경 (Border Radius)

| Stitch 설정 | 값 | shadcn 변수 |
|-------------|---|------------|
| DEFAULT | `0px ~ 0.125rem` | `--radius: 0.125rem` |
| lg | `0px ~ 0.25rem` | 거의 직각 (sharp aesthetic) |
| xl | `0px ~ 0.5rem` | 채팅 버블에서만 xl 사용 |
| full | `9999px` | 원형 (아바타, 태그) |

**핵심:** 대부분 **직각 또는 극소 라운딩** → 아카데믹/에디토리얼 느낌

## 4. 간격 (Spacing) 패턴

| 용도 | 패턴 |
|------|------|
| 페이지 패딩 | `px-6 py-4` (모바일), `px-8~12` (데스크톱) |
| 섹션 간 | `space-y-16 ~ space-y-24` (넉넉한 여백) |
| 카드 내부 | `p-5 ~ p-8 ~ p-12` |
| 리스트 아이템 간 | `space-y-6 ~ space-y-12` |
| 컴팩트 요소 간 | `gap-2 ~ gap-4` |

## 5. 레이아웃 패턴 (페이지별)

### P001 — 랜딩
- `max-w-7xl mx-auto`
- Hero: 풀폭 좌정렬 텍스트
- 2컬럼: `md:w-3/5` + `md:w-2/5`
- 벤토 그리드: `grid-cols-12` (4+8)
- sticky header + footer

### P002 — 교사 업로드
- `max-w-2xl mx-auto` (좁은 폼)
- 수직 스택: `flex flex-col gap-10~12`
- 드래그앤드롭: `aspect-[4/3] border-dashed`
- 풀폭 CTA 버튼

### P003 — 학생 채팅
- `max-w-4xl mx-auto`
- 채팅 버블: 좌(AI) `items-start`, 우(학생) `items-end ml-auto`
- AI 버블: `max-w-[85%]`, 라운딩 `rounded-xl rounded-tl-none`
- 학생 버블: `rounded-xl rounded-tr-none`
- 프로그레스 바: `h-[2px]`
- 벤토 카드: `grid-cols-2` (학습 개념 + 학습 효율)
- fixed bottom 입력바

### P004 — 교사 대시보드
- `max-w-[1440px] mx-auto`
- 3컬럼 스탯: `grid-cols-3`
- 12컬럼 레이아웃: `lg:grid-cols-12` (히트맵 7 + TOP5 5)
- 프로그레스 바: `h-[6px]` with percentage width
- 보충 추천: 이미지(5) + 텍스트(7)

### P005 — 학생 요약
- `max-w-[600px] mx-auto` (영수증 스타일)
- 센터 정렬 헤더
- 3컬럼 스탯 그리드
- 점선 구분: `border-dashed`
- 커리큘럼 리스트: 체크 아이콘 + REVIEW REQUIRED
- 에디토리얼 인용구: `border-l-2 border-primary`
- fixed bottom 네비게이션

## 6. 컴포넌트 매핑 (Stitch → shadcn/ui)

| Stitch HTML 요소 | shadcn 컴포넌트 |
|-----------------|----------------|
| `<button class="bg-primary...">` | `<Button>` |
| `<button class="bg-primary-container...">` | `<Button variant="secondary">` |
| `<input class="border-b-2...">` | `<Input>` (커스텀 underline 스타일) |
| 드래그앤드롭 영역 | `react-dropzone` + 커스텀 UI |
| 프로그레스 바 | `<Progress>` |
| 채팅 버블 | 커스텀 `MessageBubble` 컴포넌트 |
| 접이식 "추천 보기" | `<Collapsible>` |
| 태그/배지 | `<Badge>` |
| 히트맵 바 | `<Progress>` with label |
| 스탯 카드 | `<Card>` (커스텀 레이아웃) |
| 커리큘럼 리스트 | 커스텀 리스트 (체크/화살표) |
| Material Symbols 아이콘 | `lucide-react` 아이콘 |

## 7. shadcn/ui globals.css 설정

```css
@layer base {
  :root {
    --background: 40 20% 98%;        /* #faf9f7 */
    --foreground: 150 6% 10%;        /* #1a1c1b */
    --card: 0 0% 100%;               /* #ffffff */
    --card-foreground: 150 6% 10%;   /* #1a1c1b */
    --popover: 0 0% 100%;
    --popover-foreground: 150 6% 10%;
    --primary: 0 0% 0%;              /* #000000 */
    --primary-foreground: 30 6% 89%; /* #e5e2e1 */
    --secondary: 0 1% 37%;           /* #5f5e5e */
    --secondary-foreground: 0 0% 100%;
    --muted: 30 6% 95%;              /* #f4f3f1 */
    --muted-foreground: 0 0% 28%;    /* #474747 */
    --accent: 30 5% 93%;             /* #efeeec */
    --accent-foreground: 150 6% 10%;
    --destructive: 0 73% 41%;        /* #ba1a1a */
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 78%;              /* #c6c6c6 */
    --input: 0 0% 47%;               /* #777777 */
    --ring: 0 0% 0%;                 /* #000000 */
    --radius: 0.125rem;
  }
}
```

## 8. 주요 디자인 원칙 (Stitch에서 관찰)

1. **극도의 미니멀리즘** — 장식 없음, 타이포그래피가 주인공
2. **직각 미학** — border-radius 거의 0 (에디토리얼/아카데믹)
3. **모노크로매틱 웜** — 검정~회색~따뜻한 흰색 그라데이션
4. **대문자 라벨** — `uppercase tracking-widest` 패턴 반복
5. **넉넉한 여백** — `space-y-16 ~ space-y-24`, `p-8 ~ p-12`
6. **수치 강조** — 큰 숫자(4xl~6xl) + extrabold + tabular-nums
7. **위계가 명확** — 제목/본문/라벨 3단계 뚜렷
