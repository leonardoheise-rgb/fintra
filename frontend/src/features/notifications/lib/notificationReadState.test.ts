import {
  pruneNotificationReadIds,
  readNotificationReadIds,
  writeNotificationReadIds,
} from './notificationReadState';

describe('notificationReadState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deduplicates and sorts read notification ids when persisting them', () => {
    writeNotificationReadIds('user-1', ['notification-b', 'notification-a', 'notification-a']);

    expect(readNotificationReadIds('user-1')).toEqual(['notification-a', 'notification-b']);
  });

  it('prunes read ids that are no longer active', () => {
    writeNotificationReadIds('user-1', ['notification-a', 'notification-b']);

    expect(pruneNotificationReadIds('user-1', ['notification-b', 'notification-c'])).toEqual([
      'notification-b',
    ]);
  });
});
