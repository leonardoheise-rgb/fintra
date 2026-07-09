import { formatIsoDateLabel, formatMonthLabel } from './date';

describe('formatMonthLabel', () => {
  it('formats year-month values into readable labels', () => {
    expect(formatMonthLabel('2026-03')).toBe('March 2026');
  });

  it('returns the original value when the month cannot be parsed', () => {
    expect(formatMonthLabel('invalid-month')).toBe('invalid-month');
  });
});

describe('formatIsoDateLabel', () => {
  it('uses the default year-month-day display format', () => {
    expect(formatIsoDateLabel('2026-03-04', 'YYYY-MM-dd')).toBe('2026-03-04');
  });

  it('formats ISO dates with the configured day-month-year format', () => {
    expect(formatIsoDateLabel('2026-03-04', 'dd-MM-YYYY')).toBe('04-03-2026');
  });

  it('returns the original value when the date cannot be parsed', () => {
    expect(formatIsoDateLabel('invalid-date', 'dd-MM-YYYY')).toBe('invalid-date');
  });
});
