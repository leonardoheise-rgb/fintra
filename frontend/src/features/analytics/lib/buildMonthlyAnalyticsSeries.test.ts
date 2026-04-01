import { describe, expect, it } from 'vitest';

import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  TransactionRecord,
} from '../../finance/finance.types';
import { buildMonthlyAnalyticsSeries } from './buildMonthlyAnalyticsSeries';

const categories: CategoryRecord[] = [
  { id: 'category-housing', name: 'Housing' },
  { id: 'category-food', name: 'Food and dining' },
];

const budgets: BudgetRecord[] = [
  { id: 'budget-housing', categoryId: 'category-housing', subcategoryId: null, amount: 2500 },
  { id: 'budget-food', categoryId: 'category-food', subcategoryId: null, amount: 400 },
];

const budgetOverrides: BudgetOverrideRecord[] = [
  {
    id: 'override-food-march',
    categoryId: 'category-food',
    subcategoryId: null,
    month: '2026-03',
    amount: 550,
  },
];

const transactions: TransactionRecord[] = [
  {
    id: 'salary-feb',
    amount: 6500,
    type: 'income',
    categoryId: 'category-housing',
    subcategoryId: null,
    date: '2026-02-01',
    description: 'Salary',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'rent-feb',
    amount: 2100,
    type: 'expense',
    categoryId: 'category-housing',
    subcategoryId: null,
    date: '2026-02-03',
    description: 'Rent',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'salary-mar',
    amount: 6500,
    type: 'income',
    categoryId: 'category-housing',
    subcategoryId: null,
    date: '2026-03-01',
    description: 'Salary',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'food-mar',
    amount: 320,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-10',
    description: 'Food',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
];

describe('buildMonthlyAnalyticsSeries', () => {
  it('builds month-by-month income, expense, and effective budget totals', () => {
    expect(
      buildMonthlyAnalyticsSeries({
        categories,
        budgets,
        budgetOverrides,
        months: ['2026-02', '2026-03'],
        monthStartDay: 1,
        transactions,
      }),
    ).toEqual([
      {
        month: '2026-02',
        income: 6500,
        expenses: 2100,
        netBalance: 4400,
        effectiveBudget: 2900,
        remainingBudget: 800,
        savingsRate: expect.closeTo(67.6923, 3),
        transactionCount: 2,
      },
      {
        month: '2026-03',
        income: 6500,
        expenses: 320,
        netBalance: 6180,
        effectiveBudget: 3050,
        remainingBudget: 2730,
        savingsRate: expect.closeTo(95.0769, 3),
        transactionCount: 2,
      },
    ]);
  });
});
