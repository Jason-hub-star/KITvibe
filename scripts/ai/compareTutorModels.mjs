/**
 * @file scripts/ai/compareTutorModels.mjs
 * @description OpenAI와 로컬 Ollama 튜터 응답 품질 비교
 *   - Quick-Me 즉답 / Grill-Me 질문 유지 중심 스모크 테스트
 *   - 출력 형식, 태그, 질문 누수 여부를 함께 요약
 * @domain ai
 * @access server-only
 */

import fs from 'node:fs';
import path from 'node:path';
import { generateText } from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const result = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    result[key] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
  }

  return result;
}

const fileEnv = loadEnv();
for (const [key, value] of Object.entries(fileEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const env = {
  ...fileEnv,
  ...process.env,
};

const openaiModelName = env.AI_OPENAI_MODEL ?? 'gpt-4o-mini';
const ollamaModelName = env.AI_TUTOR_OLLAMA_MODEL ?? env.AI_OLLAMA_MODEL ?? 'gemma4-unsloth-e4b:latest';
const ollamaBaseUrl = env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434/v1';

const ollama = createOpenAI({
  baseURL: ollamaBaseUrl,
  apiKey: env.OLLAMA_API_KEY ?? 'ollama',
});

const selectedCaseIds = (env.COMPARE_CASE_IDS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const selectedProviders = (env.COMPARE_PROVIDERS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const maxOutputTokens = Number(env.COMPARE_MAX_OUTPUT_TOKENS ?? '320');
const compareTimeoutMs = Number(env.COMPARE_TIMEOUT_MS ?? '45000');

const TEST_CASES = [
  {
    id: 'quick-me-direct',
    mode: 'quick-me',
    system: `당신은 "인수분해" 수업의 AI 튜터입니다.
수식은 KaTeX 형식($...$)으로 작성하세요. 한국어 존댓말(~해요 체)로 답하세요.

- 질문하지 마세요. 풀이를 바로 보여주세요.
- 되묻지 마세요. 확인 질문을 하지 마세요.
- 학생이 "답만", "빨리", "시간 없어", "바로 풀어줘"처럼 긴급 표현을 쓰면 즉시 해결 중심으로 응답하세요.
- "바로 풀어볼게요."로 시작하세요.
- 최종 답을 명확하게 제시하세요.
- 본문은 반드시 아래 4개 라벨 순서만 따르세요.
핵심 개념:
...

풀이:
...

최종 답:
...

실수 포인트:
...

- 응답 맨 끝에는 [RECOMMENDATION], [ANSWER_CHECK], [GROUNDED] 태그를 반드시 붙이세요.

[수업 자료]
인수분해는 곱해서 a, 더해서 b가 되는 두 수를 찾는 과정입니다.`,
    prompt: '답만 줘, x^2-5x+6 바로 풀어줘',
  },
  {
    id: 'quick-me-urgent',
    mode: 'quick-me',
    system: `당신은 "이차방정식" 수업의 AI 튜터입니다.
수식은 KaTeX 형식($...$)으로 작성하세요. 한국어 존댓말(~해요 체)로 답하세요.

- 질문하지 마세요. 풀이를 바로 보여주세요.
- "바로 풀어볼게요."로 시작하세요.
- 본문은 반드시 아래 4개 라벨 순서만 따르세요.
핵심 개념:
...

풀이:
...

최종 답:
...

실수 포인트:
...

- 응답 맨 끝에는 [RECOMMENDATION], [ANSWER_CHECK], [GROUNDED] 태그를 반드시 붙이세요.

[수업 자료]
근의 공식은 x = (-b ± sqrt(b^2-4ac)) / 2a 입니다.`,
    prompt: '시간 없어, x^2-5x+6=0 근의 공식으로 바로 풀어줘',
  },
  {
    id: 'grill-me-question',
    mode: 'grill-me',
    system: `당신은 "인수분해" 수업의 AI 튜터입니다.
수식은 KaTeX 형식($...$)으로 작성하세요. 한국어 존댓말(~해요 체)로 답하세요.

- 절대 답을 알려주지 마세요. 반드시 질문만 던지세요.
- 학생이 스스로 생각하도록 유도하는 질문 1개를 하세요.
- 본문은 반드시 아래 2개 라벨 순서만 따르세요.
질문:
...

생각 포인트:
...

- 응답 맨 끝에는 [RECOMMENDATION], [ANSWER_CHECK], [GROUNDED] 태그를 반드시 붙이세요.

[수업 자료]
인수분해는 곱해서 a, 더해서 b가 되는 두 수를 찾는 과정입니다.`,
    prompt: 'x^2+5x+6은 왜 (x+2)(x+3)인지 모르겠어요',
  },
  {
    id: 'grill-me-vague',
    mode: 'grill-me',
    system: `당신은 "연립방정식" 수업의 AI 튜터입니다.
수식은 KaTeX 형식($...$)으로 작성하세요. 한국어 존댓말(~해요 체)로 답하세요.

- 절대 답을 알려주지 마세요. 반드시 질문만 던지세요.
- 학생이 막연하게 "모르겠어요"라고 하면, 수업 자료의 구체적 개념을 언급하며 질문하세요.
- 본문은 반드시 아래 2개 라벨 순서만 따르세요.
질문:
...

생각 포인트:
...

- 응답 맨 끝에는 [RECOMMENDATION], [ANSWER_CHECK], [GROUNDED] 태그를 반드시 붙이세요.

[수업 자료]
연립방정식은 두 식을 동시에 만족하는 값을 찾는 과정이며, 소거법과 대입법을 사용할 수 있습니다.`,
    prompt: '모르겠어요. 연립방정식 시작을 어떻게 해야 할지 모르겠어요',
  },
];

function hasAllTags(text) {
  return ['[RECOMMENDATION]', '[ANSWER_CHECK:', '[GROUNDED:'].every((tag) => text.includes(tag));
}

function countMissingLabels(text, labels) {
  return labels.filter((label) => !text.includes(label));
}

function analyzeCase(mode, text) {
  const common = {
    hasAllTags: hasAllTags(text),
    tagCount: (text.match(/\[(RECOMMENDATION|ANSWER_CHECK|GROUNDED)/g) ?? []).length,
  };

  if (mode === 'quick-me') {
    const missingLabels = countMissingLabels(text, ['핵심 개념:', '풀이:', '최종 답:', '실수 포인트:']);
    const asksBack = /질문:|어떻게 생각|무엇일까요|볼까요\?|해볼까요\?/u.test(text);

    return {
      ...common,
      missingLabels,
      asksBack,
      hasDirectAnswer: text.includes('최종 답:'),
    };
  }

  const missingLabels = countMissingLabels(text, ['질문:', '생각 포인트:']);
  const leaksDirectAnswer = /최종 답:|\(x[+-]\d\)\(x[+-]\d\)|정답은/u.test(text);
  const hasQuestionTone = /\?|까요/u.test(text);

  return {
    ...common,
    missingLabels,
    leaksDirectAnswer,
    hasQuestionTone,
  };
}

async function runCase(providerName, model, testCase) {
  if (providerName === 'ollama') {
    return runOllamaCase(testCase);
  }

  const startedAt = Date.now();
  const { text } = await generateText({
    model,
    system: testCase.system,
    prompt: testCase.prompt,
    temperature: 0,
    maxOutputTokens,
  });

  return {
    provider: providerName,
    durationMs: Date.now() - startedAt,
    text,
    analysis: analyzeCase(testCase.mode, text),
  };
}

async function runOllamaCase(testCase) {
  const startedAt = Date.now();
  const prompt = [
    testCase.system,
    '',
    `학생 질문: ${testCase.prompt}`,
  ].join('\n');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), compareTimeoutMs);

  try {
    const response = await fetch(ollamaBaseUrl.replace(/\/v1$/, '/api/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModelName,
        stream: false,
        prompt,
        options: {
          temperature: 0,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama generate 실패: ${response.status}`);
    }

    const json = await response.json();
    const text = json.response ?? '';

    return {
      provider: 'ollama',
      durationMs: Date.now() - startedAt,
      text,
      analysis: analyzeCase(testCase.mode, text),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Ollama timeout after ${compareTimeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  const allModels = [
    {
      provider: 'openai',
      modelName: openaiModelName,
      model: openai(openaiModelName),
    },
    {
      provider: 'ollama',
      modelName: ollamaModelName,
      model: ollama(ollamaModelName),
    },
  ];
  const models = selectedProviders.length > 0
    ? allModels.filter((candidate) => selectedProviders.includes(candidate.provider))
    : allModels;
  const testCases = selectedCaseIds.length > 0
    ? TEST_CASES.filter((testCase) => selectedCaseIds.includes(testCase.id))
    : TEST_CASES;

  const results = [];

  for (const testCase of testCases) {
    const caseResult = {
      id: testCase.id,
      mode: testCase.mode,
      prompt: testCase.prompt,
      outputs: [],
    };

    for (const candidate of models) {
      try {
        const output = await runCase(candidate.provider, candidate.model, testCase);
        caseResult.outputs.push({
          provider: candidate.provider,
          model: candidate.modelName,
          ...output,
        });
      } catch (error) {
        caseResult.outputs.push({
          provider: candidate.provider,
          model: candidate.modelName,
          error: error instanceof Error ? error.message : 'unknown',
        });
      }
    }

    results.push(caseResult);
  }

  console.log(JSON.stringify({
    comparedAt: new Date().toISOString(),
    ollamaBaseUrl,
    cases: results,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
