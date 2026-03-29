import { createContext } from 'react';

import type {
  CategoryInput,
  FinanceWorkspace,
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
};

export const FinanceDataContext = createContext<FinanceDataContextValue | undefined>(undefined);
