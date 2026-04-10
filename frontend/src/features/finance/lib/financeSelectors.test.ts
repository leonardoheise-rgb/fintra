import { sortTransactionsByDateDesc } from './financeSelectors';
import type { TransactionRecord } from '../finance.types';

function createTransaction(overrides: Partial<TransactionRecord>): TransactionRecord {
  return {
    id: 'transaction-default',
    amount: 10,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-04-10',
    description: '',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
    ...overrides,
  };
}

describe('sortTransactionsByDateDesc', () => {
  it('keeps same-day transactions ordered by their recorded time', () => {
    const transactions = [
      createTransaction({
        id: 'transaction-earlier',
        date: '2026-04-10',
        recordedAt: '2026-04-10T08:15:00.000Z',
      }),
      createTransaction({
        id: 'transaction-later',
        date: '2026-04-10',
        recordedAt: '2026-04-10T17:45:00.000Z',
      }),
      createTransaction({
        id: 'transaction-newer-date',
        date: '2026-04-11',
        recordedAt: '2026-04-11T07:00:00.000Z',
      }),
    ];

    expect(sortTransactionsByDateDesc(transactions).map((transaction) => transaction.id)).toEqual([
      'transaction-newer-date',
      'transaction-later',
      'transaction-earlier',
    ]);
  });
});
