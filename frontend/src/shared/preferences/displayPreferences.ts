export type DisplayPreferences = {
  currency: string;
  dateFormat: DateFormatPreference;
  locale: string;
  monthStartDay: number;
};

export type DateFormatPreference = 'YYYY-MM-dd' | 'dd-MM-YYYY';

export type DisplayPreferenceOption = {
  value: string;
  label: string;
};

type DisplayPreferencesInput = Partial<Omit<DisplayPreferences, 'dateFormat'>> & {
  dateFormat?: string | null;
};

const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE ?? 'en-US';
const defaultCurrency = import.meta.env.VITE_DEFAULT_CURRENCY ?? 'USD';
const defaultDateFormat = import.meta.env.VITE_DEFAULT_DATE_FORMAT ?? 'YYYY-MM-dd';
const defaultMonthStartDay = Number(import.meta.env.VITE_DEFAULT_MONTH_START_DAY ?? '1');

export const supportedCurrencyOptions: DisplayPreferenceOption[] = [
  { value: 'BRL', label: 'Brazilian Real (BRL)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

export const supportedLocaleOptions: DisplayPreferenceOption[] = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
];

export const supportedDateFormatOptions: DisplayPreferenceOption[] = [
  { value: 'YYYY-MM-dd', label: 'YYYY-MM-dd' },
  { value: 'dd-MM-YYYY', label: 'dd-MM-YYYY' },
];

const supportedCurrencyValues = new Set(supportedCurrencyOptions.map((option) => option.value));
const supportedLocaleValues = new Set(supportedLocaleOptions.map((option) => option.value));
const supportedDateFormatValues = new Set(supportedDateFormatOptions.map((option) => option.value));

function getFallbackDateFormat(): DateFormatPreference {
  return supportedDateFormatValues.has(defaultDateFormat)
    ? (defaultDateFormat as DateFormatPreference)
    : 'YYYY-MM-dd';
}

function isSupportedDateFormat(value: string | null | undefined): value is DateFormatPreference {
  return Boolean(value && supportedDateFormatValues.has(value));
}

const defaultDisplayPreferences = sanitizeDisplayPreferences({
  currency: defaultCurrency,
  dateFormat: getFallbackDateFormat(),
  locale: defaultLocale,
});

let runtimeDisplayPreferences: DisplayPreferences = defaultDisplayPreferences;

function getStorageKey(userId: string) {
  return `fintra.display-preferences.${userId}`;
}

export function getDefaultDisplayPreferences(): DisplayPreferences {
  return defaultDisplayPreferences;
}

export function sanitizeDisplayPreferences(
  input?: DisplayPreferencesInput | null,
): DisplayPreferences {
  const currency = input?.currency;
  const dateFormat = input?.dateFormat;
  const locale = input?.locale;
  const monthStartDay = input?.monthStartDay;

  return {
    currency: currency && supportedCurrencyValues.has(currency)
      ? currency
      : supportedCurrencyValues.has(defaultCurrency)
        ? defaultCurrency
        : 'USD',
    dateFormat: isSupportedDateFormat(dateFormat)
      ? dateFormat
      : getFallbackDateFormat(),
    locale: locale && supportedLocaleValues.has(locale)
      ? locale
      : supportedLocaleValues.has(defaultLocale)
        ? defaultLocale
        : 'en-US',
    monthStartDay:
      typeof monthStartDay === 'number' &&
      Number.isInteger(monthStartDay) &&
      monthStartDay >= 1 &&
      monthStartDay <= 31
        ? monthStartDay
        : Number.isInteger(defaultMonthStartDay) &&
            defaultMonthStartDay >= 1 &&
            defaultMonthStartDay <= 31
          ? defaultMonthStartDay
          : 1,
  };
}

export function getDisplayPreferences(): DisplayPreferences {
  return runtimeDisplayPreferences;
}

export function setRuntimeDisplayPreferences(preferences: DisplayPreferences) {
  runtimeDisplayPreferences = sanitizeDisplayPreferences(preferences);
}

export function resetRuntimeDisplayPreferences() {
  runtimeDisplayPreferences = defaultDisplayPreferences;
}

export function readStoredDisplayPreferences(userId: string): DisplayPreferences {
  const rawValue = window.localStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    return defaultDisplayPreferences;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<DisplayPreferences>;
    return sanitizeDisplayPreferences(parsedValue);
  } catch {
    return defaultDisplayPreferences;
  }
}

export function writeStoredDisplayPreferences(
  userId: string,
  preferences: DisplayPreferences,
) {
  window.localStorage.setItem(
    getStorageKey(userId),
    JSON.stringify(sanitizeDisplayPreferences(preferences)),
  );
}

export function clearStoredDisplayPreferences(userId: string) {
  window.localStorage.removeItem(getStorageKey(userId));
}
