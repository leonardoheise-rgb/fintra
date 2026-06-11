import { describe, expect, it, beforeEach, vi } from 'vitest';

import { readNotificationReadIds } from '../lib/notificationReadState';
import { createSupabaseNotificationReadStateService } from './supabaseNotificationReadStateService';

type QueryResult = {
  data: { read_ids: string[] } | null;
  error: Error | null;
};

const queryResults: QueryResult[] = [];
const upsertedRows: Array<{ user_id: string; read_ids: string[] }> = [];

vi.mock('../../../shared/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    from: () => ({
      select() {
        return this;
      },
      eq() {
        return this;
      },
      maybeSingle() {
        return Promise.resolve(queryResults.shift() ?? { data: null, error: null });
      },
      upsert(row: { user_id: string; read_ids: string[] }) {
        upsertedRows.push(row);

        return {
          select() {
            return {
              single() {
                return Promise.resolve({
                  data: { read_ids: row.read_ids },
                  error: null,
                });
              },
            };
          },
        };
      },
    }),
  }),
}));

describe('createSupabaseNotificationReadStateService', () => {
  beforeEach(() => {
    queryResults.length = 0;
    upsertedRows.length = 0;
    window.localStorage.clear();
  });

  it('prunes from server read ids so another device does not erase read state', async () => {
    queryResults.push({
      data: { read_ids: ['notification-active', 'notification-stale'] },
      error: null,
    });

    const service = createSupabaseNotificationReadStateService();
    const readIds = await service.pruneReadIds('user-1', ['notification-active']);

    expect(readIds).toEqual(['notification-active']);
    expect(upsertedRows).toEqual([
      {
        user_id: 'user-1',
        read_ids: ['notification-active'],
      },
    ]);
    expect(readNotificationReadIds('user-1')).toEqual(['notification-active']);
  });

  it('deduplicates and sorts read ids before saving them', async () => {
    const service = createSupabaseNotificationReadStateService();
    const readIds = await service.writeReadIds('user-1', [
      'notification-b',
      'notification-a',
      'notification-a',
    ]);

    expect(readIds).toEqual(['notification-a', 'notification-b']);
    expect(upsertedRows[0]).toEqual({
      user_id: 'user-1',
      read_ids: ['notification-a', 'notification-b'],
    });
  });
});
