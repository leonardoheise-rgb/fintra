import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

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
import { useAuth } from '../auth/useAuth';
import { DisplayPreferencesContext, type DisplayPreferencesContextValue } from './displayPreferencesContextValue';
import { createDisplayPreferencesService } from './services/createDisplayPreferencesService';
import type { DisplayPreferencesService } from './services/displayPreferencesService';

type DisplayPreferencesProviderProps = PropsWithChildren<{
  service?: DisplayPreferencesService;
}>;

export function DisplayPreferencesProvider({
  children,
  service,
}: DisplayPreferencesProviderProps) {
  const auth = useAuth();
  const displayPreferencesService = useMemo(
    () => service ?? createDisplayPreferencesService(),
    [service],
  );
  const [preferences, setPreferences] = useState<DisplayPreferences>(() =>
    getDefaultDisplayPreferences(),
  );

  useEffect(() => {
    if (!auth.user) {
      const nextPreferences = getDefaultDisplayPreferences();

      setPreferences(nextPreferences);
      setRuntimeDisplayPreferences(nextPreferences);
      return;
    }

    let isMounted = true;
    const cachedPreferences = readStoredDisplayPreferences(auth.user.id);

    setPreferences(cachedPreferences);
    setRuntimeDisplayPreferences(cachedPreferences);

    displayPreferencesService
      .readPreferences(auth.user.id)
      .then((nextPreferences) => {
        if (!isMounted) {
          return;
        }

        setPreferences(nextPreferences);
        setRuntimeDisplayPreferences(nextPreferences);
        writeStoredDisplayPreferences(auth.user.id, nextPreferences);
      })
      .catch(() => {
        // Keep the local cache active when cloud sync is temporarily unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, [auth.user, displayPreferencesService]);

  useEffect(() => {
    setRuntimeDisplayPreferences(preferences);
    document.documentElement.lang = preferences.locale;
  }, [preferences]);

  useEffect(() => {
    if (!auth.user) {
      return;
    }

    async function syncPreferencesFromCloud(userId: string) {
      try {
        const nextPreferences = await displayPreferencesService.readPreferences(userId);

        setPreferences(nextPreferences);
        setRuntimeDisplayPreferences(nextPreferences);
        writeStoredDisplayPreferences(userId, nextPreferences);
      } catch {
        // Leave the cached preferences in place if sync fails while the app regains focus.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void syncPreferencesFromCloud(auth.user!.id);
      }
    }

    function handleWindowFocus() {
      void syncPreferencesFromCloud(auth.user!.id);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [auth.user, displayPreferencesService]);

  const value = useMemo<DisplayPreferencesContextValue>(
    () => ({
      preferences,
      currencyOptions: supportedCurrencyOptions,
      localeOptions: supportedLocaleOptions,
      async updatePreferences(nextPreferences) {
        const sanitizedPreferences = sanitizeDisplayPreferences(nextPreferences);

        setPreferences(sanitizedPreferences);
        setRuntimeDisplayPreferences(sanitizedPreferences);

        if (!auth.user) {
          return;
        }

        writeStoredDisplayPreferences(auth.user.id, sanitizedPreferences);

        const persistedPreferences = await displayPreferencesService.writePreferences(
          auth.user.id,
          sanitizedPreferences,
        );

        setPreferences(persistedPreferences);
        setRuntimeDisplayPreferences(persistedPreferences);
        writeStoredDisplayPreferences(auth.user.id, persistedPreferences);
      },
      async resetPreferences() {
        const nextPreferences = getDefaultDisplayPreferences();

        setPreferences(nextPreferences);
        setRuntimeDisplayPreferences(nextPreferences);

        if (!auth.user) {
          return;
        }

        writeStoredDisplayPreferences(auth.user.id, nextPreferences);
        await displayPreferencesService.clearPreferences(auth.user.id);
        clearStoredDisplayPreferences(auth.user.id);
      },
    }),
    [auth.user, displayPreferencesService, preferences],
  );

  return (
    <DisplayPreferencesContext.Provider value={value}>
      {children}
    </DisplayPreferencesContext.Provider>
  );
}
