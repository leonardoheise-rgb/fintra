export type NotificationReadStateService = {
  readReadIds(userId: string): Promise<string[]>;
  writeReadIds(userId: string, readIds: string[]): Promise<string[]>;
  pruneReadIds(userId: string, activeNotificationIds: string[]): Promise<string[]>;
};
