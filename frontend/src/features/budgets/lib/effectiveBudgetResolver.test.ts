import {
  findBudgetForOverrideScope,
  getBudgetScopeKey,
  isValidBudgetMonth,
  resolveEffectiveBudgets,
} from './effectiveBudgetResolver';
import type {
  BudgetOverrideRecord,
  BudgetRecord,
} from '../../finance/finance.types';

const budgets: BudgetRecord[] = [
  {
    id: 'budget-housing',
    categoryId: 'category-housing',
    subcategoryId: null,
    amount: 2500,
  },
  {
    id: 'budget-restaurants',
    categoryId: 'category-food',
    subcategoryId: 'subcategory-restaurants',
    amount: 220,
  },
];

const overrides: BudgetOverrideRecord[] = [
  {
    id: 'override-restaurants-march',
    categoryId: 'category-food',
    subcategoryId: 'subcategory-restaurants',
    month: '2026-03',
    amount: 320,
  },
];

describe('effectiveBudgetResolver', () => {
  it('builds stable scope keys', () => {
    expect(getBudgetScopeKey('category-housing', null)).toBe('category-housing::root');
    expect(
      getBudgetScopeKey('category-food', 'subcategory-restaurants'),
    ).toBe('category-food::subcategory-restaurants');
  });

  it('validates YYYY-MM month values', () => {
    expect(isValidBudgetMonth('2026-03')).toBe(true);
    expect(isValidBudgetMonth('2026-13')).toBe(false);
    expect(isValidBudgetMonth('03-2026')).toBe(false);
  });

  it('resolves overrides ahead of default budgets for the selected month', () => {
    const effectiveBudgets = resolveEffectiveBudgets(budgets, overrides, '2026-03');

    expect(effectiveBudgets).toEqual([
      {
        id: 'budget-housing',
        budgetId: 'budget-housing',
        overrideId: null,
        categoryId: 'category-housing',
        subcategoryId: null,
        defaultAmount: 2500,
        effectiveAmount: 2500,
        overrideAmount: null,
        month: '2026-03',
        isOverridden: false,
      },
      {
        id: 'override-restaurants-march',
        budgetId: 'budget-restaurants',
        overrideId: 'override-restaurants-march',
        categoryId: 'category-food',
        subcategoryId: 'subcategory-restaurants',
        defaultAmount: 220,
        effectiveAmount: 320,
        overrideAmount: 320,
        month: '2026-03',
        isOverridden: true,
      },
    ]);
  });

  it('falls back to defaults when the month has no matching override', () => {
    const effectiveBudgets = resolveEffectiveBudgets(budgets, overrides, '2026-04');

    expect(effectiveBudgets.every((item) => item.isOverridden === false)).toBe(true);
    expect(effectiveBudgets.map((item) => item.effectiveAmount)).toEqual([2500, 220]);
  });

  it('finds the matching default budget for an override scope', () => {
    expect(
      findBudgetForOverrideScope(
        budgets,
        'category-food',
        'subcategory-restaurants',
      )?.id,
    ).toBe('budget-restaurants');
    expect(findBudgetForOverrideScope(budgets, 'category-food', null)).toBeNull();
  });
});
