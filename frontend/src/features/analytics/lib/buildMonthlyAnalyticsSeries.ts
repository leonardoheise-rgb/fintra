import { getMonthKey } from '../../../shared/lib/date/months';
import { resolveEffectiveBudgets } from '../../budgets/lib/effectiveBudgetResolver';
import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  TransactionRecord,
} from '../../finance/finance.types';
import type { MonthlyAnalyticsPoint } from '../analytics.types';

type BuildMonthlyAnalyticsSeriesSource = {
  budgets: BudgetRecord[];
  budgetOverrides: BudgetOverrideRecord[];
  categories: CategoryRecord[];
  months: string[];
  transactions: TransactionRecord[];
};

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function calculateSavingsRate(income: number, netBalance: number) {
  if (income <= 0) {
    return 0;
  }

  return (netBalance / income) * 100;
}

export function buildMonthlyAnalyticsSeries({
  budgets,
  budgetOverrides,
  categories,
  months,
  transactions,
}: BuildMonthlyAnalyticsSeriesSource): MonthlyAnalyticsPoint[] {
  return months.map((month) => {
    const monthlyTransactions = transactions.filter((transaction) => getMonthKey(transaction.date) === month);
    const income = sumValues(
      monthlyTransactions
        .filter((transaction) => transaction.type === 'income')
        .map((transaction) => transaction.amount),
    );
    const expenses = sumValues(
      monthlyTransactions
        .filter((transaction) => transaction.type === 'expense')
        .map((transaction) => transaction.amount),
    );
    const netBalance = income - expenses;
    const effectiveBudget = sumValues(
      resolveEffectiveBudgets(budgets, budgetOverrides, month)
        .filter((budget) => categories.some((category) => category.id === budget.categoryId))
        .map((budget) => budget.effectiveAmount),
    );

    return {
      month,
      income,
      expenses,
      netBalance,
      effectiveBudget,
      remainingBudget: effectiveBudget - expenses,
      savingsRate: calculateSavingsRate(income, netBalance),
      transactionCount: monthlyTransactions.length,
    };
  });
}
