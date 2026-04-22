import { calculateCategoryTodayAvailableToSpend } from './categoryHighlights';
import type { TransactionRecord } from '../../finance/finance.types';

const baseTransactions: TransactionRecord[] = [
  {
    id: 'transaction-1',
    amount: 90,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-18',
    description: 'Groceries',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-2',
    amount: 80,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-14',
    description: 'Lunch',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-3',
    amount: 70,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-10',
    description: 'Dinner',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-4',
    amount: 60,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-08',
    description: 'Cafe',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-5',
    amount: 50,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-04',
    description: 'Snacks',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-other-category',
    amount: 500,
    type: 'expense',
    categoryId: 'category-housing',
    subcategoryId: null,
    date: '2026-03-19',
    description: 'Rent',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
];

describe('calculateCategoryTodayAvailableToSpend', () => {
  it('divides the remaining category amount by the inclusive days left in the month', () => {
    expect(
      calculateCategoryTodayAvailableToSpend(
        {
          id: 'category-food',
          effectiveBudget: 1200,
          spent: 300,
          reserved: 0,
        },
        baseTransactions,
        '2026-03',
        1,
        new Date('2026-03-20T12:00:00.000Z'),
      ),
    ).toBe(75);
  });

  it('returns zero when the daily allowance is below the average of the last five expenses in the category', () => {
    expect(
      calculateCategoryTodayAvailableToSpend(
        {
          id: 'category-food',
          effectiveBudget: 700,
          spent: 300,
          reserved: 0,
        },
        baseTransactions,
        '2026-03',
        1,
        new Date('2026-03-20T12:00:00.000Z'),
      ),
    ).toBe(0);
  });

  it('returns zero after the selected month has already ended', () => {
    expect(
      calculateCategoryTodayAvailableToSpend(
        {
          id: 'category-food',
          effectiveBudget: 1200,
          spent: 300,
          reserved: 0,
        },
        baseTransactions,
        '2026-03',
        1,
        new Date('2026-04-03T12:00:00.000Z'),
      ),
    ).toBe(0);
  });
});
