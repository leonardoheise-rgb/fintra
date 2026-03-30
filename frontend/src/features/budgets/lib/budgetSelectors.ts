import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  SubcategoryRecord,
} from '../../finance/finance.types';
import {
  getCategoryName,
  getSubcategoryName,
} from '../../finance/lib/financeSelectors';

export function getBudgetScopeLabel(
  categories: CategoryRecord[],
  subcategories: SubcategoryRecord[],
  budget: Pick<BudgetRecord, 'categoryId' | 'subcategoryId'>,
) {
  const categoryName = getCategoryName(categories, budget.categoryId);

  if (!budget.subcategoryId) {
    return categoryName;
  }

  return `${categoryName} / ${getSubcategoryName(subcategories, budget.subcategoryId)}`;
}

export function getBudgetScopeTypeLabel(
  budget: Pick<BudgetRecord, 'subcategoryId'>,
) {
  return budget.subcategoryId
    ? translateAppText('finance.scopeSubcategoryBudget')
    : translateAppText('finance.scopeCategoryBudget');
}

export function sortBudgetsByScope(
  budgets: BudgetRecord[],
  categories: CategoryRecord[],
  subcategories: SubcategoryRecord[],
) {
  return [...budgets].sort((left, right) => {
    const leftLabel = getBudgetScopeLabel(categories, subcategories, left);
    const rightLabel = getBudgetScopeLabel(categories, subcategories, right);

    return leftLabel.localeCompare(rightLabel);
  });
}

export function calculateAllocatedBudget(budgets: BudgetRecord[]) {
  return budgets.reduce((total, budget) => total + budget.amount, 0);
}

export function calculateAllocatedOverrideBudget(
  budgetOverrides: BudgetOverrideRecord[],
) {
  return budgetOverrides.reduce((total, budgetOverride) => total + budgetOverride.amount, 0);
}

export function sortBudgetOverridesByScope(
  budgetOverrides: BudgetOverrideRecord[],
  categories: CategoryRecord[],
  subcategories: SubcategoryRecord[],
) {
  return [...budgetOverrides].sort((left, right) => {
    const leftLabel = getBudgetScopeLabel(categories, subcategories, left);
    const rightLabel = getBudgetScopeLabel(categories, subcategories, right);

    return leftLabel.localeCompare(rightLabel);
  });
}

export function formatBudgetAmount(amount: number) {
  return formatCurrency(amount);
}
