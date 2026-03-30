import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { formatPercentage } from '../../../shared/lib/formatters/percentage';
import { translateAppText } from '../../../shared/i18n/appText';
import type { AnalyticsComparison } from '../analytics.types';

type AnalyticsComparisonPanelProps = {
  comparison: AnalyticsComparison;
};

function formatDelta(value: number | null, formatter: (value: number) => string) {
  if (value === null) {
    return translateAppText('analytics.noPriorMonth');
  }

  const prefix = value > 0 ? '+' : '';

  return `${prefix}${formatter(value)}`;
}

export function AnalyticsComparisonPanel({
  comparison,
}: AnalyticsComparisonPanelProps) {
  return (
    <section className="finance-panel analytics-panel analytics-panel--feature">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('analytics.comparisonEngine')}</p>
          <h2>{translateAppText('analytics.currentVsPrevious')}</h2>
        </div>
        <p className="analytics-panel__caption">
          {comparison.currentMonth
            ? translateAppText('analytics.comparedWith', {
                current: formatMonthLabel(comparison.currentMonth),
                previous: comparison.previousMonth
                  ? formatMonthLabel(comparison.previousMonth)
                  : translateAppText('analytics.priorMonth'),
              })
            : translateAppText('analytics.noMonthSelected')}
        </p>
      </div>

      <div className="analytics-comparison-grid">
        <article className="analytics-comparison-card">
          <span>{translateAppText('analytics.incomeDelta')}</span>
          <strong>{formatDelta(comparison.incomeDelta, formatCurrency)}</strong>
        </article>
        <article className="analytics-comparison-card">
          <span>{translateAppText('analytics.expenseDelta')}</span>
          <strong>{formatDelta(comparison.expenseDelta, formatCurrency)}</strong>
        </article>
        <article className="analytics-comparison-card">
          <span>{translateAppText('analytics.netBalanceDelta')}</span>
          <strong>{formatDelta(comparison.netBalanceDelta, formatCurrency)}</strong>
        </article>
        <article className="analytics-comparison-card">
          <span>{translateAppText('analytics.savingsRateDelta')}</span>
          <strong>{formatDelta(comparison.savingsRateDelta, formatPercentage)}</strong>
        </article>
      </div>

      <div className="analytics-comparison-averages">
        <p>{translateAppText('analytics.rollingAverageIncome', { value: formatCurrency(comparison.averageIncome) })}</p>
        <p>{translateAppText('analytics.rollingAverageExpenses', { value: formatCurrency(comparison.averageExpenses) })}</p>
        <p>{translateAppText('analytics.rollingAverageSavingsRate', { value: formatPercentage(comparison.averageSavingsRate) })}</p>
      </div>
    </section>
  );
}
