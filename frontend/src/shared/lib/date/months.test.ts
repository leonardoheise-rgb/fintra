import { describe, expect, it } from 'vitest';

import { addMonthsToIsoDate, getCurrentMonthKey, getMonthKey } from './months';

describe('months helpers', () => {
  it('maps dates to the correct finance month when the month starts mid-month', () => {
    expect(getMonthKey('2026-03-14', 15)).toBe('2026-02');
    expect(getMonthKey('2026-03-15', 15)).toBe('2026-03');
  });

  it('uses the configured start day for the current finance month', () => {
    expect(getCurrentMonthKey(new Date(2026, 2, 10, 12), 15)).toBe('2026-02');
    expect(getCurrentMonthKey(new Date(2026, 2, 20, 12), 15)).toBe('2026-03');
  });

  it('advances to the new finance month on the local month start day', () => {
    expect(getCurrentMonthKey(new Date(2026, 4, 18, 23, 59), 19)).toBe('2026-04');
    expect(getCurrentMonthKey(new Date(2026, 4, 19, 0, 1), 19)).toBe('2026-05');
  });

  it('shifts ISO dates while keeping the nearest valid day', () => {
    expect(addMonthsToIsoDate('2026-01-31', 1)).toBe('2026-02-28');
  });
});
