import type { DisplayPreferences } from '../../../shared/preferences/displayPreferences';
import {
  clearStoredDisplayPreferences,
  readStoredDisplayPreferences,
  sanitizeDisplayPreferences,
  writeStoredDisplayPreferences,
} from '../../../shared/preferences/displayPreferences';
import type { DisplayPreferencesService } from './displayPreferencesService';

export function createLocalDisplayPreferencesService(): DisplayPreferencesService {
  return {
    async readPreferences(userId: string): Promise<DisplayPreferences> {
      return readStoredDisplayPreferences(userId);
    },
    async writePreferences(
      userId: string,
      preferences: DisplayPreferences,
    ): Promise<DisplayPreferences> {
      const sanitizedPreferences = sanitizeDisplayPreferences(preferences);

      writeStoredDisplayPreferences(userId, sanitizedPreferences);
      return sanitizedPreferences;
    },
    async clearPreferences(userId: string) {
      clearStoredDisplayPreferences(userId);
    },
  };
}
