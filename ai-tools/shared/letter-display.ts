/** Done-page data for the letter tools (deposit return, refund letter). Rendered by src/components/LetterResult.tsx. */
export interface LetterDisplay {
  letterText: string;
  /** One line at the top, e.g. the letter type or the right being used. */
  headline: string;
  figures: { label: string; value: string }[];
  checklist?: { item: string; have: boolean }[];
  evidence: string[];
  nextSteps: string[];
  disclaimer: string;
}
