import {
  formatDecimalInput,
  getDecimalSeparator,
  normalizeImplicitCurrencyInput,
  normalizeDecimalInput,
  parseImplicitCurrencyInput,
  parseDecimalInput,
} from './decimalInput';

describe('decimalInput', () => {
  it('detects the decimal separator for supported locales', () => {
    expect(getDecimalSeparator('en-US')).toBe('.');
    expect(getDecimalSeparator('pt-BR')).toBe(',');
  });

  it('accepts both separators and normalizes to the active locale', () => {
    expect(normalizeDecimalInput('12.5', 'pt-BR')).toBe('12,5');
    expect(normalizeDecimalInput('12,5', 'en-US')).toBe('12.5');
  });

  it('keeps only the last separator as decimal and trims to cents', () => {
    expect(normalizeDecimalInput('1.234,567', 'pt-BR')).toBe('1234,56');
    expect(normalizeDecimalInput('1,234.567', 'en-US')).toBe('1234.56');
  });

  it('parses normalized localized decimals into numbers', () => {
    expect(parseDecimalInput('45,50', 'pt-BR')).toBe(45.5);
    expect(parseDecimalInput('45.50', 'en-US')).toBe(45.5);
  });

  it('formats numbers without grouping for editable inputs', () => {
    expect(formatDecimalInput(45.5, 'pt-BR')).toBe('45,5');
    expect(formatDecimalInput(45.5, 'en-US')).toBe('45.5');
  });

  it('formats implicit-cents typing from right to left', () => {
    expect(normalizeImplicitCurrencyInput('1', 'en-US')).toBe('0.01');
    expect(normalizeImplicitCurrencyInput('12', 'en-US')).toBe('0.12');
    expect(normalizeImplicitCurrencyInput('123', 'en-US')).toBe('1.23');
    expect(normalizeImplicitCurrencyInput('123', 'pt-BR')).toBe('1,23');
  });

  it('parses implicit-cents input back into numbers', () => {
    expect(parseImplicitCurrencyInput('1.23')).toBe(1.23);
    expect(parseImplicitCurrencyInput('1,23')).toBe(1.23);
    expect(parseImplicitCurrencyInput('')).toBeNull();
  });
});
