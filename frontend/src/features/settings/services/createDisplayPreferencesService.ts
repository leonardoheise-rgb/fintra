import { getSupabaseEnvironment } from '../../../shared/supabase/client';
import { createLocalDisplayPreferencesService } from './localDisplayPreferencesService';
import { createSupabaseDisplayPreferencesService } from './supabaseDisplayPreferencesService';
import type { DisplayPreferencesService } from './displayPreferencesService';

export function createDisplayPreferencesService(): DisplayPreferencesService {
  return getSupabaseEnvironment().isConfigured
    ? createSupabaseDisplayPreferencesService()
    : createLocalDisplayPreferencesService();
}
