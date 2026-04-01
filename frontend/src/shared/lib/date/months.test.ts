import { describe, expect, it } from 'vitest';

import { addMonthsToIsoDate, getCurrentMonthKey, getMonthKey } from './months';

describe('months helpers', () => {
  it('maps dates to the correct finance month when the month starts mid-month', () => {
    expect(getMonthKey('2026-03-14', 15)).toBe('2026-02');
    expect(getMonthKey('2026-03-15', 15)).toBe('2026-03');
  });

  it('uses the configured start day for the current finance month', () => {
    expect(getCurrentMonthKey(new Date(Date.UTC(2026, 2, 10)), 15)).toBe('2026-02');
    expect(getCurrentMonthKey(new Date(Date.UTC(2026, 2, 20)), 15)).toBe('2026-03');
  });

  it('shifts ISO dates while keeping the nearest valid day', () => {
    expect(addMonthsToIsoDate('2026-01-31', 1)).toBe('2026-02-28');
  });
});
