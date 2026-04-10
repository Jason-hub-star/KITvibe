/**
 * @file scripts/demo-data/demoSeedData.mjs
 * @description 실제형 데모 데이터 정의
 *   - 교사 2명, 학생 10명, 수업 5개
 *   - PDF 위주, Markdown 보조 자료 허용
 * @domain demo-data
 * @access server-only
 */

export const DEMO_TEACHERS = [
  { key: 'teacher-kim-minsu', name: '김민수 선생님', homeroom: '2학년 1반' },
  { key: 'teacher-park-seoyeon', name: '박서연 선생님', homeroom: '2학년 2반' },
];

export const DEMO_STUDENTS = [
  { key: 'student-kang-minji', name: '강민지', classroom: '2학년 1반' },
  { key: 'student-kim-hajun', name: '김하준', classroom: '2학년 1반' },
  { key: 'student-park-seoah', name: '박서아', classroom: '2학년 1반' },
  { key: 'student-lee-dohyun', name: '이도현', classroom: '2학년 1반' },
  { key: 'student-jung-yuna', name: '정유나', classroom: '2학년 1반' },
  { key: 'student-choi-seungmin', name: '최승민', classroom: '2학년 2반' },
  { key: 'student-han-jiwoo', name: '한지우', classroom: '2학년 2반' },
  { key: 'student-oh-junseo', name: '오준서', classroom: '2학년 2반' },
  { key: 'student-yoon-seoyeon', name: '윤서연', classroom: '2학년 2반' },
  { key: 'student-lim-minjae', name: '임민재', classroom: '2학년 2반' },
];

