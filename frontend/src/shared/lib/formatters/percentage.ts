import { getDisplayPreferences } from '../../preferences/displayPreferences';

export function formatPercentage(
  value: number,
  fractionDigits = 1,
  locale = getDisplayPreferences().locale,
) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}
