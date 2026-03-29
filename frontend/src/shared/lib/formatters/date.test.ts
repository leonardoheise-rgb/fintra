import { formatMonthLabel } from './date';

describe('formatMonthLabel', () => {
  it('formats year-month values into readable labels', () => {
    expect(formatMonthLabel('2026-03')).toBe('March 2026');
  });

  it('returns the original value when the month cannot be parsed', () => {
    expect(formatMonthLabel('invalid-month')).toBe('invalid-month');
  });
});
