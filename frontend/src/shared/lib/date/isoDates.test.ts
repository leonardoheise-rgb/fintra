import { addDaysToIsoDate, formatLocalIsoDate } from './isoDates';

describe('isoDates helpers', () => {
  it('adds days to ISO dates', () => {
    expect(addDaysToIsoDate('2026-03-31', 1)).toBe('2026-04-01');
  });

  it('formats local dates as ISO values', () => {
    expect(formatLocalIsoDate(new Date(2026, 3, 3))).toBe('2026-04-03');
  });
});
