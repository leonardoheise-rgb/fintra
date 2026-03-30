import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { translateAppText } from '../../../shared/i18n/appText';
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
          <p className="finance-panel__eyebrow">{translateAppText('analytics.categoryDrift')}</p>
          <h2>{translateAppText('analytics.spendingByCategory')}</h2>
        </div>
        <p className="analytics-panel__caption">{translateAppText('analytics.sortedBySpend')}</p>
      </div>

      {trends.length === 0 ? (
        <p className="finance-empty-state">{translateAppText('analytics.noExpenseActivity')}</p>
      ) : (
        <div className="analytics-category-list">
          {trends.map((trend) => (
            <article className="analytics-category-card" key={trend.categoryId}>
              <div className="analytics-category-card__header">
                <div>
                  <p className="finance-panel__eyebrow">{translateAppText('analytics.categoryLabel')}</p>
                  <h3>{trend.categoryName}</h3>
                </div>
                <strong>{formatCurrency(trend.totalSpent)}</strong>
              </div>

              <div
                className="analytics-category-card__bar"
                style={{ width: `${(trend.totalSpent / maxCategorySpend) * 100}%` }}
              />

              <div className="analytics-category-card__meta">
                <span>
                  {translateAppText('analytics.averagePerMonth', {
                    amount: formatCurrency(trend.averageMonthlySpent),
                  })}
                </span>
                <span>
                  {translateAppText('analytics.currentVsPreviousShort', {
                    current: formatCurrency(trend.currentMonthSpent),
                    previous: formatCurrency(trend.previousMonthSpent),
                  })}
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
