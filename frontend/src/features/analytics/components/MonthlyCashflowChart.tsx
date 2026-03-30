import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { translateAppText } from '../../../shared/i18n/appText';
import type { MonthlyAnalyticsPoint } from '../analytics.types';

type MonthlyCashflowChartProps = {
  monthlyPoints: MonthlyAnalyticsPoint[];
};

function getMaxValue(monthlyPoints: MonthlyAnalyticsPoint[]) {
  const values = monthlyPoints.flatMap((point) => [point.income, point.expenses]);

  return Math.max(...values, 1);
}

export function MonthlyCashflowChart({ monthlyPoints }: MonthlyCashflowChartProps) {
  const maxValue = getMaxValue(monthlyPoints);

  return (
    <section className="finance-panel analytics-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('analytics.trendSurface')}</p>
          <h2>{translateAppText('analytics.incomeVsExpenses')}</h2>
        </div>
        <p className="analytics-panel__caption">{translateAppText('analytics.groupedBars')}</p>
      </div>

      <div className="analytics-chart">
        {monthlyPoints.map((point) => (
          <article className="analytics-chart__group" key={point.month}>
            <div className="analytics-chart__bars">
              <div
                className="analytics-chart__bar analytics-chart__bar--income"
                style={{ height: `${(point.income / maxValue) * 100}%` }}
                title={translateAppText('analytics.incomeTitle', {
                  amount: formatCurrency(point.income),
                })}
              />
              <div
                className="analytics-chart__bar analytics-chart__bar--expense"
                style={{ height: `${(point.expenses / maxValue) * 100}%` }}
                title={translateAppText('analytics.expensesTitle', {
                  amount: formatCurrency(point.expenses),
                })}
              />
            </div>
            <div className="analytics-chart__labels">
              <strong>{formatMonthLabel(point.month)}</strong>
              <span>
                {translateAppText('analytics.netLabel', {
                  amount: formatCurrency(point.netBalance),
                })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
