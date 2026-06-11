import {
  pruneNotificationReadIds,
  readNotificationReadIds,
  writeNotificationReadIds,
} from '../lib/notificationReadState';
import type { NotificationReadStateService } from './notificationReadStateService';

export function createLocalNotificationReadStateService(): NotificationReadStateService {
  return {
    async readReadIds(userId: string) {
      return readNotificationReadIds(userId);
    },
    async writeReadIds(userId: string, readIds: string[]) {
      writeNotificationReadIds(userId, readIds);

      return readNotificationReadIds(userId);
    },
    async pruneReadIds(userId: string, activeNotificationIds: string[]) {
      return pruneNotificationReadIds(userId, activeNotificationIds);
    },
  };
}
