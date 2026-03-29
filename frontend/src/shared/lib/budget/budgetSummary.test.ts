import { calculateBudgetSummary } from './budgetSummary';

describe('calculateBudgetSummary', () => {
  it('returns an under-budget summary', () => {
    expect(calculateBudgetSummary({ budget: 1000, spent: 400 })).toEqual({
      remaining: 600,
      rawPercentage: 40,
      progressPercentage: 40,
      status: 'under',
    });
  });

  it('marks an exact match as fully used without being over', () => {
    expect(calculateBudgetSummary({ budget: 500, spent: 500 })).toEqual({
      remaining: 0,
      rawPercentage: 100,
      progressPercentage: 100,
      status: 'at',
    });
  });

  it('caps progress percentage for overspending while preserving the raw value', () => {
    expect(calculateBudgetSummary({ budget: 200, spent: 260 })).toEqual({
      remaining: -60,
      rawPercentage: 130,
      progressPercentage: 100,
      status: 'over',
    });
  });
});
