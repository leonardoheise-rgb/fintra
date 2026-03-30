import { describe, expect, it } from 'vitest';

import type { CategoryRecord, TransactionRecord } from '../../finance/finance.types';
import { buildCategorySpendingTrends } from './buildCategorySpendingTrends';

const categories: CategoryRecord[] = [
  { id: 'category-housing', name: 'Housing' },
  { id: 'category-food', name: 'Food and dining' },
  { id: 'category-transport', name: 'Transport' },
];

const transactions: TransactionRecord[] = [
  {
    id: 'rent-jan',
    amount: 2100,
    type: 'expense',
    categoryId: 'category-housing',
    subcategoryId: null,
    date: '2026-01-03',
    description: 'Rent',
  },
  {
    id: 'food-jan',
    amount: 180,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-01-10',
    description: 'Food',
  },
  {
    id: 'food-feb',
    amount: 240,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-02-08',
    description: 'Food',
  },
];

describe('buildCategorySpendingTrends', () => {
  it('groups expense trends by category across the selected months', () => {
    expect(
      buildCategorySpendingTrends({
        categories,
        months: ['2026-01', '2026-02'],
        transactions,
      }),
    ).toEqual([
      {
        categoryId: 'category-housing',
        categoryName: 'Housing',
        totalSpent: 2100,
        averageMonthlySpent: 1050,
        currentMonthSpent: 0,
        previousMonthSpent: 2100,
        changeFromPreviousMonth: -2100,
        monthlyPoints: [
          { month: '2026-01', amount: 2100 },
          { month: '2026-02', amount: 0 },
        ],
      },
      {
        categoryId: 'category-food',
        categoryName: 'Food and dining',
        totalSpent: 420,
        averageMonthlySpent: 210,
        currentMonthSpent: 240,
        previousMonthSpent: 180,
        changeFromPreviousMonth: 60,
        monthlyPoints: [
          { month: '2026-01', amount: 180 },
          { month: '2026-02', amount: 240 },
        ],
      },
    ]);
  });
});
