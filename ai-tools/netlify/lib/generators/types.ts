import type { ZodType } from 'zod';
import type { PromptModule } from '../../../prompts/types.ts';
import type { OutputFile } from '../storage.ts';

/**
 * Everything the shared job pipeline needs to know about one tool.
 * Add a new tool by writing one of these and registering it in ./index.ts.
 */
export interface ToolGenerator<TIn = unknown, TOut = unknown> {
  inputSchema: ZodType<TIn>;
  /**
   * Credit-pack tools only: schema for what is bought at checkout (create-job). The
   * inputSchema then describes one use of a credit instead.
   */
  purchaseSchema?: ZodType<unknown>;
  prompt: PromptModule<TIn, TOut>;
  /** Turn validated AI output into files + the JSON shown inline on the done page. */
  build(inputs: TIn, output: TOut): Promise<{ display: unknown; files: OutputFile[] }>;
}

/** What is stored in jobs.result. `output` is kept so a regeneration can see the previous version. */
export interface StoredResult<TOut = unknown> {
  output: TOut;
  display: unknown;
}
