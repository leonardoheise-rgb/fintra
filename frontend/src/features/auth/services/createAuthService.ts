import type { AuthService } from './authService';
import { createLocalPreviewAuthService } from './localPreviewAuthService';
import { createSupabaseAuthService } from './supabaseAuthService';
import { getSupabaseEnvironment } from '../../../shared/supabase/client';

/**
 * The preview fallback keeps Sprint 1 runnable before a real Supabase project
 * is connected. As soon as the real environment variables are set, the app
 * automatically uses the Supabase-backed implementation.
 */
export function createAuthService(): AuthService {
  const environment = getSupabaseEnvironment();

  if (environment.isConfigured) {
    return createSupabaseAuthService();
  }

  return createLocalPreviewAuthService();
}
