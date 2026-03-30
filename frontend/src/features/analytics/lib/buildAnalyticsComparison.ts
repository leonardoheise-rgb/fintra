import type { AnalyticsComparison, MonthlyAnalyticsPoint } from '../analytics.types';

function calculateAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function calculateDelta(currentValue: number | null, previousValue: number | null) {
  if (currentValue === null || previousValue === null) {
    return null;
  }

  return currentValue - previousValue;
}

export function buildAnalyticsComparison(
  monthlyPoints: MonthlyAnalyticsPoint[],
): AnalyticsComparison {
  const currentPoint = monthlyPoints[monthlyPoints.length - 1] ?? null;
  const previousPoint = monthlyPoints[monthlyPoints.length - 2] ?? null;

  return {
    currentMonth: currentPoint?.month ?? null,
    previousMonth: previousPoint?.month ?? null,
    incomeDelta: calculateDelta(currentPoint?.income ?? null, previousPoint?.income ?? null),
    expenseDelta: calculateDelta(currentPoint?.expenses ?? null, previousPoint?.expenses ?? null),
    netBalanceDelta: calculateDelta(
      currentPoint?.netBalance ?? null,
      previousPoint?.netBalance ?? null,
    ),
    savingsRateDelta: calculateDelta(
      currentPoint?.savingsRate ?? null,
      previousPoint?.savingsRate ?? null,
    ),
    averageIncome: calculateAverage(monthlyPoints.map((point) => point.income)),
    averageExpenses: calculateAverage(monthlyPoints.map((point) => point.expenses)),
    averageNetBalance: calculateAverage(monthlyPoints.map((point) => point.netBalance)),
    averageSavingsRate: calculateAverage(monthlyPoints.map((point) => point.savingsRate)),
  };
}
