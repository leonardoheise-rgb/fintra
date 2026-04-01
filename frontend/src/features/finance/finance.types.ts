export type TransactionType = 'income' | 'expense';

export type CategoryRecord = {
  id: string;
  name: string;
};

export type SubcategoryRecord = {
  id: string;
  categoryId: string;
  name: string;
};

export type TransactionRecord = {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  subcategoryId: string | null;
  date: string;
  description: string;
  installmentGroupId: string | null;
  installmentIndex: number | null;
  installmentCount: number | null;
};

export type BudgetRecord = {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  amount: number;
};

export type BudgetOverrideRecord = {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  month: string;
  amount: number;
};

export type FinanceWorkspace = {
  categories: CategoryRecord[];
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
  budgetOverrides: BudgetOverrideRecord[];
};

export type CategoryInput = {
  name: string;
};

export type SubcategoryInput = {
  categoryId: string;
  name: string;
};

export type TransactionInput = {
  amount: number;
  type: TransactionType;
  categoryId: string;
  subcategoryId: string | null;
  date: string;
  description: string;
  installmentCount: number;
};

export type BudgetInput = {
  categoryId: string;
  subcategoryId: string | null;
  amount: number;
};

export type BudgetOverrideInput = {
  categoryId: string;
  subcategoryId: string | null;
  month: string;
  amount: number;
};
