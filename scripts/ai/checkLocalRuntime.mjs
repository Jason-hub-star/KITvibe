/**
 * @file scripts/ai/checkLocalRuntime.mjs
 * @description 로컬 LLM 런타임 및 task별 provider 설정 점검
 * @domain ai
 * @access server-only
 */

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
const TASKS = [
  'intent',
  'tutor',
  'teacher-summary',
  'mini-quiz',
  'quiz-grade',
  'session-summary',
];

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

function toEnvKey(task) {
  return task.toUpperCase().replace(/-/g, '_');
}

function resolveTaskConfig(env, task) {
  const taskKey = toEnvKey(task);
  const provider = (env[`AI_${taskKey}_PROVIDER`] ?? env.AI_PROVIDER ?? 'openai').toLowerCase();
  const model = provider === 'ollama'
    ? env[`AI_${taskKey}_OLLAMA_MODEL`] ?? env.AI_OLLAMA_MODEL ?? 'gemma4-unsloth-e4b:latest'
    : env[`AI_${taskKey}_OPENAI_MODEL`] ?? env.AI_OPENAI_MODEL ?? 'gpt-4o-mini';

  return { task, provider, model };
}

async function fetchOllamaModels(baseUrl) {
  const response = await fetch(`${baseUrl}/api/tags`);
  if (!response.ok) {
    throw new Error(`Ollama tags 조회 실패: ${response.status}`);
  }

  const json = await response.json();
  return (json.models ?? []).map((model) => ({
    name: model.name,
    size: model.size,
    modified_at: model.modified_at,
  }));
}

async function main() {
  const env = {
    ...loadEnv(),
    ...process.env,
  };
  const ollamaBaseUrl = (env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL).replace(/\/v1$/, '');
  const taskConfigs = TASKS.map((task) => resolveTaskConfig(env, task));

  let localModels = [];
  let localRuntimeOk = false;
  let localRuntimeError = null;

  try {
    localModels = await fetchOllamaModels(ollamaBaseUrl);
    localRuntimeOk = true;
  } catch (error) {
    localRuntimeError = error instanceof Error ? error.message : 'unknown';
  }

  console.log(JSON.stringify({
    ollamaBaseUrl,
    localRuntimeOk,
    localRuntimeError,
    localModels,
    tasks: taskConfigs,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
