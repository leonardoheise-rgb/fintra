import type { DisplayPreferences } from '../../../shared/preferences/displayPreferences';

export interface DisplayPreferencesService {
  readPreferences(userId: string): Promise<DisplayPreferences>;
  writePreferences(
    userId: string,
    preferences: DisplayPreferences,
  ): Promise<DisplayPreferences>;
  clearPreferences(userId: string): Promise<void>;
}
