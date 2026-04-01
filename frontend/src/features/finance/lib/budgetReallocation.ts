import { resolveEffectiveBudgets } from '../../budgets/lib/effectiveBudgetResolver';
import type {
  BudgetOverrideRecord,
  BudgetRecord,
} from '../finance.types';

export type BudgetAdjustmentTarget = {
  budgetId: string;
  overrideId: string | null;
  categoryId: string;
  subcategoryId: string | null;
  effectiveAmount: number;
};

function getBudgetScopeKey(categoryId: string, subcategoryId: string | null) {
  return `${categoryId}::${subcategoryId ?? 'category'}`;
}

function buildAdjustmentTarget(
  budget: BudgetRecord,
  budgetOverrides: BudgetOverrideRecord[],
  month: string,
): BudgetAdjustmentTarget {
  const effectiveBudget = resolveEffectiveBudgets([budget], budgetOverrides, month)[0];
  const matchingOverride =
    budgetOverrides.find(
      (budgetOverride) =>
        budgetOverride.month === month &&
        budgetOverride.categoryId === budget.categoryId &&
        budgetOverride.subcategoryId === budget.subcategoryId,
    ) ?? null;

  return {
    budgetId: budget.id,
    overrideId: matchingOverride?.id ?? null,
    categoryId: budget.categoryId,
    subcategoryId: budget.subcategoryId,
    effectiveAmount: effectiveBudget?.effectiveAmount ?? budget.amount,
  };
}

function sortBudgetsByPriority(budgets: BudgetRecord[]) {
  return [...budgets].sort((left, right) => {
    if (left.subcategoryId === null && right.subcategoryId !== null) {
      return -1;
    }

    if (left.subcategoryId !== null && right.subcategoryId === null) {
      return 1;
    }

    return right.amount - left.amount;
  });
}

export function findPreferredSourceBudgetTarget(
  budgets: BudgetRecord[],
  budgetOverrides: BudgetOverrideRecord[],
  month: string,
  categoryId: string,
  subcategoryId: string | null,
) {
  const exactBudget =
    budgets.find(
      (budget) =>
        budget.categoryId === categoryId &&
        budget.subcategoryId === subcategoryId,
    ) ?? null;

  if (exactBudget) {
    return buildAdjustmentTarget(exactBudget, budgetOverrides, month);
  }

  const categoryBudget =
    budgets.find(
      (budget) =>
        budget.categoryId === categoryId &&
        budget.subcategoryId === null,
    ) ?? null;

  if (categoryBudget) {
    return buildAdjustmentTarget(categoryBudget, budgetOverrides, month);
  }

  const fallbackBudget = sortBudgetsByPriority(
    budgets.filter((budget) => budget.categoryId === categoryId),
  )[0];

  return fallbackBudget
    ? buildAdjustmentTarget(fallbackBudget, budgetOverrides, month)
    : null;
}

export function findPreferredDonorBudgetTarget(
  budgets: BudgetRecord[],
  budgetOverrides: BudgetOverrideRecord[],
  month: string,
  categoryId: string,
  requiredAmount: number,
) {
  const donorBudgets = sortBudgetsByPriority(
    budgets.filter((budget) => budget.categoryId === categoryId),
  );

  for (const budget of donorBudgets) {
    const adjustmentTarget = buildAdjustmentTarget(budget, budgetOverrides, month);

    if (adjustmentTarget.effectiveAmount > requiredAmount) {
      return adjustmentTarget;
    }
  }

  return null;
}

export function getBudgetAdjustmentScopeLabel(
  categoryId: string,
  subcategoryId: string | null,
) {
  return getBudgetScopeKey(categoryId, subcategoryId);
}
