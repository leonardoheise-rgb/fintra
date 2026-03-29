export type BudgetSummaryInput = {
  budget: number;
  spent: number;
};

export type BudgetSummary = {
  remaining: number;
  rawPercentage: number;
  progressPercentage: number;
  status: 'under' | 'at' | 'over';
};

/**
 * We clamp the progress meter to 100 so the UI remains readable even when the
 * user has overspent. The raw percentage is preserved for labels and analytics.
 */
export function calculateBudgetSummary({
  budget,
  spent,
}: BudgetSummaryInput): BudgetSummary {
  if (budget <= 0) {
    return {
      remaining: budget - spent,
      rawPercentage: spent > 0 ? 100 : 0,
      progressPercentage: spent > 0 ? 100 : 0,
      status: spent > 0 ? 'over' : 'at',
    };
  }

  const rawPercentage = (spent / budget) * 100;

  if (spent > budget) {
    return {
      remaining: budget - spent,
      rawPercentage,
      progressPercentage: 100,
      status: 'over',
    };
  }

  if (spent === budget) {
    return {
      remaining: 0,
      rawPercentage: 100,
      progressPercentage: 100,
      status: 'at',
    };
  }

  return {
    remaining: budget - spent,
    rawPercentage,
    progressPercentage: rawPercentage,
    status: 'under',
  };
}
