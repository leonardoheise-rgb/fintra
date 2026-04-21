import type { CategorySpendSeries, CategorySpendingTrend } from '../analytics.types';

type BuildCategorySpendSeriesOptions = {
  selectedCategoryId: string | null;
  trends: CategorySpendingTrend[];
  months: string[];
};

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function buildCategorySpendSeries({
  selectedCategoryId,
  trends,
  months,
}: BuildCategorySpendSeriesOptions): CategorySpendSeries {
  if (!selectedCategoryId) {
    const monthlyPoints = months.map((month) => ({
      month,
      amount: sumValues(
        trends.map(
          (trend) => trend.monthlyPoints.find((point) => point.month === month)?.amount ?? 0,
        ),
      ),
    }));

    return {
      categoryId: null,
      categoryName: 'All categories',
      monthlyPoints,
      totalSpent: sumValues(monthlyPoints.map((point) => point.amount)),
    };
  }

  const selectedTrend = trends.find((trend) => trend.categoryId === selectedCategoryId);

  if (!selectedTrend) {
    return {
      categoryId: selectedCategoryId,
      categoryName: 'Unknown category',
      monthlyPoints: months.map((month) => ({
        month,
        amount: 0,
      })),
      totalSpent: 0,
    };
  }

  return {
    categoryId: selectedTrend.categoryId,
    categoryName: selectedTrend.categoryName,
    monthlyPoints: selectedTrend.monthlyPoints,
    totalSpent: selectedTrend.totalSpent,
  };
}
