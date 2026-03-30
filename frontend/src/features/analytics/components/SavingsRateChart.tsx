import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { formatPercentage } from '../../../shared/lib/formatters/percentage';
import { translateAppText } from '../../../shared/i18n/appText';
import type { MonthlyAnalyticsPoint } from '../analytics.types';

type SavingsRateChartProps = {
  monthlyPoints: MonthlyAnalyticsPoint[];
};

function getMaxMagnitude(monthlyPoints: MonthlyAnalyticsPoint[]) {
  const maxMagnitude = Math.max(
    ...monthlyPoints.map((point) => Math.abs(point.savingsRate)),
    10,
  );

  return maxMagnitude;
}

export function SavingsRateChart({ monthlyPoints }: SavingsRateChartProps) {
  const maxMagnitude = getMaxMagnitude(monthlyPoints);

  return (
    <section className="finance-panel analytics-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('analytics.savingsBehavior')}</p>
          <h2>{translateAppText('analytics.savingsRateTrend')}</h2>
        </div>
        <p className="analytics-panel__caption">{translateAppText('analytics.positiveNegativeRate')}</p>
      </div>

      <div className="analytics-rate-chart">
        {monthlyPoints.map((point) => {
          const magnitude = Math.abs(point.savingsRate);

          return (
            <article className="analytics-rate-chart__group" key={point.month}>
              <div className="analytics-rate-chart__track">
                <div
                  className={`analytics-rate-chart__fill${
                    point.savingsRate >= 0
                      ? ' analytics-rate-chart__fill--positive'
                      : ' analytics-rate-chart__fill--negative'
                  }`}
                  style={{ height: `${(magnitude / maxMagnitude) * 100}%` }}
                  title={formatPercentage(point.savingsRate)}
                />
              </div>
              <strong>{formatMonthLabel(point.month)}</strong>
              <span>{formatPercentage(point.savingsRate)}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
