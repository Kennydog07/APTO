import type Anthropic from '@anthropic-ai/sdk';

/** Context passed when the user uses their one free regeneration. */
export interface RegenContext<TOutput> {
  previous: TOutput;
  note: string;
}

/**
 * Every tool's prompts/<tool>.ts exports an object of this shape.
 * TInputs = validated form inputs, TOutput = validated model JSON.
 */
export interface PromptModule<TInputs, TOutput> {
  max_tokens: number;
  buildSystemPrompt(): string;
  /** A string, or content blocks (e.g. images for the listing writer). */
  buildUserPrompt(
    inputs: TInputs,
    regen?: RegenContext<TOutput>,
  ): string | Anthropic.ContentBlockParam[];
  /** Throws OutputParseError if the model output is not valid. */
  parseOutput(raw: string): TOutput;
}

export class OutputParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutputParseError';
  }
}

/**
 * Pull a JSON object out of a model reply. Tolerates ```json fences and stray text
 * around the object, then validates with the given zod-like schema.
 */
export function parseJsonWith<T>(
  raw: string,
  schema: {
    safeParse(
      v: unknown,
    ): { success: true; data: T } | { success: false; error: { message: string } };
  },
): T {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start)
    throw new OutputParseError('No JSON object found in model output');
  let value: unknown;
  try {
    value = JSON.parse(raw.slice(start, end + 1));
  } catch (e) {
    throw new OutputParseError(`Invalid JSON: ${(e as Error).message}`);
  }
  const result = schema.safeParse(value);
  if (!result.success)
    throw new OutputParseError(`JSON failed validation: ${result.error.message}`);
  return result.data;
}
