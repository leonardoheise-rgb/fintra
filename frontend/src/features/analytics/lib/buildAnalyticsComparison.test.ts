import { describe, expect, it } from 'vitest';

import type { MonthlyAnalyticsPoint } from '../analytics.types';
import { buildAnalyticsComparison } from './buildAnalyticsComparison';

const monthlyPoints: MonthlyAnalyticsPoint[] = [
  {
    month: '2026-01',
    income: 6000,
    expenses: 2600,
    netBalance: 3400,
    effectiveBudget: 3000,
    remainingBudget: 400,
    savingsRate: 56.7,
    transactionCount: 4,
  },
  {
    month: '2026-02',
    income: 6500,
    expenses: 2900,
    netBalance: 3600,
    effectiveBudget: 3000,
    remainingBudget: 100,
    savingsRate: 55.4,
    transactionCount: 4,
  },
];

describe('buildAnalyticsComparison', () => {
  it('calculates current versus previous month deltas and rolling averages', () => {
    expect(buildAnalyticsComparison(monthlyPoints)).toEqual({
      currentMonth: '2026-02',
      previousMonth: '2026-01',
      incomeDelta: 500,
      expenseDelta: 300,
      netBalanceDelta: 200,
      savingsRateDelta: -1.3000000000000043,
      averageIncome: 6250,
      averageExpenses: 2750,
      averageNetBalance: 3500,
      averageSavingsRate: 56.05,
    });
  });
});
