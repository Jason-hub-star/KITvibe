/**
 * @file lib/ai/provider.ts
 * @description AI provider/model 선택 중앙화
 *   - 기본값은 OpenAI 유지
 *   - task별로 Ollama(OpenAI-compatible) 전환 가능
 * @domain ai
 * @access server-only
 */

import 'server-only';

import { createOpenAI, openai } from '@ai-sdk/openai';

export type AiTask =
  | 'intent'
  | 'tutor'
  | 'teacher-summary'
  | 'mini-quiz'
  | 'quiz-grade'
  | 'session-summary';

type AiProviderName = 'openai' | 'ollama';

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_OLLAMA_MODEL = 'gemma4-unsloth-e4b:latest';
const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434/v1';

const OLLAMA_PROVIDER = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL,
  apiKey: process.env.OLLAMA_API_KEY ?? 'ollama',
});

function normalizeProvider(value: string | undefined): AiProviderName {
  return value?.toLowerCase() === 'ollama' ? 'ollama' : 'openai';
}

function toEnvKey(task: AiTask): string {
  return task.toUpperCase().replace(/-/g, '_');
}

function getProviderName(task: AiTask): AiProviderName {
  const taskKey = toEnvKey(task);
  return normalizeProvider(
    process.env[`AI_${taskKey}_PROVIDER`] ??
    process.env.AI_PROVIDER,
  );
}

function getModelName(task: AiTask, providerName: AiProviderName): string {
  const taskKey = toEnvKey(task);

  if (providerName === 'ollama') {
    return process.env[`AI_${taskKey}_OLLAMA_MODEL`] ??
      process.env.AI_OLLAMA_MODEL ??
      DEFAULT_OLLAMA_MODEL;
  }

  return process.env[`AI_${taskKey}_OPENAI_MODEL`] ??
    process.env.AI_OPENAI_MODEL ??
    DEFAULT_OPENAI_MODEL;
}

export function getAiModel(task: AiTask) {
  const providerName = getProviderName(task);
  const modelName = getModelName(task, providerName);

  if (providerName === 'ollama') {
    return OLLAMA_PROVIDER(modelName);
  }

  return openai(modelName);
}

export function getAiRuntimeConfig(task: AiTask): {
  task: AiTask;
  provider: AiProviderName;
  model: string;
  baseUrl?: string;
} {
  const provider = getProviderName(task);
  const model = getModelName(task, provider);

  return {
    task,
    provider,
    model,
    baseUrl: provider === 'ollama'
      ? process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL
      : undefined,
  };
}
