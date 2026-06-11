import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { formatLocalIsoDate } from '../../shared/lib/date/isoDates';
import { useAuth } from '../auth/useAuth';
import { useFinanceData } from '../finance/useFinanceData';
import { useDisplayPreferences } from '../settings/useDisplayPreferences';
import { buildFinanceNotifications } from './lib/buildNotifications';
import {
  readNotificationReadIds,
  writeNotificationReadIds,
} from './lib/notificationReadState';
import { NotificationsContext, type NotificationsContextValue } from './notificationsContextValue';
import { createNotificationReadStateService } from './services/createNotificationReadStateService';

export function NotificationsProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const financeData = useFinanceData();
  const {
    preferences: { currency, locale, monthStartDay },
  } = useDisplayPreferences();
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const notificationReadStateService = useMemo(() => createNotificationReadStateService(), []);
  const userId = auth.user?.id ?? null;
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
  const activeNotificationIds = useMemo(
    () => notifications.map(({ id }) => id),
    [notifications],
  );

  useEffect(() => {
    if (!userId) {
      setReadNotificationIds([]);
      return;
    }

    let isMounted = true;
    const activeUserId = userId;
    const cachedReadIds = readNotificationReadIds(activeUserId);

    setReadNotificationIds(cachedReadIds);

    async function syncReadIds() {
      try {
        const nextReadIds =
          financeData.status === 'ready'
            ? await notificationReadStateService.pruneReadIds(activeUserId, activeNotificationIds)
            : await notificationReadStateService.readReadIds(activeUserId);

        if (isMounted) {
          setReadNotificationIds(nextReadIds);
        }
      } catch {
        if (isMounted) {
          setReadNotificationIds(cachedReadIds);
        }
      }
    }

    void syncReadIds();

    return () => {
      isMounted = false;
    };
  }, [activeNotificationIds, financeData.status, notificationReadStateService, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const activeUserId = userId;

    async function syncReadIdsFromCloud() {
      try {
        const nextReadIds =
          financeData.status === 'ready'
            ? await notificationReadStateService.pruneReadIds(activeUserId, activeNotificationIds)
            : await notificationReadStateService.readReadIds(activeUserId);

        setReadNotificationIds(nextReadIds);
      } catch {
        // Keep the local cache active when cloud sync is temporarily unavailable.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void syncReadIdsFromCloud();
      }
    }

    function handleWindowFocus() {
      void syncReadIdsFromCloud();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [activeNotificationIds, financeData.status, notificationReadStateService, userId]);

  const persistReadIds = useCallback((nextReadIds: string[]) => {
    if (!userId) {
      return;
    }

    writeNotificationReadIds(userId, nextReadIds);
    setReadNotificationIds(nextReadIds);
    void notificationReadStateService
      .writeReadIds(userId, nextReadIds)
      .then(setReadNotificationIds)
      .catch(() => {});
  }, [notificationReadStateService, userId]);

  const markAsRead = useCallback((notificationId: string) => {
    if (readNotificationIds.includes(notificationId)) {
      return;
    }

    persistReadIds([...readNotificationIds, notificationId]);
  }, [persistReadIds, readNotificationIds]);

  const markAllAsRead = useCallback(() => {
    persistReadIds(notifications.map(({ id }) => id));
  }, [notifications, persistReadIds]);

  const value = useMemo<NotificationsContextValue>(() => {
    const notificationsWithState = notifications.map((notification) => ({
      ...notification,
      isRead: readNotificationIds.includes(notification.id),
    }));
    const unreadNotifications = notificationsWithState.filter(
      (notification) => !notification.isRead,
    );
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
  }, [markAllAsRead, markAsRead, notifications, readNotificationIds]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
