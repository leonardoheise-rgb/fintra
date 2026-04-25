export type TransactionType = 'income' | 'expense';

export type CategoryRecord = {
  id: string;
  name: string;
  icon: string | null;
};

export type SubcategoryRecord = {
  id: string;
  categoryId: string;
  name: string;
  icon: string | null;
};

export type TransactionRecord = {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  subcategoryId: string | null;
  date: string;
  recordedAt?: string;
  description: string;
  installmentGroupId: string | null;
  installmentIndex: number | null;
  installmentCount: number | null;
};

export type SetAsideRecord = {
  id: string;
  amount: number;
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

export type BudgetOverrideRecord = {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  month: string;
  amount: number;
};

export type MonthReviewRecord = {
  month: string;
  plannedIncomeAmount: number;
  plannedIncomeDescription: string;
  carryOverAmount: number;
  reviewedAt: string;
};

export type FinanceWorkspace = {
  categories: CategoryRecord[];
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
  setAsides: SetAsideRecord[];
  budgets: BudgetRecord[];
  budgetOverrides: BudgetOverrideRecord[];
  monthReviews: MonthReviewRecord[];
};

export type CategoryInput = {
  name: string;
  icon?: string | null;
};

export type SubcategoryInput = {
  categoryId: string;
  name: string;
  icon?: string | null;
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

export type SetAsideInput = {
  amount: number;
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

export type BudgetOverrideInput = {
  categoryId: string;
  subcategoryId: string | null;
  month: string;
  amount: number;
};

export type MonthReviewInput = {
  month: string;
  plannedIncomeAmount: number;
  plannedIncomeDescription: string;
  carryOverAmount: number;
};