export const DEMO_LESSONS = [
  {
    key: 'lesson-factorization',
    teacherKey: 'teacher-kim-minsu',
    title: '2학년 1반 인수분해 핵심 정리',
    topic: '인수분해',
    subject: 'math',
    createdAt: '2026-04-10T08:50:00+09:00',
    materials: [
      {
        fileName: '2학년1반_인수분해_핵심정리.pdf',
        kind: 'pdf',
        extractedText: `인수분해는 다항식을 곱의 꼴로 바꾸는 과정이다.
핵심은 공통인수 묶기와 두 수의 곱, 두 수의 합을 함께 보는 것이다.
x^2+5x+6처럼 최고차항의 계수가 1인 식은 곱이 6, 합이 5가 되는 두 수를 찾는다.
따라서 x^2+5x+6=(x+2)(x+3)이다.
부호를 결정할 때는 두 수의 곱과 합을 동시에 확인해야 한다.`,
      },
    ],
    summaries: [
      {
        concept_name: '두 수의 곱과 합 조건',
        frequency: 4,
        summary_text: '학생들이 곱은 맞추지만 합의 부호를 자주 놓칩니다. 두 조건을 동시에 확인하는 연습이 필요합니다.',
      },
      {
        concept_name: '부호 판단',
        frequency: 3,
        summary_text: '상수항이 양수일 때 두 수의 부호를 빠르게 단정하는 경향이 있습니다. 합의 부호와 함께 다시 점검하게 해야 합니다.',
      },
    ],
    sessions: [
      {
        key: 'factorization-session-1',
        studentKey: 'student-kang-minji',
        currentMode: 'grill-me',
        currentStep: 4,
        consecutiveWrong: 0,
        startedAt: '2026-04-10T09:05:00+09:00',
        endedAt: '2026-04-10T09:18:00+09:00',
        quizQuestion: 'x^2+7x+12를 인수분해할 때 곱과 합이 각각 무엇인지 설명해 보세요.',
        quizAnswer: '곱이 12이고 합이 7인 두 수를 찾으면 돼요. 그래서 3과 4를 써서 (x+3)(x+4)예요.',
        quizPassed: true,
        summaryText: '인수분해에서 두 수의 곱과 합을 동시에 보는 기준을 이해했습니다. 부호를 확인할 때는 합의 부호를 한 번 더 점검하면 좋겠습니다.',
        nextRecommendation: '부호가 다른 경우의 인수분해 문제를 한 번 더 풀어보세요.',
        summaryConcepts: ['인수분해', '두 수의 곱과 합', '부호 판단'],
        interactions: [
          {
            askedAt: '2026-04-10T09:06:00+09:00',
            questionText: 'x^2+5x+6은 왜 (x+2)(x+3)이 되는지 잘 모르겠어요.',
            intentType: 'concept',
            responseType: 'hint',
            responseText: '곱해서 6이 되고 더해서 5가 되는 두 수를 먼저 떠올려볼까요? 그 두 수를 찾으면 괄호 안 숫자가 자연스럽게 정리돼요.',
            groundedFlag: true,
            misconceptionType: 1,
          },
          {
            askedAt: '2026-04-10T09:10:00+09:00',
            questionText: '그럼 x^2+7x+12도 같은 방식으로 보면 되나요?',
            intentType: 'hint',
            responseType: 'hint',
            responseText: '맞아요. 이번에는 곱이 12이고 합이 7인 두 수를 먼저 찾고, 그 두 수가 괄호 안에 어떻게 들어가는지 설명해볼래요?',
            groundedFlag: true,
            misconceptionType: null,
          },
        ],
      },
      {
        key: 'factorization-session-2',
        studentKey: 'student-kim-hajun',
        currentMode: 'quick-me',
        currentStep: 4,
        consecutiveWrong: 0,
        startedAt: '2026-04-10T09:24:00+09:00',
        endedAt: '2026-04-10T09:31:00+09:00',
        quizQuestion: 'x^2-5x+6을 인수분해하고, 두 수의 합이 왜 -5인지 말해 보세요.',
        quizAnswer: '(-2)랑 (-3)을 써서 (x-2)(x-3)이고, 둘을 더하면 -5예요.',
        quizPassed: true,
        summaryText: '긴급 모드에서 바로 풀이를 보며 부호가 모두 음수일 때의 인수분해를 정리했습니다.',
        nextRecommendation: '부호가 다른 경우와 모두 음수인 경우를 비교해 보세요.',
        summaryConcepts: ['인수분해', '빠른 풀이', '부호 비교'],
        interactions: [
          {
            askedAt: '2026-04-10T09:25:00+09:00',
            questionText: '답만 줘, x^2-5x+6 바로 풀어줘.',
            intentType: 'hint',
            responseType: 'explanation',
            responseText: '바로 풀어볼게요. 곱해서 6이 되고 더해서 -5가 되는 두 수는 -2와 -3이에요. 그래서 x^2-5x+6=(x-2)(x-3)입니다. 최종 답은 (x-2)(x-3)예요.',
            groundedFlag: true,
            misconceptionType: 2,
          },
        ],
      },
    ],
  },
  {
    key: 'lesson-quadratic-equation',
    teacherKey: 'teacher-kim-minsu',
    title: '2학년 1반 이차방정식과 근의 공식',
    topic: '이차방정식',
    subject: 'math',
    createdAt: '2026-04-10T09:40:00+09:00',
    materials: [
      {
        fileName: '2학년1반_이차방정식_근의공식.pdf',
        kind: 'pdf',
        extractedText: `이차방정식 ax^2+bx+c=0의 해는 근의 공식을 통해 구할 수 있다.
근의 공식은 x={-b±루트(b^2-4ac)}/2a 이다.
판별식 b^2-4ac가 양수면 서로 다른 두 실근, 0이면 중근, 음수면 실근이 없다.
인수분해가 가능한 경우에는 인수분해로 먼저 접근할 수 있다.`,
      },
    ],
    summaries: [
      {
        concept_name: '판별식 해석',
        frequency: 5,
        summary_text: '판별식 값을 계산한 뒤 의미를 해석하지 못하는 학생이 많습니다. 값 계산과 해의 개수 연결이 필요합니다.',
      },
      {
        concept_name: '근의 공식 대입 순서',
        frequency: 3,
        summary_text: 'a, b, c를 대입할 때 부호를 함께 가져가지 못하는 경우가 반복됩니다.',
      },
    ],
    sessions: [
      {
        key: 'quadratic-session-1',
        studentKey: 'student-park-seoah',
        currentMode: 'grill-me',
        currentStep: 3,
        consecutiveWrong: 1,
        startedAt: '2026-04-10T09:55:00+09:00',
        endedAt: null,
        quizQuestion: null,
        quizAnswer: null,
        quizPassed: null,
        summaryText: null,
        nextRecommendation: null,
        summaryConcepts: null,
        interactions: [
          {
            askedAt: '2026-04-10T09:56:00+09:00',
            questionText: '판별식이 양수면 왜 해가 두 개인지 잘 모르겠어요.',
            intentType: 'concept',
            responseType: 'hint',
            responseText: '루트 안의 값이 양수라는 건 제곱근을 두 방향으로 생각할 수 있다는 뜻이에요. +와 -가 각각 어떤 다른 값을 만들지 먼저 떠올려볼까요?',
            groundedFlag: true,
            misconceptionType: 4,
          },
          {
            askedAt: '2026-04-10T10:01:00+09:00',
            questionText: '그럼 판별식이 0이면 +랑 -가 같은 값이 되는 건가요?',
            intentType: 'review',
            responseType: 'feedback',
            responseText: '좋은 방향이에요. 루트 0은 0 하나뿐이라서 +0과 -0이 같은 값이 됩니다. 그래서 해가 한 개처럼 보이는 중근이 되는 거예요.',
            groundedFlag: true,
            misconceptionType: null,
          },
        ],
      },
      {
        key: 'quadratic-session-2',
        studentKey: 'student-lee-dohyun',
        currentMode: 'quick-me',
        currentStep: 4,
        consecutiveWrong: 0,
        startedAt: '2026-04-10T10:08:00+09:00',
        endedAt: '2026-04-10T10:16:00+09:00',
        quizQuestion: 'x^2-4x+3=0의 해를 구할 때 판별식이 얼마인지 말해 보세요.',
        quizAnswer: 'b^2-4ac는 16-12라서 4예요.',
        quizPassed: true,
        summaryText: '근의 공식에 대입할 때 a, b, c의 부호를 정확히 읽는 연습을 했습니다.',
        nextRecommendation: '판별식이 0인 문제를 하나 더 풀어보세요.',
        summaryConcepts: ['이차방정식', '근의 공식', '판별식'],
        interactions: [
          {
            askedAt: '2026-04-10T10:09:00+09:00',
            questionText: '시간 없어, 근의 공식으로 바로 풀어줘.',
            intentType: 'hint',
            responseType: 'explanation',
            responseText: '바로 풀어볼게요. x^2-4x+3=0에서 a=1, b=-4, c=3이에요. 근의 공식에 넣으면 x={4±루트(16-12)}/2={4±2}/2가 됩니다. 따라서 x=3 또는 x=1이고, 최종 답은 1과 3이에요.',
            groundedFlag: true,
            misconceptionType: 2,
          },
        ],
      },
    ],
  },
  {
    key: 'lesson-linear-function',
    teacherKey: 'teacher-park-seoyeon',
    title: '2학년 2반 일차함수 그래프 읽기',
    topic: '일차함수',
    subject: 'math',
    createdAt: '2026-04-10T10:20:00+09:00',
    materials: [
      {
        fileName: '2학년2반_일차함수_그래프읽기.pdf',
        kind: 'pdf',
        extractedText: `일차함수 y=ax+b에서 a는 기울기, b는 y절편이다.
기울기는 x가 1 증가할 때 y가 얼마나 변하는지 나타낸다.
그래프가 오른쪽으로 갈수록 올라가면 기울기가 양수, 내려가면 음수이다.
y절편은 그래프가 y축과 만나는 점의 y값이다.`,
      },
    ],
    summaries: [
      {
        concept_name: '기울기 해석',
        frequency: 4,
        summary_text: '좌표 두 점을 보고 변화량 비율을 세로 변화만으로 판단하는 경향이 있습니다.',
      },
      {
        concept_name: 'y절편 읽기',
        frequency: 2,
        summary_text: 'x절편과 y절편을 혼동하는 질문이 반복됩니다.',
      },
    ],
    sessions: [
      {
        key: 'linear-session-1',
        studentKey: 'student-jung-yuna',
        currentMode: 'guide-me',
        currentStep: 2,
        consecutiveWrong: 0,
        startedAt: '2026-04-10T10:35:00+09:00',
        endedAt: null,
        quizQuestion: null,
        quizAnswer: null,
        quizPassed: null,
        summaryText: null,
        nextRecommendation: null,
        summaryConcepts: null,
        interactions: [
          {
            askedAt: '2026-04-10T10:36:00+09:00',
            questionText: '그래프가 올라가면 기울기가 무조건 1인가요?',
            intentType: 'concept',
            responseType: 'hint',
            responseText: '올라간다는 사실만으로는 기울기 크기를 알 수 없어요. x가 1 늘 때 y가 얼마나 변하는지 같이 봐야 해요. 두 점의 변화량을 같이 적어볼까요?',
            groundedFlag: true,
            misconceptionType: 4,
          },
          {
            askedAt: '2026-04-10T10:41:00+09:00',
            questionText: 'x가 2 늘 때 y가 4 늘면 기울기는 4인가요?',
            intentType: 'review',
            responseType: 'feedback',
            responseText: '설명해줄게요. 기울기는 세로 변화량을 가로 변화량으로 나눈 값이에요. 그래서 4를 그대로 쓰는 게 아니라 4를 2로 나눠서 2로 봐야 해요.',
            groundedFlag: true,
            misconceptionType: 3,
          },
        ],
      },
      {
        key: 'linear-session-2',
        studentKey: 'student-choi-seungmin',
        currentMode: 'grill-me',
        currentStep: 4,
        consecutiveWrong: 0,
        startedAt: '2026-04-10T10:48:00+09:00',
        endedAt: '2026-04-10T10:58:00+09:00',
        quizQuestion: 'y=2x+3 그래프의 y절편이 왜 3인지 설명해 보세요.',
        quizAnswer: 'x가 0일 때 y가 3이라서 y축과 만나는 점이 3이에요.',
        quizPassed: true,
        summaryText: '기울기와 y절편의 의미를 분리해서 읽는 법을 정리했습니다.',
        nextRecommendation: '기울기가 음수인 그래프도 같은 방식으로 읽어보세요.',
        summaryConcepts: ['일차함수', '기울기', 'y절편'],
        interactions: [
          {
            askedAt: '2026-04-10T10:49:00+09:00',
            questionText: 'y절편은 x절편이랑 어떻게 다른가요?',
            intentType: 'concept',
            responseType: 'hint',
            responseText: 'y절편은 y축과 만나는 점이고, x절편은 x축과 만나는 점이에요. 그러면 y축 위에 있는 점은 x값이 항상 얼마인지 먼저 떠올려볼까요?',
            groundedFlag: true,
            misconceptionType: 1,
          },
        ],
      },
    ],
  },
  {
    key: 'lesson-simultaneous-equation',
    teacherKey: 'teacher-park-seoyeon',
    title: '2학년 2반 연립방정식 활용문제',
    topic: '연립방정식',
    subject: 'math',
    createdAt: '2026-04-10T11:05:00+09:00',
    materials: [
      {
        fileName: '2학년2반_연립방정식_활용문제.pdf',
        kind: 'pdf',
        extractedText: `연립방정식은 두 미지수의 관계를 동시에 만족하는 값을 찾는 과정이다.
문장제는 미지수를 먼저 정하고 식 두 개를 세우는 것이 핵심이다.
가감법은 계수를 맞춰 한 문자를 없애고, 대입법은 한 식을 다른 식에 넣는다.
활용문제에서는 무엇을 x, y로 둘지 먼저 문장으로 적으면 실수가 줄어든다.`,
      },
      {
        fileName: '연립방정식_문장제_해석메모.md',
        kind: 'markdown',
        extractedText: `문장제에서는 '무엇을 x로 둘지' 먼저 적는다.
한 변수는 개수, 다른 변수는 가격 또는 길이로 두는 경우가 많다.
식 두 개를 세운 뒤에는 단위를 확인한다.`,
      },
    ],
    summaries: [
      {
        concept_name: '미지수 설정',
        frequency: 4,
        summary_text: '문장제를 식으로 옮기기 전에 미지수 정의를 건너뛰는 학생이 많습니다.',
      },
      {
        concept_name: '가감법 계수 맞추기',
        frequency: 3,
        summary_text: '한 문자를 없애기 위해 어느 식에 몇 배를 해야 하는지 헷갈려합니다.',
      },
    ],
    sessions: [
      {
        key: 'simultaneous-session-1',
        studentKey: 'student-han-jiwoo',
        currentMode: 'grill-me',
        currentStep: 3,
        consecutiveWrong: 2,
        startedAt: '2026-04-10T11:18:00+09:00',
        endedAt: null,
        quizQuestion: null,
        quizAnswer: null,
        quizPassed: null,
        summaryText: null,
        nextRecommendation: null,
        summaryConcepts: null,
        interactions: [
          {
            askedAt: '2026-04-10T11:19:00+09:00',
            questionText: '문장제에서 x랑 y를 뭘로 둬야 할지 모르겠어요.',
            intentType: 'hint',
            responseType: 'hint',
            responseText: '문제에서 변하는 두 대상을 먼저 찾아볼까요? 개수와 가격처럼 서로 다른 의미를 가진 두 값을 x, y로 두면 식이 더 잘 보여요.',
            groundedFlag: true,
            misconceptionType: 3,
          },
          {
            askedAt: '2026-04-10T11:24:00+09:00',
            questionText: '가감법에서 왜 한 식에 2를 곱하는지 모르겠어요.',
            intentType: 'concept',
            responseType: 'hint',
            responseText: '없애고 싶은 문자의 계수를 서로 반대수로 만드는 게 목표예요. 지금 없애고 싶은 문자가 무엇인지 먼저 정해볼래요?',
            groundedFlag: true,
            misconceptionType: 1,
          },
        ],
      },
      {
        key: 'simultaneous-session-2',
        studentKey: 'student-oh-junseo',
        currentMode: 'quick-me',
        currentStep: 4,
        consecutiveWrong: 0,
        startedAt: '2026-04-10T11:31:00+09:00',
        endedAt: '2026-04-10T11:38:00+09:00',
        quizQuestion: '사과 개수와 배 개수를 x, y로 두는 이유를 한 문장으로 설명해 보세요.',
        quizAnswer: '문제에서 구하려는 두 값을 분리해서 식 두 개를 세우기 쉬워져요.',
        quizPassed: true,
        summaryText: '문장제를 빠르게 식으로 옮기는 틀을 익혔고, 가감법의 목적을 정리했습니다.',
        nextRecommendation: '대입법으로 푸는 문제도 같은 방식으로 미지수를 먼저 정리해 보세요.',
        summaryConcepts: ['연립방정식', '문장제', '가감법'],
        interactions: [
          {
            askedAt: '2026-04-10T11:32:00+09:00',
            questionText: '바로 풀어줘. 연립방정식 문장제에서 식 세우는 순서만 알려줘.',
            intentType: 'hint',
            responseType: 'explanation',
            responseText: '바로 풀어볼게요. 먼저 구하려는 두 값을 x와 y로 정합니다. 다음으로 문장 속 조건 두 개를 각각 식으로 바꿉니다. 그 뒤 가감법이나 대입법으로 한 문자를 없애고 값을 구하면 돼요. 최종 답은 “미지수 정의 → 식 두 개 세우기 → 한 문자 없애기 → 값 대입해 나머지 구하기” 순서예요.',
            groundedFlag: true,
            misconceptionType: null,
          },
        ],
      },
    ],
  },
  {
    key: 'lesson-similarity',
    teacherKey: 'teacher-kim-minsu',
    title: '2학년 1반 도형의 닮음과 비례식',
    topic: '도형의 닮음',
    subject: 'math',
    createdAt: '2026-04-10T11:45:00+09:00',
    materials: [
      {
        fileName: '2학년1반_도형의닮음_핵심정리.pdf',
        kind: 'pdf',
        extractedText: `도형의 닮음은 대응하는 각의 크기가 같고, 대응하는 변의 길이의 비가 일정한 관계이다.
닮음비가 k이면 넓이비는 k^2, 부피비는 k^3이다.
문제를 풀 때는 대응하는 점과 변을 먼저 표시해야 비례식을 정확히 세울 수 있다.
대응 순서를 바꾸면 비례식이 틀어질 수 있다.`,
      },
    ],
    summaries: [
      {
        concept_name: '대응변 찾기',
        frequency: 4,
        summary_text: '닮은 도형에서 대응 순서를 바꿔 비례식을 잘못 세우는 경우가 많습니다.',
      },
      {
        concept_name: '닮음비와 넓이비 구분',
        frequency: 2,
        summary_text: '길이비와 넓이비를 같은 값으로 쓰는 실수가 반복됩니다.',
      },
    ],
    sessions: [
      {
        key: 'similarity-session-1',
        studentKey: 'student-yoon-seoyeon',
        currentMode: 'grill-me',
        currentStep: 4,
        consecutiveWrong: 0,
        startedAt: '2026-04-10T11:58:00+09:00',
        endedAt: '2026-04-10T12:08:00+09:00',
        quizQuestion: '닮음비가 2일 때 넓이비가 왜 4인지 설명해 보세요.',
        quizAnswer: '길이가 두 배면 가로와 세로가 각각 두 배라서 넓이는 2x2로 네 배가 돼요.',
        quizPassed: true,
        summaryText: '대응변을 먼저 찾고 비례식을 세우는 순서를 이해했습니다. 넓이비는 닮음비의 제곱이라는 점도 정리했습니다.',
        nextRecommendation: '닮음비와 부피비를 연결하는 문제를 한 번 더 풀어보세요.',
        summaryConcepts: ['도형의 닮음', '대응변', '넓이비'],
        interactions: [
          {
            askedAt: '2026-04-10T11:59:00+09:00',
            questionText: '닮은 도형에서 어떤 변끼리 대응하는지 자꾸 헷갈려요.',
            intentType: 'concept',
            responseType: 'hint',
            responseText: '도형의 이름을 같은 방향으로 읽으면서 점 순서를 먼저 맞춰볼까요? 그러면 어떤 변이 서로 대응하는지 더 안정적으로 찾을 수 있어요.',
            groundedFlag: true,
            misconceptionType: 1,
          },
        ],
      },
      {
        key: 'similarity-session-2',
        studentKey: 'student-lim-minjae',
        currentMode: 'grill-me',
        currentStep: 2,
        consecutiveWrong: 1,
        startedAt: '2026-04-10T12:12:00+09:00',
        endedAt: null,
        quizQuestion: null,
        quizAnswer: null,
        quizPassed: null,
        summaryText: null,
        nextRecommendation: null,
        summaryConcepts: null,
        interactions: [
          {
            askedAt: '2026-04-10T12:13:00+09:00',
            questionText: '사진으로 올린 문제에서 대응변이 어디인지 모르겠어요.',
            intentType: 'review',
            responseType: 'feedback',
            responseText: '도형의 꼭짓점 순서를 먼저 같은 방향으로 적어보면 대응변을 찾기 쉬워요. 가장 긴 변끼리 바로 잇기보다, 대응하는 각을 먼저 보고 변을 연결해 볼까요?',
            groundedFlag: true,
            misconceptionType: 4,
            imageAsset: 'notebook-photo',
          },
        ],
      },
    ],
  },
];
