import { createLocalPreviewFinanceService } from './localPreviewFinanceService';
import { createSupabaseFinanceService } from './supabaseFinanceService';
import type { FinanceService } from './financeService';

export function createFinanceService(userId: string, mode: 'preview' | 'supabase'): FinanceService {
  if (mode === 'supabase') {
    return createSupabaseFinanceService(userId);
  }

  return createLocalPreviewFinanceService(userId);
}
