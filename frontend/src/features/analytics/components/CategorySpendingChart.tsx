import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { translateAppText } from '../../../shared/i18n/appText';
import type { CategorySpendSeries } from '../analytics.types';

type CategorySpendingChartProps = {
  series: CategorySpendSeries;
};

function getMaxValue(series: CategorySpendSeries) {
  return Math.max(...series.monthlyPoints.map((point) => point.amount), 1);
}

export function CategorySpendingChart({ series }: CategorySpendingChartProps) {
  const maxValue = getMaxValue(series);
  const hasSpend = series.monthlyPoints.some((point) => point.amount > 0);
  const title =
    series.categoryId === null
      ? translateAppText('analytics.spendingOverTime')
      : translateAppText('analytics.filteredCategoryTrend', {
          category: series.categoryName,
        });

  return (
    <section className="finance-panel analytics-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('analytics.spendingTrend')}</p>
          <h2>{title}</h2>
        </div>
        <p className="analytics-panel__caption">{translateAppText('analytics.monthlySpendBars')}</p>
      </div>

      {!hasSpend ? (
        <p className="finance-empty-state">{translateAppText('analytics.noCategorySeries')}</p>
      ) : (
        <div className="analytics-chart analytics-chart--single">
          {series.monthlyPoints.map((point) => (
            <article className="analytics-chart__group" key={point.month}>
              <div className="analytics-chart__bars analytics-chart__bars--single">
                <div
                  className="analytics-chart__bar analytics-chart__bar--spend"
                  style={{ height: `${(point.amount / maxValue) * 100}%` }}
                  title={formatCurrency(point.amount)}
                />
              </div>
              <div className="analytics-chart__labels">
                <strong>{formatMonthLabel(point.month)}</strong>
                <span>{formatCurrency(point.amount)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
