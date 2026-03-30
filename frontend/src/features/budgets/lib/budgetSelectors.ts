import { formatCurrency } from '../../../shared/lib/formatters/currency';
import type {
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
  budget: BudgetRecord,
) {
  const categoryName = getCategoryName(categories, budget.categoryId);

  if (!budget.subcategoryId) {
    return categoryName;
  }

  return `${categoryName} / ${getSubcategoryName(subcategories, budget.subcategoryId)}`;
}

export function getBudgetScopeTypeLabel(budget: BudgetRecord) {
  return budget.subcategoryId ? 'Subcategory budget' : 'Category budget';
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

export function formatBudgetAmount(amount: number) {
  return formatCurrency(amount);
}
