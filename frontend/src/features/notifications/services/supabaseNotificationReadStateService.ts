import { getSupabaseBrowserClient } from '../../../shared/supabase/client';
import {
  normalizeNotificationReadIds,
  writeNotificationReadIds,
} from '../lib/notificationReadState';
import type { NotificationReadStateService } from './notificationReadStateService';

type NotificationReadStateRow = {
  read_ids: string[] | null;
};

function mapRowToReadIds(row: NotificationReadStateRow | null | undefined) {
  return normalizeNotificationReadIds(row?.read_ids ?? []);
}

export function createSupabaseNotificationReadStateService(): NotificationReadStateService {
  const client = getSupabaseBrowserClient();

  async function writePersistedReadIds(userId: string, readIds: string[]) {
    const normalizedReadIds = normalizeNotificationReadIds(readIds);
    const { data, error } = await client
      .from('notification_read_states')
      .upsert(
        {
          user_id: userId,
          read_ids: normalizedReadIds,
        },
        { onConflict: 'user_id' },
      )
      .select('read_ids')
      .single();

    if (error) {
      throw error;
    }

    const persistedReadIds = mapRowToReadIds(data);
    writeNotificationReadIds(userId, persistedReadIds);

    return persistedReadIds;
  }

  return {
    async readReadIds(userId: string) {
      const { data, error } = await client
        .from('notification_read_states')
        .select('read_ids')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const readIds = mapRowToReadIds(data);
      writeNotificationReadIds(userId, readIds);

      return readIds;
    },
    async writeReadIds(userId: string, readIds: string[]) {
      return writePersistedReadIds(userId, readIds);
    },
    async pruneReadIds(userId: string, activeNotificationIds: string[]) {
      const activeIds = new Set(activeNotificationIds);
      const { data, error } = await client
        .from('notification_read_states')
        .select('read_ids')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const readIds = normalizeNotificationReadIds(
        mapRowToReadIds(data).filter((readId) => activeIds.has(readId)),
      );

      return writePersistedReadIds(userId, readIds);
    },
  };
}
