// Usage: npm run hash-password   (prompts; nothing is echoed or stored)
import { createInterface } from 'node:readline';
import { hashPassword } from '../src/dashboard/auth.js';

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl.stdoutMuted = true;
rl._writeToOutput = function (s) { if (!rl.stdoutMuted || s.includes('Password')) rl.output.write(s); };
rl.question('Password (12+ characters): ', (pw) => {
  rl.close();
  try {
    console.log('\n\nPut this line in your .env file:\n');
    console.log(`DASHBOARD_PASSWORD_HASH='${hashPassword(pw.trim())}'`);
  } catch (e) { console.error(`\n${e.message}`); process.exit(1); }
});
