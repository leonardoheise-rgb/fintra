import { useEffect, useMemo, useState } from 'react';

import { formatLocalIsoDate } from '../../shared/lib/date/isoDates';
import { useAuth } from '../auth/useAuth';
import { useFinanceData } from '../finance/useFinanceData';
import { useDisplayPreferences } from '../settings/useDisplayPreferences';
import { buildFinanceNotifications } from './lib/buildNotifications';
import {
  pruneNotificationReadIds,
  readNotificationReadIds,
  writeNotificationReadIds,
} from './lib/notificationReadState';

export function useNotifications() {
  const auth = useAuth();
  const financeData = useFinanceData();
  const {
    preferences: { currency, locale, monthStartDay },
  } = useDisplayPreferences();
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const notifications = useMemo(
    () =>
      buildFinanceNotifications(financeData, {
        currency,
        locale,
        monthStartDay,
        todayIsoDate: formatLocalIsoDate(),
      }),
    [currency, financeData, locale, monthStartDay],
  );

  useEffect(() => {
    if (!auth.user) {
      setReadNotificationIds([]);
      return;
    }

    setReadNotificationIds(readNotificationReadIds(auth.user.id));
  }, [auth.user]);

  useEffect(() => {
    if (!auth.user) {
      return;
    }

    setReadNotificationIds(pruneNotificationReadIds(auth.user.id, notifications.map(({ id }) => id)));
  }, [auth.user, notifications]);

  function persistReadIds(nextReadIds: string[]) {
    if (!auth.user) {
      return;
    }

    writeNotificationReadIds(auth.user.id, nextReadIds);
    setReadNotificationIds(nextReadIds);
  }

  function markAsRead(notificationId: string) {
    if (readNotificationIds.includes(notificationId)) {
      return;
    }

    persistReadIds([...readNotificationIds, notificationId]);
  }

  function markAllAsRead() {
    persistReadIds(notifications.map(({ id }) => id));
  }

  const notificationsWithState = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        isRead: readNotificationIds.includes(notification.id),
      })),
    [notifications, readNotificationIds],
  );
  const unreadNotifications = notificationsWithState.filter((notification) => !notification.isRead);
  const actionableNotifications = notificationsWithState.filter(
    (notification) => notification.requiresAction,
  );

  return {
    notifications: notificationsWithState,
    unreadNotifications,
    actionableNotifications,
    unreadCount: unreadNotifications.length,
    markAsRead,
    markAllAsRead,
  };
}
