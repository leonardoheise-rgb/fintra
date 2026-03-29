import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats positive amounts with the default locale and currency', () => {
    expect(formatCurrency(12450, { locale: 'en-US', currency: 'USD' })).toBe('$12,450.00');
  });

  it('formats negative amounts for cautionary states', () => {
    expect(formatCurrency(-124.5, { locale: 'en-US', currency: 'USD' })).toBe('-$124.50');
  });
});
