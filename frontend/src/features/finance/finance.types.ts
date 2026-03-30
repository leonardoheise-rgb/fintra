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
};

export type BudgetRecord = {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  amount: number;
};

export type FinanceWorkspace = {
  categories: CategoryRecord[];
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
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
};

export type BudgetInput = {
  categoryId: string;
  subcategoryId: string | null;
  amount: number;
};
