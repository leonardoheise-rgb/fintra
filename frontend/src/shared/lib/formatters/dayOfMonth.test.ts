import { formatDayOfMonthLabel } from './dayOfMonth';

describe('formatDayOfMonthLabel', () => {
  it('formats common ordinal dates', () => {
    expect(formatDayOfMonthLabel(1)).toBe('1st');
    expect(formatDayOfMonthLabel(2)).toBe('2nd');
    expect(formatDayOfMonthLabel(3)).toBe('3rd');
    expect(formatDayOfMonthLabel(4)).toBe('4th');
    expect(formatDayOfMonthLabel(21)).toBe('21st');
  });

  it('keeps teen ordinals on the th suffix', () => {
    expect(formatDayOfMonthLabel(11)).toBe('11th');
    expect(formatDayOfMonthLabel(12)).toBe('12th');
    expect(formatDayOfMonthLabel(13)).toBe('13th');
  });

  it('returns the raw value when the day is outside the supported range', () => {
    expect(formatDayOfMonthLabel(0)).toBe('0');
    expect(formatDayOfMonthLabel(32)).toBe('32');
  });

  it('falls back to plain day numbers for non-english locales', () => {
    expect(formatDayOfMonthLabel(1, 'pt-BR')).toBe('1');
    expect(formatDayOfMonthLabel(21, 'pt-BR')).toBe('21');
  });
});
