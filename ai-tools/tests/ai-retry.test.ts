import { describe, expect, it, vi } from 'vitest';
import { parkingInputs, parkingOutput } from './fixtures.ts';

// Queue of fake model replies, consumed one per API call.
const replies: string[] = [];
const create = vi.fn(async (_params: Record<string, unknown>) => ({
  model: 'claude-sonnet-5-5',
  stop_reason: 'end_turn',
  usage: { input_tokens: 100, output_tokens: 50 },
  content: [{ type: 'text', text: replies.shift() ?? '' }],
}));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    beta = { messages: { create } };
  },
}));
vi.mock('../netlify/lib/spend.ts', () => ({ recordSpend: async () => 0.001 }));

process.env.ANTHROPIC_API_KEY = 'test';
const { generateStructured } = await import('../netlify/lib/ai.ts');
const { parkingAppealPrompt } = await import('../prompts/parking-appeal.ts');
const { OutputParseError } = await import('../prompts/types.ts');

describe('generateStructured', () => {
  it('returns parsed output on the first good reply, with the tool max_tokens', async () => {
    create.mockClear();
    replies.push(JSON.stringify(parkingOutput));
    const { output, usage } = await generateStructured(parkingAppealPrompt, parkingInputs);
    expect(output).toEqual(parkingOutput);
    expect(usage).toMatchObject({ tokensIn: 100, tokensOut: 50 });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]![0]).toMatchObject({
      max_tokens: 2000,
      model: 'claude-sonnet-5-5',
    });
  });
  it('retries once on a parse failure and sums usage', async () => {
    create.mockClear();
    replies.push('sorry, not json', JSON.stringify(parkingOutput));
    const { output, usage } = await generateStructured(parkingAppealPrompt, parkingInputs);
    expect(output).toEqual(parkingOutput);
    expect(create).toHaveBeenCalledTimes(2);
    expect(usage.tokensIn).toBe(200);
  });
  it('gives up after the second parse failure', async () => {
    create.mockClear();
    replies.push('bad', 'still bad');
    await expect(generateStructured(parkingAppealPrompt, parkingInputs)).rejects.toBeInstanceOf(
      OutputParseError,
    );
    expect(create).toHaveBeenCalledTimes(2);
  });
});
