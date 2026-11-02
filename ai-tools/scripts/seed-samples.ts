/**
 * Generates one real sample output per live tool (using SAMPLE_INPUTS) and writes the
 * display JSON to src/samples/<tool>.json, which the landing pages show as "What you'll get".
 * Also writes the files to ./sample-output/ so you can inspect the PDF/DOCX.
 *
 *   npm run seed            (needs ANTHROPIC_API_KEY in .env; Supabase is optional)
 *   npm run seed -- parking-appeal
 *
 * Costs a few pence per tool. Review the JSON before committing.
 */
import fs from 'node:fs';
import { generateStructured } from '../netlify/lib/ai.ts';
import { GENERATORS } from '../netlify/lib/generators/index.ts';
import { LIVE_TOOLS, type ToolId } from '../shared/tools.ts';
import { SAMPLE_INPUTS } from './sample-inputs.ts';

const only = process.argv[2] as ToolId | undefined;

for (const tool of LIVE_TOOLS) {
  if (only && tool.id !== only) continue;
  if (tool.credits) {
    console.log(
      `skipping ${tool.id}: credit-pack tool, sample is written by hand (needs real photos)`,
    );
    continue;
  }
  const generator = GENERATORS[tool.id];
  const raw = (SAMPLE_INPUTS as Record<string, unknown>)[tool.id];
  if (!generator || !raw) {
    console.warn(`skipping ${tool.id}: no generator or sample inputs`);
    continue;
  }
  const inputs = generator.inputSchema.parse(raw);
  console.log(`generating ${tool.id}…`);
  const { output, usage } = await generateStructured(generator.prompt, inputs);
  const { display, files } = await generator.build(inputs, output);
  fs.writeFileSync(`src/samples/${tool.id}.json`, JSON.stringify(display, null, 2) + '\n');
  fs.mkdirSync(`sample-output/${tool.id}`, { recursive: true });
  for (const f of files) fs.writeFileSync(`sample-output/${tool.id}/${f.filename}`, f.bytes);
  console.log(
    `  wrote src/samples/${tool.id}.json (${usage.tokensIn} in / ${usage.tokensOut} out, ~£${usage.costGbp.toFixed(4)})`,
  );
}
