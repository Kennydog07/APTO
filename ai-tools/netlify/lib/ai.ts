import Anthropic from '@anthropic-ai/sdk';
import { anthropicModel, env } from './env.ts';
import { recordSpend } from './spend.ts';
import { OutputParseError, type PromptModule, type RegenContext } from '../../prompts/types.ts';

let client: Anthropic | undefined;
function anthropic(): Anthropic {
  // maxRetries: the SDK retries 429/5xx/connection errors itself before we see them.
  client ??= new Anthropic({ apiKey: env('ANTHROPIC_API_KEY'), maxRetries: 2, timeout: 120_000 });
  return client;
}

export interface AiUsage {
  tokensIn: number;
  tokensOut: number;
  costGbp: number;
}

export class AiRefusalError extends Error {
  constructor() {
    super('The model declined this request');
    this.name = 'AiRefusalError';
  }
}

/**
 * One Messages API call. Records token spend in daily_spend whatever the outcome.
 *
 * Model-specific settings:
 *  - claude-sonnet-5-5: thinking switched off ("between_tools", no tools are used) so the whole
 *    max_tokens budget goes to the answer; server-side refusal fallback enabled.
 *  - other models: low effort keeps any thinking short.
 */
export async function callClaude(opts: {
  system: string;
  user: string | Anthropic.ContentBlockParam[];
  maxTokens: number;
  model?: string;
}): Promise<{ text: string; usage: AiUsage; stopReason: string | null }> {
  const model = opts.model ?? anthropicModel();
  const isSonnet55 = model === 'claude-sonnet-5-5';

  const response = await anthropic().beta.messages.create({
    model,
    max_tokens: opts.maxTokens,
    system: opts.system,
    messages: [
      { role: 'user', content: opts.user as Anthropic.Beta.BetaContentBlockParam[] | string },
    ],
    ...(isSonnet55
      ? {
          thinking: { type: 'between_tools' as const },
          output_config: { effort: 'medium' as const },
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default' as const,
        }
      : { output_config: { effort: 'low' as const } }),
  });

  const tokensIn = response.usage.input_tokens ?? 0;
  const tokensOut = response.usage.output_tokens ?? 0;
  const costGbp = await recordSpend(response.model || model, tokensIn, tokensOut);
  const usage = { tokensIn, tokensOut, costGbp };

  if (response.stop_reason === 'refusal') throw new AiRefusalError();

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return { text, usage, stopReason: response.stop_reason };
}

/**
 * Run a tool's prompt module and return validated JSON output.
 * On a JSON parse/validation failure, retries ONCE (as per spec) before giving up.
 */
export async function generateStructured<TIn, TOut>(
  module: PromptModule<TIn, TOut>,
  inputs: TIn,
  regen?: RegenContext<TOut>,
): Promise<{ output: TOut; usage: AiUsage }> {
  const total: AiUsage = { tokensIn: 0, tokensOut: 0, costGbp: 0 };
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { text, usage } = await callClaude({
      system: module.buildSystemPrompt(),
      user: module.buildUserPrompt(inputs, regen),
      maxTokens: module.max_tokens,
    });
    total.tokensIn += usage.tokensIn;
    total.tokensOut += usage.tokensOut;
    total.costGbp += usage.costGbp;
    try {
      return { output: module.parseOutput(text), usage: total };
    } catch (e) {
      if (!(e instanceof OutputParseError)) throw e;
      console.warn(`model output failed to parse (attempt ${attempt + 1})`, e.message);
      lastError = e;
    }
  }
  throw lastError;
}
