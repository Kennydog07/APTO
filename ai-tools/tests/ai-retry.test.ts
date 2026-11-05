import { describe, expect, it, vi } from 'vitest';
import { parkingInputs, parkingOutput } from './fixtures.ts';

// Queue of fake Gemini replies, consumed one per fetch call.
type Reply = { status?: number; text?: string; body?: unknown };
const replies: Reply[] = [];
const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => {
  const r = replies.shift() ?? { text: '' };
  const body = r.body ?? {
    candidates: [{ content: { parts: [{ text: r.text ?? '' }] }, finishReason: 'STOP' }],
    usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 40, thoughtsTokenCount: 10 },
  };
  return new Response(JSON.stringify(body), { status: r.status ?? 200 });
});
vi.stubGlobal('fetch', fetchMock);
const recordSpend = vi.fn(async () => 0.001);
vi.mock('../netlify/lib/spend.ts', () => ({ recordSpend }));

delete process.env.GEMINI_MODEL;
delete process.env.AI_TOOLS_GEMINI_MODEL;
process.env.GEMINI_API_KEY = 'test-key';
const { generateStructured, callModel, AiRefusalError } = await import('../netlify/lib/ai.ts');
const { parkingAppealPrompt } = await import('../prompts/parking-appeal.ts');
const { listingWriterPrompt } = await import('../prompts/listing-writer.ts');
const { OutputParseError } = await import('../prompts/types.ts');

const sent = (i: number) => {
  const [url, init] = fetchMock.mock.calls[i]!;
  return {
    url,
    headers: init.headers as Record<string, string>,
    body: JSON.parse(String(init.body)),
  };
};

describe('generateStructured (Gemini)', () => {
  it('returns parsed output on the first good reply, mapping max_tokens to maxOutputTokens', async () => {
    fetchMock.mockClear();
    recordSpend.mockClear();
    replies.push({ text: JSON.stringify(parkingOutput) });
    const { output, usage } = await generateStructured(parkingAppealPrompt, parkingInputs);
    expect(output).toEqual(parkingOutput);
    // thinking tokens are billed as output
    expect(usage).toMatchObject({ tokensIn: 100, tokensOut: 50 });
    expect(recordSpend).toHaveBeenCalledWith('gemini-3.5-flash-lite', 100, 50);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const { url, headers, body } = sent(0);
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
    );
    expect(headers['x-goog-api-key']).toBe('test-key');
    expect(body.generationConfig).toEqual({
      maxOutputTokens: 2000,
      responseMimeType: 'application/json',
    });
    expect(body.systemInstruction.parts[0].text).toContain('JSON');
    expect(body.contents[0].role).toBe('user');
  });
  it('uses GEMINI_MODEL when set', async () => {
    fetchMock.mockClear();
    process.env.GEMINI_MODEL = 'gemini-3.6-flash';
    replies.push({ text: JSON.stringify(parkingOutput) });
    await generateStructured(parkingAppealPrompt, parkingInputs);
    expect(sent(0).url).toContain('/models/gemini-3.6-flash:generateContent');
    delete process.env.GEMINI_MODEL;
  });
  it('retries once on a parse failure and sums usage', async () => {
    fetchMock.mockClear();
    replies.push({ text: 'sorry, not json' }, { text: JSON.stringify(parkingOutput) });
    const { output, usage } = await generateStructured(parkingAppealPrompt, parkingInputs);
    expect(output).toEqual(parkingOutput);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(usage.tokensIn).toBe(200);
  });
  it('gives up after the second parse failure', async () => {
    fetchMock.mockClear();
    replies.push({ text: 'bad' }, { text: 'still bad' });
    await expect(generateStructured(parkingAppealPrompt, parkingInputs)).rejects.toBeInstanceOf(
      OutputParseError,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('sends listing photos as inline_data parts', async () => {
    fetchMock.mockClear();
    replies.push({ text: '{}' });
    await callModel({
      system: 's',
      user: listingWriterPrompt.buildUserPrompt({
        platform: 'ebay',
        notes: 'n',
        images: [{ mediaType: 'image/jpeg', data: 'QUJD' }],
      } as never),
      maxTokens: 10,
    });
    const parts = sent(0).body.contents[0].parts;
    expect(parts[0]).toEqual({ inline_data: { mime_type: 'image/jpeg', data: 'QUJD' } });
    expect(parts[1].text).toContain('Write the listing');
  });
});

describe('callModel errors', () => {
  it('retries 429/503 then succeeds', async () => {
    fetchMock.mockClear();
    replies.push({ status: 429, body: { error: { message: 'slow down' } } }, { text: '{"ok":1}' });
    const { text } = await callModel({ system: 's', user: 'u', maxTokens: 10 });
    expect(text).toBe('{"ok":1}');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('does not retry auth errors', async () => {
    fetchMock.mockClear();
    replies.push({ status: 403, body: { error: { message: 'bad key' } } });
    await expect(callModel({ system: 's', user: 'u', maxTokens: 10 })).rejects.toThrow(/403/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('treats a safety block as a refusal', async () => {
    replies.push({ body: { candidates: [{ finishReason: 'SAFETY' }], usageMetadata: {} } });
    await expect(callModel({ system: 's', user: 'u', maxTokens: 10 })).rejects.toBeInstanceOf(
      AiRefusalError,
    );
    replies.push({ body: { promptFeedback: { blockReason: 'OTHER' } } });
    await expect(callModel({ system: 's', user: 'u', maxTokens: 10 })).rejects.toBeInstanceOf(
      AiRefusalError,
    );
  });
  it('fails clearly without a key', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(callModel({ system: 's', user: 'u', maxTokens: 10 })).rejects.toThrow(
      /GEMINI_API_KEY/,
    );
    process.env.GEMINI_API_KEY = 'test-key';
  });
});
