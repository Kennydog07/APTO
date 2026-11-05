/**
 * Google Gemini client (plain fetch to the REST API, no SDK).
 * Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional, default gemini-3.5-flash-lite),
 * read as AI_TOOLS_<NAME> first, then <NAME> – the same names the main apto-pro.com functions use
 * (functions/lib/gemini.js).
 */
import { geminiModel, readEnv } from './env.ts';
import { recordSpend } from './spend.ts';
import {
  OutputParseError,
  type AiPart,
  type PromptModule,
  type RegenContext,
} from '../../prompts/types.ts';

const API = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_RETRIES = 2;

export const geminiConfigured = () => Boolean(readEnv('GEMINI_API_KEY'));

export interface AiUsage {
  tokensIn: number;
  tokensOut: number;
  costGbp: number;
}

/** Not enough time left before the caller's deadline. */
export class DeadlineError extends Error {
  constructor() {
    super('Deadline reached');
    this.name = 'DeadlineError';
  }
}

export class AiRefusalError extends Error {
  constructor() {
    super('The model declined this request');
    this.name = 'AiRefusalError';
  }
}

export class GeminiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

const REFUSAL_REASONS = new Set([
  'SAFETY',
  'PROHIBITED_CONTENT',
  'BLOCKLIST',
  'SPII',
  'RECITATION',
  'IMAGE_SAFETY',
]);

function toGeminiParts(user: string | AiPart[]) {
  if (typeof user === 'string') return [{ text: user }];
  return user.map((p) =>
    p.type === 'text'
      ? { text: p.text }
      : { inline_data: { mime_type: p.mediaType, data: p.data } },
  );
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
  modelVersion?: string;
  error?: { message?: string };
}

async function postOnce(model: string, body: unknown, timeoutMs: number): Promise<GeminiResponse> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': readEnv('GEMINI_API_KEY') ?? '',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new GeminiError(
      (e as Error)?.name === 'AbortError' ? 'Gemini request timed out' : 'Gemini request failed',
    );
  } finally {
    clearTimeout(timer);
  }
  const data = (await res.json().catch(() => null)) as GeminiResponse | null;
  if (!res.ok)
    throw new GeminiError(
      `Gemini ${res.status}: ${(data?.error?.message ?? '').slice(0, 200)}`,
      res.status,
    );
  return data ?? {};
}

const retryable = (e: unknown) =>
  e instanceof GeminiError && (e.status === 0 || e.status === 429 || e.status >= 500);

/**
 * One generateContent call in JSON mode. Retries 429/5xx/network errors itself (like the old SDK
 * did). Records token spend in daily_spend whatever the outcome. Thinking tokens are billed as
 * output, so they are counted in tokensOut.
 */
export async function callModel(opts: {
  system: string;
  user: string | AiPart[];
  maxTokens: number;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
}): Promise<{ text: string; usage: AiUsage; stopReason: string | null }> {
  if (!geminiConfigured())
    throw new Error(
      'Missing required environment variable AI_TOOLS_GEMINI_API_KEY (or GEMINI_API_KEY)',
    );
  const model = opts.model ?? geminiModel();
  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: 'user', parts: toGeminiParts(opts.user) }],
    generationConfig: { maxOutputTokens: opts.maxTokens, responseMimeType: 'application/json' },
  };
  const deadline = Date.now() + (opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const retries = opts.maxRetries ?? DEFAULT_RETRIES;
  let data: GeminiResponse | undefined;
  for (let attempt = 0; ; attempt++) {
    try {
      data = await postOnce(model, body, Math.max(1000, deadline - Date.now()));
      break;
    } catch (e) {
      if (attempt >= retries || !retryable(e) || deadline - Date.now() < 3000) throw e;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }

  const u = data.usageMetadata ?? {};
  const tokensIn = u.promptTokenCount ?? 0;
  const tokensOut = (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0);
  const costGbp = await recordSpend(model, tokensIn, tokensOut);
  const usage = { tokensIn, tokensOut, costGbp };

  const cand = data.candidates?.[0];
  const stopReason = cand?.finishReason ?? data.promptFeedback?.blockReason ?? null;
  if (data.promptFeedback?.blockReason || (stopReason && REFUSAL_REASONS.has(stopReason)))
    throw new AiRefusalError();

  const text = (cand?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? '')
    .join('');
  return { text, usage, stopReason };
}

/**
 * Run a tool's prompt module and return validated JSON output.
 * On a JSON parse/validation failure, retries ONCE (as per spec) before giving up.
 */
export async function generateStructured<TIn, TOut>(
  module: PromptModule<TIn, TOut>,
  inputs: TIn,
  regen?: RegenContext<TOut>,
  /** Absolute time (ms since epoch) by which we must be finished. No HTTP retries when set. */
  deadline?: number,
): Promise<{ output: TOut; usage: AiUsage }> {
  const total: AiUsage = { tokensIn: 0, tokensOut: 0, costGbp: 0 };
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const timeLeft = deadline === undefined ? undefined : deadline - Date.now();
    if (timeLeft !== undefined && timeLeft < 1500) throw new DeadlineError();
    const { text, usage } = await callModel({
      system: module.buildSystemPrompt(),
      user: module.buildUserPrompt(inputs, regen),
      maxTokens: module.max_tokens,
      ...(module.model ? { model: module.model } : {}),
      ...(timeLeft !== undefined ? { timeoutMs: timeLeft, maxRetries: 0 } : {}),
    });
    total.tokensIn += usage.tokensIn;
    total.tokensOut += usage.tokensOut;
    total.costGbp += usage.costGbp;
    try {
      return { output: module.parseOutput(text, inputs), usage: total };
    } catch (e) {
      if (!(e instanceof OutputParseError)) throw e;
      console.warn(`model output failed to parse (attempt ${attempt + 1})`, e.message);
      lastError = e;
    }
  }
  throw lastError;
}
