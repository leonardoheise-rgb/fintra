export type BudgetCard = {
  id: string;
  name: string;
  shortLabel: string;
  defaultBudget: number;
  spent: number;
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
