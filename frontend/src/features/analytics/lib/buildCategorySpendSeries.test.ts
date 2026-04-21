import { describe, expect, it } from 'vitest';

import type { CategorySpendingTrend } from '../analytics.types';
import { buildCategorySpendSeries } from './buildCategorySpendSeries';

const trends: CategorySpendingTrend[] = [
  {
    categoryId: 'food',
    categoryName: 'Food and dining',
    totalSpent: 500,
    averageMonthlySpent: 250,
    currentMonthSpent: 300,
    previousMonthSpent: 200,
    changeFromPreviousMonth: 100,
    monthlyPoints: [
      { month: '2026-02', amount: 200 },
      { month: '2026-03', amount: 300 },
    ],
  },
  {
    categoryId: 'housing',
    categoryName: 'Housing',
    totalSpent: 2100,
    averageMonthlySpent: 1050,
    currentMonthSpent: 1100,
    previousMonthSpent: 1000,
    changeFromPreviousMonth: 100,
    monthlyPoints: [
      { month: '2026-02', amount: 1000 },
      { month: '2026-03', amount: 1100 },
    ],
  },
];

describe('buildCategorySpendSeries', () => {
  it('builds an aggregate series when all categories are selected', () => {
    expect(
      buildCategorySpendSeries({
        selectedCategoryId: null,
        trends,
        months: ['2026-02', '2026-03'],
      }),
    ).toEqual({
      categoryId: null,
      categoryName: 'All categories',
      totalSpent: 2600,
      monthlyPoints: [
        { month: '2026-02', amount: 1200 },
        { month: '2026-03', amount: 1400 },
      ],
    });
  });

  it('returns the selected category series when a category filter is active', () => {
    expect(
      buildCategorySpendSeries({
        selectedCategoryId: 'food',
        trends,
        months: ['2026-02', '2026-03'],
      }),
    ).toEqual({
      categoryId: 'food',
      categoryName: 'Food and dining',
      totalSpent: 500,
      monthlyPoints: [
        { month: '2026-02', amount: 200 },
        { month: '2026-03', amount: 300 },
      ],
    });
  });
});
