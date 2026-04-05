const readStateVersion = 1;

type NotificationReadState = {
  version: number;
  readIds: string[];
};

function getStorageKey(userId: string) {
  return `fintra.notifications.read-state.${userId}`;
}

function normalizeReadIds(readIds: string[]) {
  return [...new Set(readIds)].sort((left, right) => left.localeCompare(right));
}

export function readNotificationReadIds(userId: string) {
  const rawValue = window.localStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<NotificationReadState>;

    return normalizeReadIds(parsedValue.readIds ?? []);
  } catch {
    return [];
  }
}

export function writeNotificationReadIds(userId: string, readIds: string[]) {
  const nextState: NotificationReadState = {
    version: readStateVersion,
    readIds: normalizeReadIds(readIds),
  };

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(nextState));
}

export function pruneNotificationReadIds(userId: string, activeNotificationIds: string[]) {
  const activeIds = new Set(activeNotificationIds);
  const nextReadIds = readNotificationReadIds(userId).filter((readId) => activeIds.has(readId));

  writeNotificationReadIds(userId, nextReadIds);

  return nextReadIds;
}
