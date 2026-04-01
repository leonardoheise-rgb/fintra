import { createSupabaseFinanceService } from './supabaseFinanceService';
import type { FinanceService } from './financeService';

export function createFinanceService(userId: string): FinanceService {
  return createSupabaseFinanceService(userId);
}
