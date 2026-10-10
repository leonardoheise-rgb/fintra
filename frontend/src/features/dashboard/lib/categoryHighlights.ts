import { getMonthKey } from '../../../shared/lib/date/months';
import type { TransactionRecord } from '../../finance/finance.types';

export const MINIMUM_HISTORICAL_MONTHS = 3;

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

/** Uses completed financial months so the in-progress month cannot skew the average. */
export function calculateCategoryHistoricalMonthlyAverage(
  transactions: TransactionRecord[],
  categoryId: string,
  selectedMonth: string,
  monthStartDay: number,
) {
  const totalsByMonth = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.categoryId === categoryId && transaction.type === 'expense')
    .forEach((transaction) => {
      const transactionMonth = getMonthKey(transaction.date, monthStartDay);

      if (transactionMonth < selectedMonth) {
        totalsByMonth.set(
          transactionMonth,
          (totalsByMonth.get(transactionMonth) ?? 0) + transaction.amount,
        );
      }
    });

  const recentMonthlyTotals = [...totalsByMonth.entries()]
    .sort(([leftMonth], [rightMonth]) => rightMonth.localeCompare(leftMonth))
    .slice(0, MINIMUM_HISTORICAL_MONTHS)
    .map(([, total]) => total);

  return recentMonthlyTotals.length < MINIMUM_HISTORICAL_MONTHS
    ? null
    : sumValues(recentMonthlyTotals) / recentMonthlyTotals.length;
}
