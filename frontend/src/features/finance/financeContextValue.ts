import { createContext } from 'react';

import type {
  BudgetInput,
  BudgetOverrideInput,
  CategoryInput,
  FinanceWorkspace,
  MonthReviewInput,
  SetAsideInput,
  SubcategoryInput,
  TransactionInput,
} from './finance.types';

export type FinanceDataStatus = 'loading' | 'ready';

export type FinanceDataContextValue = FinanceWorkspace & {
  status: FinanceDataStatus;
  errorMessage: string | null;
  refresh(): Promise<void>;
  clearError(): void;
  createCategory(input: CategoryInput): Promise<void>;
  updateCategory(categoryId: string, input: CategoryInput): Promise<void>;
  deleteCategory(categoryId: string): Promise<void>;
  createSubcategory(input: SubcategoryInput): Promise<void>;
  updateSubcategory(subcategoryId: string, input: SubcategoryInput): Promise<void>;
  deleteSubcategory(subcategoryId: string): Promise<void>;
  createTransaction(input: TransactionInput): Promise<void>;
  updateTransaction(transactionId: string, input: TransactionInput): Promise<void>;
  deleteTransaction(transactionId: string): Promise<void>;
  createSetAside(input: SetAsideInput): Promise<void>;
  discardSetAside(setAsideId: string): Promise<void>;
  convertSetAsideToTransaction(setAsideId: string): Promise<void>;
  createBudget(input: BudgetInput): Promise<void>;
  updateBudget(budgetId: string, input: BudgetInput): Promise<void>;
  deleteBudget(budgetId: string): Promise<void>;
  createBudgetOverride(input: BudgetOverrideInput): Promise<void>;
  updateBudgetOverride(budgetOverrideId: string, input: BudgetOverrideInput): Promise<void>;
  deleteBudgetOverride(budgetOverrideId: string): Promise<void>;
  saveMonthReview(input: MonthReviewInput): Promise<void>;
};

export const FinanceDataContext = createContext<FinanceDataContextValue | undefined>(undefined);
