import { describe, expect, it } from 'vitest';

import { resolveAnalyticsRange } from './analyticsRange';

describe('resolveAnalyticsRange', () => {
  it('builds a 3 month range ending at the selected month', () => {
    expect(
      resolveAnalyticsRange({
        preset: '3m',
        endMonth: '2026-03',
      }),
    ).toEqual({
      preset: '3m',
      startMonth: '2026-01',
      endMonth: '2026-03',
      months: ['2026-01', '2026-02', '2026-03'],
    });
  });

  it('normalizes custom ranges when start and end are inverted', () => {
    expect(
      resolveAnalyticsRange({
        preset: 'custom',
        endMonth: '2026-03',
        customStartMonth: '2026-05',
        customEndMonth: '2026-03',
      }),
    ).toEqual({
      preset: 'custom',
      startMonth: '2026-03',
      endMonth: '2026-05',
      months: ['2026-03', '2026-04', '2026-05'],
    });
  });
});
