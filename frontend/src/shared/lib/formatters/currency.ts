import { getDisplayPreferences } from '../../preferences/displayPreferences';

export function formatCurrency(
  value: number,
  options?: {
    locale?: string;
    currency?: string;
  },
) {
  const preferences = getDisplayPreferences();
  const locale = options?.locale ?? preferences.locale;
  const currency = options?.currency ?? preferences.currency;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
