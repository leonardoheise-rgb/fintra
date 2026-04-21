import { describe, expect, it } from 'vitest';

import type { MonthReviewRecord, SetAsideRecord, TransactionRecord } from '../../finance/finance.types';
import { calculateLiveAvailableAmount } from './calculateLiveAvailableAmount';

const transactions: TransactionRecord[] = [
  {
    id: 'income',
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
    id: 'expense',
    amount: 2280,
    type: 'expense',
    categoryId: 'housing',
    subcategoryId: null,
    date: '2026-03-05',
    description: 'Expenses',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
];

const setAsides: SetAsideRecord[] = [
  {
    id: 'set-aside',
    amount: 120,
    categoryId: 'food',
    subcategoryId: null,
    date: '2026-03-20',
    description: 'Reserved',
  },
];

const monthReview: MonthReviewRecord = {
  month: '2026-03',
  plannedIncomeAmount: 400,
  plannedIncomeDescription: 'Freelance',
  carryOverAmount: -50,
  reviewedAt: '2026-03-01T12:00:00.000Z',
};

describe('calculateLiveAvailableAmount', () => {
  it('returns the live available amount for the topbar balance', () => {
    expect(
      calculateLiveAvailableAmount({
        transactions,
        setAsides,
        monthReview,
      }),
    ).toBe(4450);
  });
});
