import type { AuthService } from './authService';
import { createSupabaseAuthService } from './supabaseAuthService';
export function createAuthService(): AuthService {
  return createSupabaseAuthService();
}
