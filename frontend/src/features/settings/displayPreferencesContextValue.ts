import { createContext } from 'react';

import type { DisplayPreferenceOption, DisplayPreferences } from '../../shared/preferences/displayPreferences';

export type DisplayPreferencesContextValue = {
  preferences: DisplayPreferences;
  currencyOptions: DisplayPreferenceOption[];
  localeOptions: DisplayPreferenceOption[];
  updatePreferences(preferences: DisplayPreferences): void;
  resetPreferences(): void;
};

export const DisplayPreferencesContext = createContext<DisplayPreferencesContextValue | undefined>(
  undefined,
);
