import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAuth } from '../auth/useAuth';
import type { DisplayPreferences } from '../../shared/preferences/displayPreferences';
import {
  clearStoredDisplayPreferences,
  getDefaultDisplayPreferences,
  readStoredDisplayPreferences,
  sanitizeDisplayPreferences,
  setRuntimeDisplayPreferences,
  supportedCurrencyOptions,
  supportedLocaleOptions,
  writeStoredDisplayPreferences,
} from '../../shared/preferences/displayPreferences';
import { DisplayPreferencesContext, type DisplayPreferencesContextValue } from './displayPreferencesContextValue';

export function DisplayPreferencesProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const [preferences, setPreferences] = useState<DisplayPreferences>(() =>
    getDefaultDisplayPreferences(),
  );

  useEffect(() => {
    const nextPreferences = auth.user
      ? readStoredDisplayPreferences(auth.user.id)
      : getDefaultDisplayPreferences();

    setPreferences(nextPreferences);
    setRuntimeDisplayPreferences(nextPreferences);
  }, [auth.user]);

  useEffect(() => {
    setRuntimeDisplayPreferences(preferences);
  }, [preferences]);

  const value = useMemo<DisplayPreferencesContextValue>(
    () => ({
      preferences,
      currencyOptions: supportedCurrencyOptions,
      localeOptions: supportedLocaleOptions,
      updatePreferences(nextPreferences) {
        const sanitizedPreferences = sanitizeDisplayPreferences(nextPreferences);

        setPreferences(sanitizedPreferences);
        setRuntimeDisplayPreferences(sanitizedPreferences);

        if (auth.user) {
          writeStoredDisplayPreferences(auth.user.id, sanitizedPreferences);
        }
      },
      resetPreferences() {
        const nextPreferences = getDefaultDisplayPreferences();

        setPreferences(nextPreferences);
        setRuntimeDisplayPreferences(nextPreferences);

        if (auth.user) {
          clearStoredDisplayPreferences(auth.user.id);
        }
      },
    }),
    [auth.user, preferences],
  );

  return (
    <DisplayPreferencesContext.Provider value={value}>
      {children}
    </DisplayPreferencesContext.Provider>
  );
}
