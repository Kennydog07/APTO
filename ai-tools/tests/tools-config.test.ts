import { describe, expect, it } from 'vitest';
import { LIVE_TOOLS, TOOLS, TOOL_IDS, donePath, formatPrice, isToolId } from '../shared/tools.ts';

describe('tool and price config', () => {
  it('has the agreed prices (pence, GBP)', () => {
    expect(TOOLS['parking-appeal'].pricePence).toBe(399);
    expect(TOOLS['bedtime-story'].pricePence).toBe(299);
    expect(TOOLS['speech-writer'].pricePence).toBe(499);
    expect(TOOLS['listing-writer'].pricePence).toBe(199);
    expect(TOOLS['cv-tailor'].pricePence).toBe(499);
    expect(TOOLS['santa-letter'].pricePence).toBe(199);
    expect(TOOLS['flight-delay-claim'].pricePence).toBe(399);
    expect(TOOLS['deposit-return'].pricePence).toBe(399);
    expect(TOOLS['refund-letter'].pricePence).toBe(299);
  });
  it('has the agreed max_tokens caps', () => {
    expect(TOOLS['parking-appeal'].maxTokens).toBe(2000);
    expect(TOOLS['bedtime-story'].maxTokens).toBe(3000);
    expect(TOOLS['speech-writer'].maxTokens).toBe(3500);
    expect(TOOLS['listing-writer'].maxTokens).toBe(1200);
    expect(TOOLS['cv-tailor'].maxTokens).toBe(5000);
    expect(TOOLS['santa-letter'].maxTokens).toBe(1500);
    expect(TOOLS['flight-delay-claim'].maxTokens).toBe(2000);
    expect(TOOLS['deposit-return'].maxTokens).toBe(2000);
    expect(TOOLS['refund-letter'].maxTokens).toBe(1800);
  });
  it('keeps ids, routes and keys consistent', () => {
    for (const id of TOOL_IDS) {
      expect(TOOLS[id].id).toBe(id);
      expect(TOOLS[id].route).toBe(`/${id}`);
      expect(TOOLS[id].pricePence).toBeGreaterThan(0);
      expect(Number.isInteger(TOOLS[id].pricePence)).toBe(true);
      expect(TOOLS[id].metaDescription.length).toBeLessThanOrEqual(170);
    }
    expect(LIVE_TOOLS.map((t) => t.id)).toContain('parking-appeal');
  });
  it('formats prices and paths', () => {
    expect(formatPrice(399)).toBe('£3.99');
    expect(formatPrice(1000)).toBe('£10.00');
    expect(donePath('parking-appeal', 'abc')).toBe('/t/parking-appeal/done?job=abc');
    expect(isToolId('parking-appeal')).toBe(true);
    expect(isToolId('nope')).toBe(false);
  });
});
