import type { AuthService } from './authService';
import { getAuthEnvironment } from './authEnvironment';
import { createLocalPreviewAuthService } from './localPreviewAuthService';
import { createSupabaseAuthService } from './supabaseAuthService';

/**
 * The preview fallback keeps Sprint 1 runnable before a real Supabase project
 * is connected. As soon as the real environment variables are set, the app
 * automatically uses the Supabase-backed implementation.
 */
export function createAuthService(): AuthService {
  const environment = getAuthEnvironment();

  if (environment.isConfigured) {
    return createSupabaseAuthService();
  }

  return createLocalPreviewAuthService();
}
