import { sortTransactionsByDateDesc } from '../../finance/lib/financeSelectors';
import type { TransactionRecord } from '../../finance/finance.types';
import type { BudgetCard } from '../dashboard.types';

type CategoryHighlightInput = Pick<BudgetCard, 'id' | 'effectiveBudget' | 'spent' | 'reserved'>;

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function getMonthBounds(month: string, monthStartDay: number) {
  const [yearText, monthText] = month.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return null;
  }

  const startDay = Math.min(monthStartDay, new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate());
  const nextMonthDate = new Date(Date.UTC(year, monthIndex + 1, 1));
  const nextStartDay = Math.min(
    monthStartDay,
    new Date(Date.UTC(nextMonthDate.getUTCFullYear(), nextMonthDate.getUTCMonth() + 1, 0)).getUTCDate(),
  );

  return {
    start: Date.UTC(year, monthIndex, startDay),
    end: Date.UTC(nextMonthDate.getUTCFullYear(), nextMonthDate.getUTCMonth(), nextStartDay),
  };
}

function getRemainingDays(month: string, monthStartDay: number, now: Date) {
  const monthBounds = getMonthBounds(month, monthStartDay);

  if (!monthBounds || monthBounds.end <= monthBounds.start) {
    return 0;
  }

  const dayDuration = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(Math.round((monthBounds.end - monthBounds.start) / dayDuration), 1);
  const nowAtUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  if (nowAtUtcMidnight < monthBounds.start) {
    return totalDays;
  }

  if (nowAtUtcMidnight >= monthBounds.end) {
    return 0;
  }

  const elapsedDays = Math.min(
    Math.floor((nowAtUtcMidnight - monthBounds.start) / dayDuration) + 1,
    totalDays,
  );

  /**
   * Keep the current day in scope so the last day of the month still yields one
   * spending window instead of dropping to zero before the day is over.
   */
  return Math.max(totalDays - elapsedDays + 1, 1);
}

function calculateRecentExpenseAverage(
  transactions: TransactionRecord[],
  categoryId: string,
  now: Date,
) {
  const todayIsoDate = now.toISOString().slice(0, 10);
  const recentExpenses = sortTransactionsByDateDesc(
    transactions.filter(
      (transaction) =>
        transaction.categoryId === categoryId &&
        transaction.type === 'expense' &&
        transaction.date <= todayIsoDate,
    ),
  ).slice(0, 5);

  if (recentExpenses.length === 0) {
    return 0;
  }

  return sumValues(recentExpenses.map((transaction) => transaction.amount)) / recentExpenses.length;
}

export function calculateCategoryTodayAvailableToSpend(
  card: CategoryHighlightInput,
  allTransactions: TransactionRecord[],
  month: string,
  monthStartDay: number,
  now = new Date(),
) {
  const remainingDays = getRemainingDays(month, monthStartDay, now);

  if (remainingDays === 0) {
    return 0;
  }

  const remainingCategoryAmount = card.effectiveBudget - card.spent - card.reserved;

  if (remainingCategoryAmount <= 0) {
    return 0;
  }

  const dailyAvailableAmount = remainingCategoryAmount / remainingDays;
  const recentExpenseAverage = calculateRecentExpenseAverage(allTransactions, card.id, now);

  if (dailyAvailableAmount < recentExpenseAverage) {
    return 0;
  }

  return dailyAvailableAmount;
}
