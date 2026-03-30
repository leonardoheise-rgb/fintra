export type BudgetCard = {
  id: string;
  name: string;
  shortLabel: string;
  defaultBudget: number;
  effectiveBudget: number;
  spent: number;
  overrideAmount: number | null;
  isOverridden: boolean;
};

export type CategoryAvailability = {
  id: string;
  name: string;
  available: number;
  budget: number;
  spent: number;
};

export type DashboardSnapshot = {
  month: string;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  remainingBalance: number;
  totalAvailable: number;
  averageMonthlyExpenses: number;
  insight: string;
  cards: BudgetCard[];
  categoryAvailability: CategoryAvailability[];
};
