import { getSupabaseEnvironment } from '../../../shared/supabase/client';
import { createLocalNotificationReadStateService } from './localNotificationReadStateService';
import type { NotificationReadStateService } from './notificationReadStateService';
import { createSupabaseNotificationReadStateService } from './supabaseNotificationReadStateService';

export function createNotificationReadStateService(): NotificationReadStateService {
  return getSupabaseEnvironment().isConfigured
    ? createSupabaseNotificationReadStateService()
    : createLocalNotificationReadStateService();
}
