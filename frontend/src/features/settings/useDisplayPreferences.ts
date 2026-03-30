import { useContext } from 'react';

import { DisplayPreferencesContext } from './displayPreferencesContextValue';

export function useDisplayPreferences() {
  const context = useContext(DisplayPreferencesContext);

  if (!context) {
    throw new Error('useDisplayPreferences must be used within a DisplayPreferencesProvider.');
  }

  return context;
}
