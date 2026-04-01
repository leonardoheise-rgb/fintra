import { createLocalPreviewFinanceService } from '../features/finance/services/localPreviewFinanceService';

export function createTestFinanceService(userId: string) {
  return createLocalPreviewFinanceService(userId);
}
