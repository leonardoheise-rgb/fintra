export type DisplayPreferences = {
  currency: string;
  locale: string;
};

export type DisplayPreferenceOption = {
  value: string;
  label: string;
};

const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE ?? 'en-US';
const defaultCurrency = import.meta.env.VITE_DEFAULT_CURRENCY ?? 'USD';

export const supportedCurrencyOptions: DisplayPreferenceOption[] = [
  { value: 'BRL', label: 'Brazilian Real (BRL)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

export const supportedLocaleOptions: DisplayPreferenceOption[] = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
];

const supportedCurrencyValues = new Set(supportedCurrencyOptions.map((option) => option.value));
const supportedLocaleValues = new Set(supportedLocaleOptions.map((option) => option.value));

const defaultDisplayPreferences = sanitizeDisplayPreferences({
  currency: defaultCurrency,
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
  input?: Partial<DisplayPreferences> | null,
): DisplayPreferences {
  const currency = input?.currency;
  const locale = input?.locale;

  return {
    currency: currency && supportedCurrencyValues.has(currency)
      ? currency
      : supportedCurrencyValues.has(defaultCurrency)
        ? defaultCurrency
        : 'USD',
    locale: locale && supportedLocaleValues.has(locale)
      ? locale
      : supportedLocaleValues.has(defaultLocale)
        ? defaultLocale
        : 'en-US',
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
