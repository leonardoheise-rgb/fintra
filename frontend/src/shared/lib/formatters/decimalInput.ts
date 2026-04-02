export function getDecimalSeparator(locale: string) {
  const parts = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    useGrouping: false,
  }).formatToParts(1.1);

  return parts.find((part) => part.type === 'decimal')?.value ?? '.';
}

export function normalizeDecimalInput(rawValue: string, locale: string) {
  const sanitizedValue = rawValue.replace(/[^\d.,]/g, '');

  if (!sanitizedValue) {
    return '';
  }

  const decimalSeparator = getDecimalSeparator(locale);
  const decimalIndex = Math.max(sanitizedValue.lastIndexOf(','), sanitizedValue.lastIndexOf('.'));
  const hasDecimalSeparator = decimalIndex >= 0;
  const integerPart = (
    hasDecimalSeparator
      ? sanitizedValue.slice(0, decimalIndex)
      : sanitizedValue
  ).replace(/[.,]/g, '');
  const fractionPart = (
    hasDecimalSeparator
      ? sanitizedValue.slice(decimalIndex + 1)
      : ''
  ).replace(/[.,]/g, '').slice(0, 2);
  const normalizedIntegerPart = integerPart.replace(/^0+(?=\d)/, '');
  const resolvedIntegerPart = normalizedIntegerPart || (hasDecimalSeparator ? '0' : '');

  if (!hasDecimalSeparator) {
    return resolvedIntegerPart;
  }

  return `${resolvedIntegerPart}${decimalSeparator}${fractionPart}`;
}

export function parseDecimalInput(rawValue: string, locale: string) {
  const normalizedValue = normalizeDecimalInput(rawValue, locale);

  if (!normalizedValue) {
    return null;
  }

  const normalizedNumber = normalizedValue.replace(getDecimalSeparator(locale), '.');
  const parsedValue = Number(normalizedNumber);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function formatDecimalInput(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(value);
}
