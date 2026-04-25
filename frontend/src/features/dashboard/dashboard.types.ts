export type BudgetCard = {
  id: string;
  name: string;
  icon: string | null;
  shortLabel: string;
  defaultBudget: number;
  effectiveBudget: number;
  spent: number;
  reserved: number;
  todayAvailableToSpend: number;
  overrideAmount: number | null;
  isOverridden: boolean;
};

export type CategoryAvailability = {
  id: string;
  name: string;
  available: number;
  budget: number;
  spent: number;
  reserved: number;
};

export type DashboardSnapshot = {
  month: string;
  totalBudget: number;
  totalIncome: number;
  plannedIncome: number;
  carryOverAmount: number;
  totalExpenses: number;
  totalReserved: number;
  remainingBudget: number;
  remainingBalance: number;
  totalAvailable: number;
  averageMonthlyExpenses: number;
  insight: string;
  cards: BudgetCard[];
  categoryAvailability: CategoryAvailability[];
};
