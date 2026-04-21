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

function buildLinePath(series: CategorySpendSeries, maxValue: number) {
  if (series.monthlyPoints.length === 0) {
    return '';
  }

  return series.monthlyPoints
    .map((point, index) => {
      const x =
        series.monthlyPoints.length === 1 ? 50 : (index / (series.monthlyPoints.length - 1)) * 100;
      const y = 100 - (point.amount / maxValue) * 100;

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function CategorySpendingChart({ series }: CategorySpendingChartProps) {
  const maxValue = getMaxValue(series);
  const hasSpend = series.monthlyPoints.some((point) => point.amount > 0);
  const linePath = buildLinePath(series, maxValue);
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
        <div className="analytics-line-chart">
          <svg
            aria-label={title}
            className="analytics-line-chart__svg"
            role="img"
            viewBox="0 0 100 100"
          >
            <path className="analytics-line-chart__grid" d="M 0 100 L 100 100" />
            <path className="analytics-line-chart__grid" d="M 0 66.6 L 100 66.6" />
            <path className="analytics-line-chart__grid" d="M 0 33.3 L 100 33.3" />
            <path className="analytics-line-chart__path" d={linePath} />
            {series.monthlyPoints.map((point, index) => {
              const x =
                series.monthlyPoints.length === 1
                  ? 50
                  : (index / (series.monthlyPoints.length - 1)) * 100;
              const y = 100 - (point.amount / maxValue) * 100;

              return (
                <circle
                  className="analytics-line-chart__point"
                  cx={x}
                  cy={y}
                  key={point.month}
                  r="2.2"
                >
                  <title>{`${formatMonthLabel(point.month)}: ${formatCurrency(point.amount)}`}</title>
                </circle>
              );
            })}
          </svg>

          <div className="analytics-line-chart__labels">
            {series.monthlyPoints.map((point) => (
              <div className="analytics-line-chart__label" key={point.month}>
                <strong>{formatMonthLabel(point.month)}</strong>
                <span>{formatCurrency(point.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
