import { buildDashboardSnapshot, filterTransactionsByMonth } from './buildDashboardSnapshot';
import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  TransactionRecord,
} from '../../finance/finance.types';

const categories: CategoryRecord[] = [
  { id: 'category-salary', name: 'Salary' },
  { id: 'category-housing', name: 'Housing' },
  { id: 'category-food', name: 'Food and dining' },
];

const budgets: BudgetRecord[] = [
  {
    id: 'budget-housing',
    categoryId: 'category-housing',
    subcategoryId: null,
    amount: 2500,
  },
  {
    id: 'budget-food',
    categoryId: 'category-food',
    subcategoryId: null,
    amount: 600,
  },
];

const budgetOverrides: BudgetOverrideRecord[] = [
  {
    id: 'budget-override-food',
    categoryId: 'category-food',
    subcategoryId: null,
    month: '2026-03',
    amount: 750,
  },
];

const transactions: TransactionRecord[] = [
  {
    id: 'transaction-salary',
    amount: 6500,
    type: 'income',
    categoryId: 'category-salary',
    subcategoryId: null,
    date: '2026-03-01',
    description: 'Salary',
  },
  {
    id: 'transaction-rent',
    amount: 2100,
    type: 'expense',
    categoryId: 'category-housing',
    subcategoryId: null,
    date: '2026-03-03',
    description: 'Rent',
  },
  {
    id: 'transaction-grocery',
    amount: 180,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-05',
    description: 'Groceries',
  },
  {
    id: 'transaction-feb-food',
    amount: 220,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-02-11',
    description: 'February groceries',
  },
];

describe('buildDashboardSnapshot', () => {
  it('filters transactions by month', () => {
    expect(filterTransactionsByMonth(transactions, '2026-03')).toHaveLength(3);
    expect(filterTransactionsByMonth(transactions, '2026-02')).toHaveLength(1);
  });

  it('calculates monthly totals and category budget cards', () => {
    const snapshot = buildDashboardSnapshot(
      {
        categories,
        budgets,
        budgetOverrides,
        transactions,
      },
      '2026-03',
    );

    expect(snapshot.totalBudget).toBe(3250);
    expect(snapshot.totalIncome).toBe(6500);
    expect(snapshot.totalExpenses).toBe(2280);
    expect(snapshot.remainingBudget).toBe(970);
    expect(snapshot.remainingBalance).toBe(4220);
    expect(snapshot.averageMonthlyExpenses).toBe(1250);
    expect(snapshot.cards).toEqual([
      {
        id: 'category-housing',
        name: 'Housing',
        shortLabel: 'H',
        defaultBudget: 2500,
        effectiveBudget: 2500,
        overrideAmount: null,
        isOverridden: false,
        spent: 2100,
      },
      {
        id: 'category-food',
        name: 'Food and dining',
        shortLabel: 'FD',
        defaultBudget: 600,
        effectiveBudget: 750,
        overrideAmount: 750,
        isOverridden: true,
        spent: 180,
      },
    ]);
  });

  it('returns an onboarding insight when no budgets exist yet', () => {
    const snapshot = buildDashboardSnapshot(
      {
        categories,
        budgets: [],
        budgetOverrides: [],
        transactions,
      },
      '2026-03',
    );

    expect(snapshot.insight).toMatch(/set your first default budget/i);
  });
});
