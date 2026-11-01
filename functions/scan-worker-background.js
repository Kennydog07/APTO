/**
 * APTO Pro — background worker for the hourly lead scan (15-minute limit).
 * Triggered only by scheduled-scan.js, which signs the request with an HMAC
 * derived from the server-side Supabase service key. Sends no emails.
 */
const crypto = require('crypto');
const { run, cronToken } = require('./scheduled-scan');

exports.handler = async (event) => {
  const given = (event.headers && (event.headers['x-apto-cron'] || event.headers['X-Apto-Cron'])) || '';
  const expected = cronToken();
  if (!process.env.SUPABASE_SERVICE_KEY || given.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    console.log('scan-worker-background: rejected unauthorised call');
    return { statusCode: 401 };
  }
  try { const r = await run(); console.log('scan-worker-background done:', JSON.stringify({ users: r.usersScanned, serpPerUser: r.serpPerUser })); }
  catch (e) { console.error('scan-worker-background error:', e); }
  return { statusCode: 200 };
};
