import type {
  BudgetInput,
  BudgetOverrideInput,
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryInput,
  CategoryRecord,
  FinanceWorkspace,
  SubcategoryInput,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';

export interface FinanceService {
  getWorkspace(): Promise<FinanceWorkspace>;
  createCategory(input: CategoryInput): Promise<CategoryRecord>;
  updateCategory(categoryId: string, input: CategoryInput): Promise<CategoryRecord>;
  deleteCategory(categoryId: string): Promise<void>;
  createSubcategory(input: SubcategoryInput): Promise<SubcategoryRecord>;
  updateSubcategory(subcategoryId: string, input: SubcategoryInput): Promise<SubcategoryRecord>;
  deleteSubcategory(subcategoryId: string): Promise<void>;
  createTransaction(input: TransactionInput): Promise<TransactionRecord>;
  updateTransaction(transactionId: string, input: TransactionInput): Promise<TransactionRecord>;
  deleteTransaction(transactionId: string): Promise<void>;
  createBudget(input: BudgetInput): Promise<BudgetRecord>;
  updateBudget(budgetId: string, input: BudgetInput): Promise<BudgetRecord>;
  deleteBudget(budgetId: string): Promise<void>;
  createBudgetOverride(input: BudgetOverrideInput): Promise<BudgetOverrideRecord>;
  updateBudgetOverride(
    budgetOverrideId: string,
    input: BudgetOverrideInput,
  ): Promise<BudgetOverrideRecord>;
  deleteBudgetOverride(budgetOverrideId: string): Promise<void>;
}
