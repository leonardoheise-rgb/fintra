import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { formatPercentage } from '../../../shared/lib/formatters/percentage';
import type { AnalyticsComparison } from '../analytics.types';

type AnalyticsComparisonPanelProps = {
  comparison: AnalyticsComparison;
};

function formatDelta(value: number | null, formatter: (value: number) => string) {
  if (value === null) {
    return 'No prior month';
  }

  const prefix = value > 0 ? '+' : '';

  return `${prefix}${formatter(value)}`;
}

export function AnalyticsComparisonPanel({
  comparison,
}: AnalyticsComparisonPanelProps) {
  return (
    <section className="finance-panel analytics-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Comparison engine</p>
          <h2>Current month versus previous</h2>
        </div>
        <p className="analytics-panel__caption">
          {comparison.currentMonth
            ? `${formatMonthLabel(comparison.currentMonth)} compared with ${
                comparison.previousMonth ? formatMonthLabel(comparison.previousMonth) : 'the prior month'
              }`
            : 'No month selected'}
        </p>
      </div>

      <div className="analytics-comparison-grid">
        <article className="analytics-comparison-card">
          <span>Income delta</span>
          <strong>{formatDelta(comparison.incomeDelta, formatCurrency)}</strong>
        </article>
        <article className="analytics-comparison-card">
          <span>Expense delta</span>
          <strong>{formatDelta(comparison.expenseDelta, formatCurrency)}</strong>
        </article>
        <article className="analytics-comparison-card">
          <span>Net balance delta</span>
          <strong>{formatDelta(comparison.netBalanceDelta, formatCurrency)}</strong>
        </article>
        <article className="analytics-comparison-card">
          <span>Savings rate delta</span>
          <strong>{formatDelta(comparison.savingsRateDelta, formatPercentage)}</strong>
        </article>
      </div>

      <div className="analytics-comparison-averages">
        <p>Rolling average income: {formatCurrency(comparison.averageIncome)}</p>
        <p>Rolling average expenses: {formatCurrency(comparison.averageExpenses)}</p>
        <p>Rolling average savings rate: {formatPercentage(comparison.averageSavingsRate)}</p>
      </div>
    </section>
  );
}
