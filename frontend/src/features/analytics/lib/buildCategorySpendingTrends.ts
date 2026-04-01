import { getMonthKey } from '../../../shared/lib/date/months';
import type { CategoryRecord, TransactionRecord } from '../../finance/finance.types';
import type { CategorySpendingTrend } from '../analytics.types';

type BuildCategorySpendingTrendsSource = {
  categories: CategoryRecord[];
  months: string[];
  monthStartDay: number;
  transactions: TransactionRecord[];
};

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function calculateAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return sumValues(values) / values.length;
}

export function buildCategorySpendingTrends({
  categories,
  months,
  monthStartDay,
  transactions,
}: BuildCategorySpendingTrendsSource): CategorySpendingTrend[] {
  return categories
    .map((category) => {
      const monthlyPoints = months.map((month) => {
        const amount = sumValues(
          transactions
            .filter(
              (transaction) =>
                transaction.type === 'expense' &&
                transaction.categoryId === category.id &&
                getMonthKey(transaction.date, monthStartDay) === month,
            )
            .map((transaction) => transaction.amount),
        );

        return {
          month,
          amount,
        };
      });
      const currentMonthSpent = monthlyPoints[monthlyPoints.length - 1]?.amount ?? 0;
      const previousMonthSpent = monthlyPoints[monthlyPoints.length - 2]?.amount ?? 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalSpent: sumValues(monthlyPoints.map((point) => point.amount)),
        averageMonthlySpent: calculateAverage(monthlyPoints.map((point) => point.amount)),
        currentMonthSpent,
        previousMonthSpent,
        changeFromPreviousMonth:
          monthlyPoints.length > 1 ? currentMonthSpent - previousMonthSpent : null,
        monthlyPoints,
      };
    })
    .filter((trend) => trend.totalSpent > 0)
    .sort(
      (left, right) =>
        right.totalSpent - left.totalSpent ||
        left.categoryName.localeCompare(right.categoryName),
    );
}
