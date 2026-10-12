// Entry point: `npm start`.
import { createServer } from 'node:http';
import { loadConfig, assertProductionReady } from './config.js';
import { createContext, createApp } from './app.js';

const cfg = loadConfig();
const missing = assertProductionReady(cfg);
if (missing.length) {
  console.error(`Refusing to start. Missing or weak settings:\n - ${missing.join('\n - ')}\nSee .env.example and SETUP-FOR-BEGINNERS.md.`);
  process.exit(1);
}
const ctx = createContext(cfg);
const server = createServer(createApp(ctx));
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.listen(cfg.port, () => ctx.log.info('server', `ops-service listening on :${cfg.port}`, { testMode: cfg.testMode }));

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => { server.close(() => { ctx.db.close(); process.exit(0); }); setTimeout(() => process.exit(1), 10_000).unref(); });
}
