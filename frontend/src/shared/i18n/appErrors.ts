import { getErrorMessage } from '../lib/errors/getErrorMessage';
import { translateAppText } from './appText';

const errorKeyByMessage: Record<string, string> = {
  'Invalid login credentials.': 'errors.invalidLoginCredentials',
  'No active Supabase session was found. Sign out and sign in again.':
    'errors.noActiveSupabaseSession',
  'Category name is required.': 'errors.categoryNameRequired',
  'Subcategory name is required.': 'errors.subcategoryNameRequired',
  'Amount must be greater than zero.': 'errors.amountGreaterThanZero',
  'Transaction date is required.': 'errors.transactionDateRequired',
  'A category is required.': 'errors.categoryRequired',
  'Override month must use the YYYY-MM format.': 'errors.overrideMonthFormat',
  'Override amount must be greater than zero.': 'errors.overrideAmountGreaterThanZero',
  'The selected category does not exist.': 'errors.selectedCategoryMissing',
  'The selected subcategory does not exist.': 'errors.selectedSubcategoryMissing',
  'The selected subcategory does not belong to the selected category.':
    'errors.subcategoryCategoryMismatch',
  'Category names must be unique.': 'errors.categoryUnique',
  'Delete subcategories before removing this category.':
    'errors.deleteSubcategoriesBeforeCategory',
  'Delete related transactions before removing this category.':
    'errors.deleteTransactionsBeforeCategory',
  'Delete related budgets before removing this category.': 'errors.deleteBudgetsBeforeCategory',
  'Delete related budget overrides before removing this category.':
    'errors.deleteBudgetOverridesBeforeCategory',
  'Subcategory names must be unique within the same category.':
    'errors.subcategoryUniqueInCategory',
  'Delete related transactions before removing this subcategory.':
    'errors.deleteTransactionsBeforeSubcategory',
  'Delete related budgets before removing this subcategory.':
    'errors.deleteBudgetsBeforeSubcategory',
  'Delete related budget overrides before removing this subcategory.':
    'errors.deleteBudgetOverridesBeforeSubcategory',
  'The selected transaction does not exist.': 'errors.selectedTransactionMissing',
  'A default budget already exists for this scope.': 'errors.defaultBudgetAlreadyExists',
  'The selected budget does not exist.': 'errors.selectedBudgetMissing',
  'Reset related monthly overrides before changing this budget scope.':
    'errors.resetOverridesBeforeChangingBudget',
  'Delete related budget overrides before removing this budget.':
    'errors.deleteOverridesBeforeRemovingBudget',
  'Create the default budget before adding a monthly override.':
    'errors.createDefaultBudgetFirst',
  'A monthly override already exists for this scope.':
    'errors.monthlyOverrideAlreadyExists',
  'The selected budget override does not exist.':
    'errors.selectedBudgetOverrideMissing',
};

export function resolveAppErrorMessage(error: unknown, fallbackKey: string) {
  const message = getErrorMessage(error, translateAppText(fallbackKey));
  const mappedKey = errorKeyByMessage[message];

  return mappedKey ? translateAppText(mappedKey) : message;
}
