const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE ?? 'en-US';
const defaultCurrency = import.meta.env.VITE_DEFAULT_CURRENCY ?? 'USD';

export function formatCurrency(
  value: number,
  options?: {
    locale?: string;
    currency?: string;
  },
) {
  const locale = options?.locale ?? defaultLocale;
  const currency = options?.currency ?? defaultCurrency;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
