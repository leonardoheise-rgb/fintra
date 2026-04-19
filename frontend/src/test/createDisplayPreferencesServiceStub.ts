import { vi } from 'vitest';

import {
  getDefaultDisplayPreferences,
  sanitizeDisplayPreferences,
  type DisplayPreferences,
} from '../shared/preferences/displayPreferences';
import type { DisplayPreferencesService } from '../features/settings/services/displayPreferencesService';

type CreateDisplayPreferencesServiceStubOptions = {
  initialPreferences?: DisplayPreferences;
};

export function createDisplayPreferencesServiceStub(
  options: CreateDisplayPreferencesServiceStubOptions = {},
) {
  let preferences = sanitizeDisplayPreferences(
    options.initialPreferences ?? getDefaultDisplayPreferences(),
  );

  const service: DisplayPreferencesService = {
    readPreferences: vi.fn(async () => preferences),
    writePreferences: vi.fn(async (_userId, nextPreferences) => {
      preferences = sanitizeDisplayPreferences(nextPreferences);
      return preferences;
    }),
    clearPreferences: vi.fn(async () => {
      preferences = getDefaultDisplayPreferences();
    }),
  };

  return {
    service,
    getPreferences() {
      return preferences;
    },
  };
}
