import { createContext } from 'react';

import type { FinanceNotificationWithState } from './notifications.types';

export type NotificationsContextValue = {
  notifications: FinanceNotificationWithState[];
  unreadNotifications: FinanceNotificationWithState[];
  actionableNotifications: FinanceNotificationWithState[];
  unreadCount: number;
  markAsRead(notificationId: string): void;
  markAllAsRead(): void;
};

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);
