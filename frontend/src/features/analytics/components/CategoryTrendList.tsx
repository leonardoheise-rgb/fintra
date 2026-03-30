import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import type { CategorySpendingTrend } from '../analytics.types';

type CategoryTrendListProps = {
  trends: CategorySpendingTrend[];
};

function getMaxCategorySpend(trends: CategorySpendingTrend[]) {
  return Math.max(...trends.map((trend) => trend.totalSpent), 1);
}

export function CategoryTrendList({ trends }: CategoryTrendListProps) {
  const maxCategorySpend = getMaxCategorySpend(trends);

  return (
    <section className="finance-panel analytics-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Category drift</p>
          <h2>Spending by category</h2>
        </div>
        <p className="analytics-panel__caption">Sorted by total spend in the selected range</p>
      </div>

      {trends.length === 0 ? (
        <p className="finance-empty-state">No expense activity is available for the selected range.</p>
      ) : (
        <div className="analytics-category-list">
          {trends.map((trend) => (
            <article className="analytics-category-card" key={trend.categoryId}>
              <div className="analytics-category-card__header">
                <div>
                  <p className="finance-panel__eyebrow">Category</p>
                  <h3>{trend.categoryName}</h3>
                </div>
                <strong>{formatCurrency(trend.totalSpent)}</strong>
              </div>

              <div
                className="analytics-category-card__bar"
                style={{ width: `${(trend.totalSpent / maxCategorySpend) * 100}%` }}
              />

              <div className="analytics-category-card__meta">
                <span>Average {formatCurrency(trend.averageMonthlySpent)} / month</span>
                <span>
                  Current {formatCurrency(trend.currentMonthSpent)} vs previous{' '}
                  {formatCurrency(trend.previousMonthSpent)}
                </span>
              </div>

              <div className="analytics-mini-series">
                {trend.monthlyPoints.map((point) => (
                  <div className="analytics-mini-series__item" key={point.month}>
                    <span>{formatMonthLabel(point.month)}</span>
                    <strong>{formatCurrency(point.amount)}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
