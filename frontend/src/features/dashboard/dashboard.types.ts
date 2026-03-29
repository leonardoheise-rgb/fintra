export type BudgetCard = {
  id: string;
  name: string;
  shortLabel: string;
  defaultBudget: number;
  spent: number;
  overrideBudget?: number;
};

export type DashboardSnapshot = {
  month: string;
  totalBudget: number;
  remainingFunds: number;
  averageMonthlySpend: number;
  currentDelta: number;
  insight: string;
  cards: BudgetCard[];
};
