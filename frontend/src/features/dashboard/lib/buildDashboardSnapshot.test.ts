import { buildDashboardSnapshot, filterTransactionsByMonth } from './buildDashboardSnapshot';
import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  MonthReviewRecord,
  SetAsideRecord,
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
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-rent',
    amount: 2100,
    type: 'expense',
    categoryId: 'category-housing',
    subcategoryId: null,
    date: '2026-03-03',
    description: 'Rent',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-grocery',
    amount: 180,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-05',
    description: 'Groceries',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transaction-feb-food',
    amount: 220,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-02-11',
    description: 'February groceries',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
];

const setAsides: SetAsideRecord[] = [
  {
    id: 'set-aside-food',
    amount: 120,
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-22',
    description: 'Birthday dinner',
  },
];

const monthReviews: MonthReviewRecord[] = [
  {
    month: '2026-03',
    plannedIncomeAmount: 400,
    plannedIncomeDescription: 'Freelance project',
    carryOverAmount: -50,
    reviewedAt: '2026-03-01T12:00:00.000Z',
  },
];

describe('buildDashboardSnapshot', () => {
  it('filters transactions by month', () => {
    expect(filterTransactionsByMonth(transactions, '2026-03')).toHaveLength(3);
    expect(filterTransactionsByMonth(transactions, '2026-02')).toHaveLength(1);
  });

  it('uses the configured month start day when grouping transactions', () => {
    expect(filterTransactionsByMonth(transactions, '2026-02', 15)).toHaveLength(3);
    expect(filterTransactionsByMonth(transactions, '2026-03', 15)).toHaveLength(0);
  });

  it('calculates monthly totals and category budget cards', () => {
    const snapshot = buildDashboardSnapshot(
      {
        categories,
        budgets,
        budgetOverrides,
        transactions,
        setAsides,
        monthReviews,
      },
      '2026-03',
    );

    expect(snapshot.totalBudget).toBe(3250);
    expect(snapshot.totalIncome).toBe(6500);
    expect(snapshot.plannedIncome).toBe(400);
    expect(snapshot.carryOverAmount).toBe(-50);
    expect(snapshot.totalExpenses).toBe(2280);
    expect(snapshot.totalReserved).toBe(120);
    expect(snapshot.remainingBudget).toBe(850);
    expect(snapshot.remainingBalance).toBe(4570);
    expect(snapshot.totalAvailable).toBe(3600);
    expect(snapshot.averageMonthlyExpenses).toBe(1250);
    expect(snapshot.categoryAvailability).toEqual([
      {
        id: 'category-housing',
        name: 'Housing',
        available: 400,
        budget: 2500,
        spent: 2100,
        reserved: 0,
      },
      {
        id: 'category-food',
        name: 'Food and dining',
        available: 450,
        budget: 750,
        spent: 180,
        reserved: 120,
      },
    ]);
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
        reserved: 0,
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
        reserved: 120,
      },
    ]);
  });

  it('uses the spent amount once a category goes over budget', () => {
    const snapshot = buildDashboardSnapshot(
      {
        categories,
        budgets,
        budgetOverrides,
        transactions: [
          ...transactions,
          {
            id: 'transaction-food-extra',
            amount: 700,
            type: 'expense',
            categoryId: 'category-food',
            subcategoryId: null,
            date: '2026-03-12',
            description: 'Extra dining',
            installmentGroupId: null,
            installmentIndex: null,
            installmentCount: null,
          },
        ],
        setAsides,
        monthReviews,
      },
      '2026-03',
    );

    expect(snapshot.totalAvailable).toBe(3470);
    expect(snapshot.categoryAvailability).toContainEqual({
        id: 'category-food',
        name: 'Food and dining',
        available: -250,
        budget: 750,
        spent: 880,
        reserved: 120,
      });
  });

  it('returns an onboarding insight when no budgets exist yet', () => {
    const snapshot = buildDashboardSnapshot(
      {
        categories,
        budgets: [],
        budgetOverrides: [],
        transactions,
        setAsides: [],
        monthReviews: [],
      },
      '2026-03',
    );

    expect(snapshot.insight).toMatch(/set your first default budget/i);
  });
});
