import {
  sortTransactionsByDateAsc,
  sortTransactionsByDateDesc,
  sortTransactionsForLedger,
} from './financeSelectors';
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

describe('sortTransactionsByDateAsc', () => {
  it('keeps oldest transactions first with stable same-day ordering', () => {
    const transactions = [
      createTransaction({
        id: 'transaction-later',
        date: '2026-04-10',
        recordedAt: '2026-04-10T17:45:00.000Z',
      }),
      createTransaction({
        id: 'transaction-earlier',
        date: '2026-04-10',
        recordedAt: '2026-04-10T08:15:00.000Z',
      }),
      createTransaction({
        id: 'transaction-older-date',
        date: '2026-04-09',
        recordedAt: '2026-04-09T07:00:00.000Z',
      }),
    ];

    expect(sortTransactionsByDateAsc(transactions).map((transaction) => transaction.id)).toEqual([
      'transaction-older-date',
      'transaction-earlier',
      'transaction-later',
    ]);
  });
});

describe('sortTransactionsForLedger', () => {
  it('keeps current entries newest first and future entries oldest first', () => {
    const transactions = [
      createTransaction({
        id: 'future-later',
        date: '2026-08-20',
      }),
      createTransaction({
        id: 'current-newer',
        date: '2026-07-08',
      }),
      createTransaction({
        id: 'future-earlier',
        date: '2026-07-20',
      }),
      createTransaction({
        id: 'current-older',
        date: '2026-07-02',
      }),
    ];

    expect(
      sortTransactionsForLedger(transactions, '2026-07-09').map((transaction) => transaction.id),
    ).toEqual(['current-newer', 'current-older', 'future-earlier', 'future-later']);
  });
});
