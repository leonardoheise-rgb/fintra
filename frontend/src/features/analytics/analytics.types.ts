export type AnalyticsRangePreset = '3m' | '6m' | '12m' | 'custom';

export type AnalyticsRange = {
  preset: AnalyticsRangePreset;
  startMonth: string;
  endMonth: string;
  months: string[];
};

export type MonthlyAnalyticsPoint = {
  month: string;
  income: number;
  expenses: number;
  netBalance: number;
  effectiveBudget: number;
  remainingBudget: number;
  savingsRate: number;
  transactionCount: number;
};

export type AnalyticsComparison = {
  currentMonth: string | null;
  previousMonth: string | null;
  incomeDelta: number | null;
  expenseDelta: number | null;
  netBalanceDelta: number | null;
  savingsRateDelta: number | null;
  averageIncome: number;
  averageExpenses: number;
  averageNetBalance: number;
  averageSavingsRate: number;
};

export type CategoryTrendPoint = {
  month: string;
  amount: number;
};

export type CategorySpendingTrend = {
  categoryId: string;
  categoryName: string;
  totalSpent: number;
  averageMonthlySpent: number;
  currentMonthSpent: number;
  previousMonthSpent: number;
  changeFromPreviousMonth: number | null;
  monthlyPoints: CategoryTrendPoint[];
};
