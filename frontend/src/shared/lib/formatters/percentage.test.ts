import { describe, expect, it } from 'vitest';

import { formatPercentage } from './percentage';

describe('formatPercentage', () => {
  it('formats positive values as percentages', () => {
    expect(formatPercentage(18.25)).toBe('18.3%');
  });

  it('formats negative values as percentages', () => {
    expect(formatPercentage(-4.4)).toBe('-4.4%');
  });
});
