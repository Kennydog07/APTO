import { useSyncExternalStore } from 'react';
import {
  LIVE_TOOLS,
  TOOLS,
  isInSeason,
  navTools,
  type ToolConfig,
  type ToolId,
} from '../../shared/tools';

/**
 * Seasonal switches are checked against the visitor's clock AFTER hydration, so the
 * pre-rendered HTML (built on any date) always matches the first client render.
 * Server snapshot = null ("unknown"): every live tool is shown and the form renders.
 * Checkout is also enforced on the server (ai-create-job), so this is presentation only.
 */
const noop = () => () => {};
/** Today's date as a stable string (so the snapshot only changes once a day). */
const todayKey = () => new Date().toISOString().slice(0, 10);

export function useToday(): Date | null {
  const key = useSyncExternalStore(noop, todayKey, () => null);
  return key ? new Date() : null;
}

export function useNavTools(): ToolConfig[] {
  const today = useToday();
  return today ? navTools(today) : LIVE_TOOLS;
}

/** null until hydrated, then whether the tool can be bought today. */
export function useInSeason(id: ToolId): boolean | null {
  const today = useToday();
  return today ? isInSeason(TOOLS[id], today) : null;
}
