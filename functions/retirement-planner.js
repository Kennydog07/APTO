// netlify/functions/retirement-planner.js
//
// Serverless proxy for the APTO Retirement Planner.
// Calls Google Gemini server-side (GEMINI_API_KEY, optional GEMINI_MODEL).
// Uses Netlify Functions v1 syntax (exports.handler) and the shared lib/gemini.js client,
// matching the pattern used elsewhere on aptotools.

const gemini = require('./lib/gemini');

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let prompt;
  try {
    const body = JSON.parse(event.body);
    prompt = body.prompt;
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Missing prompt');
    }
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid request body' })
    };
  }

  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  try {
    const { text } = await gemini.generate({ prompt, maxTokens: 2000, timeoutMs: 25000 });
    // Same shape the planner page already parses (data.content[].text).
    return { statusCode: 200, headers, body: JSON.stringify({ content: [{ type: 'text', text }] }) };
  } catch (e) {
    console.error('retirement-planner AI failed:', e.code, e.message);
    const map = {
      NOT_CONFIGURED: [503, 'The AI planner is not available right now. Please try again later.'],
      AUTH: [503, 'The AI planner is not available right now. Please try again later.'],
      RATE_LIMIT: [429, 'The free AI service is busy right now. Please wait a minute and try again.'],
      TIMEOUT: [504, 'The AI took too long to answer. Please try again.'],
    };
    const [statusCode, message] = map[e.code] || [502, 'The AI could not produce a plan. Please try again.'];
    return { statusCode, headers, body: JSON.stringify({ error: { code: e.code || 'ERROR', message } }) };
  }
};
