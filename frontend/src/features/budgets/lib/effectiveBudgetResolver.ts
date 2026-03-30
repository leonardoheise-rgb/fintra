import type {
  BudgetOverrideRecord,
  BudgetRecord,
} from '../../finance/finance.types';

export type EffectiveBudgetRecord = {
  id: string;
  budgetId: string;
  overrideId: string | null;
  categoryId: string;
  subcategoryId: string | null;
  defaultAmount: number;
  effectiveAmount: number;
  overrideAmount: number | null;
  month: string;
  isOverridden: boolean;
};

export function getBudgetScopeKey(
  categoryId: string,
  subcategoryId: string | null,
) {
  return `${categoryId}::${subcategoryId ?? 'root'}`;
}

export function isValidBudgetMonth(month: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function resolveEffectiveBudgets(
  budgets: BudgetRecord[],
  budgetOverrides: BudgetOverrideRecord[],
  month: string,
): EffectiveBudgetRecord[] {
  const overridesByScope = new Map(
    budgetOverrides
      .filter((item) => item.month === month)
      .map((item) => [getBudgetScopeKey(item.categoryId, item.subcategoryId), item]),
  );

  return budgets.map((budget) => {
    const matchingOverride =
      overridesByScope.get(getBudgetScopeKey(budget.categoryId, budget.subcategoryId)) ?? null;

    return {
      id: matchingOverride?.id ?? budget.id,
      budgetId: budget.id,
      overrideId: matchingOverride?.id ?? null,
      categoryId: budget.categoryId,
      subcategoryId: budget.subcategoryId,
      defaultAmount: budget.amount,
      effectiveAmount: matchingOverride?.amount ?? budget.amount,
      overrideAmount: matchingOverride?.amount ?? null,
      month,
      isOverridden: Boolean(matchingOverride),
    };
  });
}

export function findBudgetForOverrideScope(
  budgets: BudgetRecord[],
  categoryId: string,
  subcategoryId: string | null,
) {
  return (
    budgets.find(
      (item) =>
        item.categoryId === categoryId && item.subcategoryId === subcategoryId,
    ) ?? null
  );
}
