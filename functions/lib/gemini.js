// Shared Google Gemini client for APTO TOOLS functions.
// Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional override).
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

const geminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
const geminiModel = () => process.env.GEMINI_MODEL || DEFAULT_MODEL;

class GeminiError extends Error {
  constructor(code, message, status = 0) { super(message); this.code = code; this.status = status; }
}

/**
 * Call Gemini generateContent.
 * opts: { system, parts (array of {text}|{inline_data}) or prompt (string), schema (JSON Schema),
 *         json (bool), maxTokens, timeoutMs }
 * Returns { text, json } . Throws GeminiError with code NOT_CONFIGURED | RATE_LIMIT | AUTH | TIMEOUT | BAD_OUTPUT | ERROR.
 */
async function generate(opts) {
  if (!geminiConfigured()) throw new GeminiError('NOT_CONFIGURED', 'GEMINI_API_KEY not set');
  const parts = opts.parts || [{ text: String(opts.prompt || '') }];
  const generationConfig = { maxOutputTokens: opts.maxTokens || 4000 };
  if (opts.schema || opts.json) generationConfig.responseMimeType = 'application/json';
  if (opts.schema) generationConfig.responseJsonSchema = opts.schema;
  const body = { contents: [{ role: 'user', parts }], generationConfig };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs || 25000);
  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel())}:generateContent`, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new GeminiError(e && e.name === 'AbortError' ? 'TIMEOUT' : 'ERROR', 'Gemini request failed');
  } finally { clearTimeout(timer); }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && data.error && data.error.message || '').slice(0, 200);
    if (res.status === 429 || res.status === 503) throw new GeminiError('RATE_LIMIT', `Gemini ${res.status}: ${msg}`, res.status);
    if (res.status === 401 || res.status === 403 || /API key/i.test(msg)) throw new GeminiError('AUTH', `Gemini ${res.status}: ${msg}`, res.status);
    throw new GeminiError('ERROR', `Gemini ${res.status}: ${msg}`, res.status);
  }
  const text = ((data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
    .map(p => p.text || '').join('');
  if (!text) throw new GeminiError('BAD_OUTPUT', 'Gemini returned no text');
  let json;
  if (opts.schema || opts.json) {
    try { json = JSON.parse(text.replace(/```json|```/g, '').trim()); }
    catch { throw new GeminiError('BAD_OUTPUT', 'Gemini returned invalid JSON'); }
  }
  return { text, json };
}

module.exports = { generate, geminiConfigured, geminiModel, GeminiError };
