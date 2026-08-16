import type { TransactionRecord } from '../../finance/finance.types';
import { buildRecentTransactionItems } from './buildRecentTransactionItems';

function createTransaction(overrides: Partial<TransactionRecord>): TransactionRecord {
  return {
    id: 'transaction-default',
    amount: 10,
    type: 'expense',
    categoryId: 'category-shopping',
    subcategoryId: null,
    date: '2026-04-10',
    description: 'Purchase',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
    ...overrides,
  };
}

describe('buildRecentTransactionItems', () => {
  it('represents an installment purchase once with its full amount and first date', () => {
    const transactions = [
      createTransaction({
        id: 'purchase-3',
        amount: 33.34,
        date: '2026-06-10',
        installmentGroupId: 'purchase',
        installmentIndex: 3,
        installmentCount: 3,
      }),
      createTransaction({
        id: 'purchase-1',
        amount: 33.33,
        date: '2026-04-10',
        installmentGroupId: 'purchase',
        installmentIndex: 1,
        installmentCount: 3,
      }),
      createTransaction({
        id: 'purchase-2',
        amount: 33.33,
        date: '2026-05-10',
        installmentGroupId: 'purchase',
        installmentIndex: 2,
        installmentCount: 3,
      }),
    ];

    expect(buildRecentTransactionItems(transactions)).toEqual([
      expect.objectContaining({
        id: 'installment-group:purchase',
        amount: 100,
        date: '2026-04-10',
        installmentGroupId: 'purchase',
        installmentIndex: null,
        installmentCount: 3,
      }),
    ]);
  });

  it('sorts a grouped purchase by its first installment instead of future installments', () => {
    const transactions = [
      createTransaction({
        id: 'installment-2',
        date: '2026-06-10',
        installmentGroupId: 'purchase',
        installmentIndex: 2,
        installmentCount: 2,
      }),
      createTransaction({
        id: 'newer-individual',
        date: '2026-05-01',
      }),
      createTransaction({
        id: 'installment-1',
        date: '2026-04-10',
        installmentGroupId: 'purchase',
        installmentIndex: 1,
        installmentCount: 2,
      }),
    ];

    expect(buildRecentTransactionItems(transactions).map((transaction) => transaction.id)).toEqual([
      'newer-individual',
      'installment-group:purchase',
    ]);
  });
});
