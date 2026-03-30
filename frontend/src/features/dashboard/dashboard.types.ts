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

export type DashboardSnapshot = {
  month: string;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  remainingBalance: number;
  averageMonthlyExpenses: number;
  insight: string;
  cards: BudgetCard[];
};
