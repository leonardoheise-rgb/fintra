import {
  getDefaultDisplayPreferences,
  sanitizeDisplayPreferences,
  type DisplayPreferences,
} from '../../../shared/preferences/displayPreferences';
import { getSupabaseBrowserClient } from '../../../shared/supabase/client';
import type { DisplayPreferencesService } from './displayPreferencesService';

type DisplayPreferencesRow = {
  currency: string;
  locale: string;
  month_start_day: number;
};

function mapRowToDisplayPreferences(
  row: DisplayPreferencesRow | null | undefined,
): DisplayPreferences {
  if (!row) {
    return getDefaultDisplayPreferences();
  }

  return sanitizeDisplayPreferences({
    currency: row.currency,
    locale: row.locale,
    monthStartDay: row.month_start_day,
  });
}

export function createSupabaseDisplayPreferencesService(): DisplayPreferencesService {
  const client = getSupabaseBrowserClient();

  return {
    async readPreferences(userId: string): Promise<DisplayPreferences> {
      const { data, error } = await client
        .from('display_preferences')
        .select('currency, locale, month_start_day')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return mapRowToDisplayPreferences(data);
    },
    async writePreferences(
      userId: string,
      preferences: DisplayPreferences,
    ): Promise<DisplayPreferences> {
      const sanitizedPreferences = sanitizeDisplayPreferences(preferences);
      const { data, error } = await client
        .from('display_preferences')
        .upsert(
          {
            user_id: userId,
            currency: sanitizedPreferences.currency,
            locale: sanitizedPreferences.locale,
            month_start_day: sanitizedPreferences.monthStartDay,
          },
          { onConflict: 'user_id' },
        )
        .select('currency, locale, month_start_day')
        .single();

      if (error) {
        throw error;
      }

      return mapRowToDisplayPreferences(data);
    },
    async clearPreferences(userId: string) {
      const { error } = await client
        .from('display_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
  };
}
