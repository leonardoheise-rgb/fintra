import { describe, expect, it } from 'vitest';

import type { TransactionRecord } from '../../finance/finance.types';
import { buildAnalyticsExpenseTransactions } from './buildAnalyticsExpenseTransactions';

const transactions: TransactionRecord[] = [
  {
    id: 'salary',
    amount: 6500,
    type: 'income',
    categoryId: 'salary',
    subcategoryId: null,
    date: '2026-03-01',
    description: 'Salary',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'food-mar',
    amount: 180,
    type: 'expense',
    categoryId: 'food',
    subcategoryId: 'groceries',
    date: '2026-03-05',
    description: 'Groceries',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'housing-mar',
    amount: 2100,
    type: 'expense',
    categoryId: 'housing',
    subcategoryId: null,
    date: '2026-03-03',
    description: 'Rent',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'food-feb',
    amount: 150,
    type: 'expense',
    categoryId: 'food',
    subcategoryId: 'restaurants',
    date: '2026-02-10',
    description: 'Dinner',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
];

describe('buildAnalyticsExpenseTransactions', () => {
  it('returns expense transactions in the selected range sorted by newest first', () => {
    expect(
      buildAnalyticsExpenseTransactions({
        transactions,
        months: ['2026-03'],
        monthStartDay: 1,
        selectedCategoryId: null,
      }).map((transaction) => transaction.id),
    ).toEqual(['food-mar', 'housing-mar']);
  });

  it('filters the transaction feed to a specific category', () => {
    expect(
      buildAnalyticsExpenseTransactions({
        transactions,
        months: ['2026-02', '2026-03'],
        monthStartDay: 1,
        selectedCategoryId: 'food',
      }).map((transaction) => transaction.id),
    ).toEqual(['food-mar', 'food-feb']);
  });
});
